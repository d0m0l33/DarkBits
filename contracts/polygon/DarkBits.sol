// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol"; 
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol"; 
import "../interfaces/ILendingPool.sol";
import "../interfaces/ILendingPoolAddressesProvider.sol";
import "../interfaces/IWETHGateway.sol";  
   
pragma experimental ABIEncoderV2;

contract DarkBits is ERC1155Supply, ReentrancyGuard, Ownable {
    using SafeMath for uint256;


    uint256 public constant MINT_LIMIT = 100000; 
    uint256 public constant MINIMUM_MINTS_FOR_CLAIM = 10; // users must mint atleast 10 times to qualify for rewards 
    uint256 public constant MINTS_SINCE_CLAIM_THRESHOLD = 100; // # of mints needed since last claim for rewards window to be available
    uint256 public constant MINT_PRICE = 2 ether;  // where msg.value === 2 MATIC
    uint256 public constant TRANSFER_TO_TREASURY_MINT_THRESHOLD = MINT_LIMIT/5; 
    uint public mintCounter; // tracks total number of mints
    uint256 public newMintsSinceClaim; // tracks mints since last claim. reset for every claim. claims can be made when this value == MINTS_SINCE_CLAIM_THRESHOLD
    uint private randNonce; 
    bool private isRewardAvailable; // window for pre mint limit reward claims
    bool private leftOverRewardsChecked; // any pre mint rewards not claimed after mint period
    address  amMATIC = 0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4; // amMATIC address
    address treasuryAddress = 0x2aE55e69DAc53b9b03DC7fB6274153A6f94f7d06; // Dark Bits Treasury
    IWETHGateway wethGateway; 
    ILendingPool lendingPool;
    ILendingPoolAddressesProvider lendingPoolAddressesProvider; // AAVE Lending Pool Addresses Provider

    event EntityMinted(
        address indexed minter,
        uint256 indexed entityClass,
        uint256 indexed amount
    ); 


    event MintRewardClaimed(
        address indexed claimer,
        uint indexed amount
    ); 

    // base level organisms and elements
    string[] private defaultDarkBitsEntities = [
        "Element 0",
        "Class 1 Element",
        "Class 2 Element",
        "Class 3 Element",
        "Class 4 Element",
        "Class 5 Element",
        "Class 6 Element",
        "Class 7 Organism",
        "Class 8 Organism",
        "Class 9 Organism",
        "Organism 10"
    ];

    // default mint balances per class. array index == class
    uint256[] private initialMintClassBalances = [
            1,
            1,
            2,
            10,
            10,
            100,
            100,        
            5,
            2,
            1,
            1      
        ];

    // tracks # of mints per address
    mapping(address => uint256) private addressMintCount;

    constructor(
    )  ERC1155("")
     {
      
        lendingPoolAddressesProvider = ILendingPoolAddressesProvider(0xd05e3E715d945B59290df0ae8eF85c1BdB684744);
        wethGateway = IWETHGateway(0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97);
        randNonce = 0;
        mintCounter = 0;
        newMintsSinceClaim = 0;
        isRewardAvailable = false;
        leftOverRewardsChecked = false;
    }

    function requestMint() public payable nonReentrant
    {
        require(mintCounter < MINT_LIMIT , "Dark Bits minting finished!");
        require(MINT_PRICE <= msg.value, "Must send 2 MATIC.");
        mintRandomEntity();
    }

    function getDefaultName(uint256 tokenId) public view returns (string memory) {
        require(isInRange(tokenId) == true , "Invalid class. Must be between 0 and 10 inclusive.");
        return defaultDarkBitsEntities[tokenId];
    }

    function getDefaultNames() public view returns (string[] memory) {
        return defaultDarkBitsEntities;
    }

    // get number of times an extenal party mints an entity
    function getMintsForAddress(address minterAddress) public view returns (uint256) {
        return addressMintCount[minterAddress];
    }

    function hasPreMintLeftoverRewards() internal returns (bool) {
        // only checking this once
        if(leftOverRewardsChecked == true){
            return false;
        }
        // unclaimed rewards after mint window
        if(mintCounter == MINT_LIMIT && address(this).balance > 0) {
            leftOverRewardsChecked = true;
            return true;
        }
        return false;
    } 
    
    function claimMintReward() public nonReentrant 
    {
        require(getMintsForAddress(msg.sender) >= MINIMUM_MINTS_FOR_CLAIM, "You must mint at least 10 times to qualify for reward.");
        if(mintCounter == MINT_LIMIT) {
            require(hasPreMintLeftoverRewards() == true, "There are no more rewards available.");
            doRewardClaim();
        } else {
            require(isRewardAvailable == true, "Transaction threshold not met. Rewards currently unavailable.");
            doRewardClaim();
        }
    }

    function transferToTreasury() public onlyOwner {
        require(mintCounter >= TRANSFER_TO_TREASURY_MINT_THRESHOLD, "Threshold not met. Transfer cannot be completed at this time.");
        require(IERC20(amMATIC).balanceOf(address(this)) > 0, "Contract has empty amMATIC balance.");
    
        IERC20(amMATIC).approve(treasuryAddress, IERC20(amMATIC).balanceOf(address(this)));
        IERC20(amMATIC).transfer(treasuryAddress, IERC20(amMATIC).balanceOf(address(this))); 
    }

    function getRewardAvailability() public view returns (bool) {
        return isRewardAvailable;
    }

    function getAMATICBalance() public view returns (uint256) {
        return IERC20(amMATIC).balanceOf(address(this));
    }

    function generateDarkBitsId(uint256 randomValue) internal pure returns (uint256) {
        return expand(randomValue, 10);
    }

    function expand(uint256 randomValue, uint256 n) internal pure returns (uint256 id) {
        for (uint256 i = 0; i < n; i++) {
            id += (uint256(keccak256(abi.encode(randomValue, i))) % 2);
        }
        return id;
    }

    function isInRange(uint256 value) internal pure returns (bool) {
        if(value < 0 || value > 10) {
          return false;
        }
        return true;
    }

    function doRewardClaim() internal 
    {
        require(address(this).balance > 0 , "Contract balance is empty.");
        // matic to be deposited in exchange for amMatic
        // this value grows and resets after a claim is made
        uint accruedFees =  address(this).balance;
        // 50% of accrued fees
        uint reward = (accruedFees/10).mul(5); 
        // deposit all accrued fees in MATIC to AAVE WMATIC lending pool in exchange for amMATIC
        // amMATIC obtained is at a 1:1 ratio to MATIC/WMATIC deposited
        address wMaticLendingPool = lendingPoolAddressesProvider.getLendingPool();
        wethGateway.depositETH{value: accruedFees }(wMaticLendingPool, address(this), 0);
        // send reward in amMATIC to user
        IERC20(amMATIC).approve(msg.sender, reward);
        IERC20(amMATIC).transfer(msg.sender, reward);
        // reset new mints since last claim
        newMintsSinceClaim = 0;
        isRewardAvailable = false;
        emit MintRewardClaimed(msg.sender, reward);
    }

    function mintRandomEntity() internal  {
        uint256 darkBitsId = generateDarkBitsId(rand());
        uint256 mintBalance = initialMintClassBalances[darkBitsId];
        _mint(msg.sender, darkBitsId, mintBalance, "");
        addressMintCount[msg.sender] = addressMintCount[msg.sender] + 1;
        mintCounter = mintCounter + 1;
        newMintsSinceClaim  = newMintsSinceClaim + 1;
        if(newMintsSinceClaim >= MINTS_SINCE_CLAIM_THRESHOLD) {
            isRewardAvailable = true;
        }
        
        emit EntityMinted(msg.sender, darkBitsId, mintBalance); 
    }

    function rand() internal returns (uint256) 
    {
        randNonce++;  
        return uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender,randNonce)));
    }
}