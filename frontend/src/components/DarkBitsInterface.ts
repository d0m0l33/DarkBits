export const DarkBitsInterface = [
    "function getDefaultName(uint256 tokenId) public view returns (string memory)",
    "function getDefaultNames() public view returns (string[] memory)",
    "function requestMint() public payable",
    "function balanceOf(address account, uint256 id) public view returns (uint256)",
    "function uri(uint256) public view returns (string memory)",
    "function getTokenCount() public view returns (uint256)",
    "function getMintsForClass(uint256 darkEthClass) public view returns (uint256)",
    "function balanceOfBatch(address[] memory accounts,uint256[] memory ids) public view returns (uint256[] memory)",
    "function getMintsForAddress(address extenalParty) public view returns (uint256)",    
    "function safeTransferFrom( address from, address to, uint256 id, uint256 amount, bytes calldata data) public",
    "function claimMintReward() public payable",
    "function getRewardAvailability() public view returns (bool)",
    "function getAWethBalance() public view returns (uint256)",
    "function transferToTreasury() public",
    "function mintCounter() view public returns (uint)",
    "function setApprovalForAll(address operator, bool approved) public"
];