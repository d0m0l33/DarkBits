import { ethers } from "hardhat";
import { BigNumber, Contract, ContractFactory, Signer } from "ethers";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
chai.use(solidity);

const expect = chai.expect;
const assert = chai.assert;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';


// DarkBits contract must be created for mainnet with the following Aave parameters first
const DarkBitsEthereumMain = {
  AAVE_LENDING_POOL_ADDRESS_PROVIDER : '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
  WETH_GATEWAY :'0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04',
  A_WETH : '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e',
  AlCHEMY_CONFIG : {
    forking: {
      jsonRpcUrl: process.env.MAINNET_NODE_URL,
      blockNumber: 13420269,
    },
  },
  CONTRACT_NAME: 'DarkBits',
  MINT_PRICE: 0.004,
  VALUE_BELOW_PRICE: 0.003999,
}

const DarkBitsPolygon = {
  AAVE_LENDING_POOL_ADDRESS_PROVIDER : '0xd05e3E715d945B59290df0ae8eF85c1BdB684744',
  WETH_GATEWAY :'0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97',
  A_TOKEN: '0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4', // awMATIC
  AlCHEMY_CONFIG : {
    forking: {
      jsonRpcUrl: process.env.POLYGON_NODE_URL,
      blockNumber: 20351380,
    },
  },
  CONTRACT_NAME: 'DarkBits',
  MINT_PRICE: 2,
  VALUE_BELOW_PRICE: 1.9999,
}

const MINT_LIMIT = 1000;
const TRANSFER_TO_TREASURY_MINT_THRESHOLD = MINT_LIMIT/5;
const TRANSACTION_THRESHOLD = 100;
const CLAIMER_PERCENTAGE = 0.5;

// helper function to get total balance accross all entity classses for an address
const getBalance = async (address: string, darkBitsContract: Contract): Promise<number> => {
  let totalBalance: number = 0;
  for(let i=0;i<11;i++) {
    let balanceBignumber = await darkBitsContract.balanceOf(address, i);
    let formattedBalance = ethers.utils.formatEther(balanceBignumber);
    let balance = parseFloat(formattedBalance);
    totalBalance = totalBalance + balance;
  }
  return totalBalance;
}

// helper function to convert values to the valid formats used by test suite comparrison functions
const getFloatFromBN =(bn: BigNumber): number => {
  const valFloat =  parseFloat(ethers.utils.formatEther(bn));
  const standardized = valFloat.toFixed(3);
  return parseFloat(standardized);
}

// helper function to mint entities to signer
const doMintsForSigner = async (signer: Signer, darkBitsContract: Contract, numberOfMints: number): Promise<void> => {
  let overrides = {
    value: ethers.utils.parseEther(DarkBitsPolygon.MINT_PRICE.toString())
  };
  for(let i=0;i<numberOfMints;i++) {
    await darkBitsContract.connect(signer).requestMint(overrides);
  }
}


const getContract = (signer: Signer, contractAddress:string): Contract => {
  return  new ethers.Contract(contractAddress, [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
    "function transfer(address recipient, uint256 amount) external returns (bool)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
  ],signer);
}

describe("Dark Bits Deployment", function () {
  it("DarkBits has been deployed. has valid non null address", async function () {
    const darkBitsFactory = await ethers.getContractFactory(DarkBitsPolygon.CONTRACT_NAME);
    const darkBits = await darkBitsFactory.deploy();
    await darkBits.deployed();
    expect(darkBits.address).to.not.equal(NULL_ADDRESS);
  });
});


describe("Dark Bits Mint Actions", function () {
  this.timeout(3000000);
  let accounts: Signer[];
  let signerA: string;
  let signerB: string;
  let darkBitsFactory: ContractFactory;
  let darkBits: Contract;

  beforeEach(async function () {
    await ethers.provider.send(
      "hardhat_reset",
      [
        DarkBitsPolygon.AlCHEMY_CONFIG
     ],
   );
    accounts = await ethers.getSigners();
    signerA = await accounts[0].getAddress();
    signerB = await accounts[1].getAddress();
    darkBitsFactory = await ethers.getContractFactory(DarkBitsPolygon.CONTRACT_NAME);
    darkBits = await darkBitsFactory.deploy();    
    await darkBits.deployed();
  });

  it("Reverts if no MATIC is sent.", async function () {
    await expect(
      darkBits.requestMint()    
    ).to.be.revertedWith("Must send 2 MATIC.");  
  });

  it("Reverts if too little MATIC is sent.", async function () {
    let overrides = {
      value: ethers.utils.parseEther(DarkBitsPolygon.VALUE_BELOW_PRICE.toString())
    };
    await expect(
      darkBits.requestMint(overrides)    
    ).to.be.revertedWith("Must send 2 MATIC.");  
  });


  it("Reverts if mint limit is exceeded.", async function () {
    await doMintsForSigner(accounts[0], darkBits, MINT_LIMIT);
    await expect(
      darkBits.requestMint()    
    ).to.be.revertedWith("Dark Bits minting finished!");  
  });

  it("Successful if exact MATIC is sent.", async function () {
    let overrides = {
      value: ethers.utils.parseEther(DarkBitsPolygon.MINT_PRICE.toString())
    };
    await darkBits.requestMint(overrides);
    let mintCounter =  await darkBits.mintCounter();
    let balanceFirstAfterMint = await getBalance(signerA,darkBits);
    expect(mintCounter).to.equal(1);
    expect(balanceFirstAfterMint).to.be.greaterThan(0);
    await darkBits.requestMint(overrides);
    mintCounter =  await darkBits.mintCounter();
    let updatedBalance = await getBalance(signerA,darkBits);
    expect(mintCounter).to.equal(2);
    expect(updatedBalance).to.be.greaterThan(balanceFirstAfterMint);
  });

});

describe("Dark Bits Claim Reward Actions", function () {
  this.timeout(3000000);
  let accounts: Signer[];
  let signerA: string;
  let signerB: string;
  let darkBitsFactory: ContractFactory;
  let darkBits: Contract;
  let A_TOKEN: Contract;

   
  beforeEach(async function () {
    await ethers.provider.send(
      "hardhat_reset",
      [
        DarkBitsPolygon.AlCHEMY_CONFIG
     ],
   );
    accounts = await ethers.getSigners();
    signerA = await accounts[0].getAddress();
    signerB = await accounts[1].getAddress();
    darkBitsFactory = await ethers.getContractFactory(DarkBitsPolygon.CONTRACT_NAME);
    darkBits = await darkBitsFactory.deploy();    
    await darkBits.deployed();
    // getting aWeth token contract
    A_TOKEN = getContract(accounts[0], DarkBitsPolygon.A_TOKEN);

  });

  it("Reverts if pre mint claim made && address has made less than minimum mints needed.", async function () {
    await expect(
      darkBits.claimMintReward()    
    ).to.be.revertedWith("You must mint at least 10 times to qualify for reward.");  
  });


  it("Reverts if pre mint claim made && mint transaction threshold not met", async function () {
    const insufficientMintsForThreshold = TRANSACTION_THRESHOLD - 1;
    await doMintsForSigner(accounts[0], darkBits, insufficientMintsForThreshold);
    await expect(
      darkBits.claimMintReward()    
    ).to.be.revertedWith("Transaction threshold not met. Rewards currently unavailable.");  
  });


  it("Single address pre mint claim successful [exact threshold]", async function () {
    const rewardFeesAccrued = DarkBitsPolygon.MINT_PRICE * TRANSACTION_THRESHOLD; // 0.004 * 20 = 0.08
    const rewardClaim = rewardFeesAccrued  * CLAIMER_PERCENTAGE; // 50% of fees accrued at that point in time i.e. 0.04
    const bnRewardClaim = ethers.utils.parseEther(rewardClaim.toString());
    await doMintsForSigner(accounts[0], darkBits, TRANSACTION_THRESHOLD);
    await darkBits.claimMintReward();
    const signerBalance = await A_TOKEN.balanceOf(signerA);
    const balance = getFloatFromBN(signerBalance);
    const expectedRewardClaim = getFloatFromBN(bnRewardClaim);
    expect(balance).to.be.greaterThan(0);  
    expect(balance).to.be.eq(expectedRewardClaim);   
  });


  it("Multi address pre mint claim successful [exact threshold]", async function () {
    const rewardFeesAccrued = DarkBitsPolygon.MINT_PRICE * TRANSACTION_THRESHOLD; // 0.004 * 20 = 0.08
    const rewardClaim = rewardFeesAccrued * CLAIMER_PERCENTAGE; // 50% of fees accrued at that point in time i.e. 0.04
    const bnRewardClaim = ethers.utils.parseEther(rewardClaim.toString());
    await doMintsForSigner(accounts[0], darkBits, TRANSACTION_THRESHOLD);
    await darkBits.connect(accounts[0]).claimMintReward();
    const signerABalance = await A_TOKEN.balanceOf(signerA);
    const balanceA = getFloatFromBN(signerABalance);
    let expectedRewardClaimA = getFloatFromBN(bnRewardClaim);
    await doMintsForSigner(accounts[1], darkBits, TRANSACTION_THRESHOLD);
    await darkBits.connect(accounts[1]).claimMintReward();
    const signerBBalance = await A_TOKEN.balanceOf(signerB);
    const balanceB = getFloatFromBN(signerBBalance);
    const expectedRewardClaimB = getFloatFromBN(bnRewardClaim);

    expect(balanceA).to.be.greaterThan(0);  
    expect(balanceA).to.be.eq(expectedRewardClaimA);   
    expect(balanceB).to.be.greaterThan(0);  
    expect(balanceB).to.be.eq(expectedRewardClaimB);  
  });

  it("Single address pre mint claim successful [30 mints after threshold]", async function () {
    const beyondThreshold = MINT_LIMIT/2;
    const rewardFeesAccrued = DarkBitsPolygon.MINT_PRICE * beyondThreshold; // 0.004 * 50 = 0.2
    const rewardClaim = rewardFeesAccrued * CLAIMER_PERCENTAGE; // 50% of fees accrued at that point in time i.e. 0.1
    const bnRewardClaim = ethers.utils.parseEther(rewardClaim.toString());
    await doMintsForSigner(accounts[0], darkBits, beyondThreshold);
    await darkBits.claimMintReward();
    const signerBalance = await A_TOKEN.balanceOf(signerA);
    const balance = getFloatFromBN(signerBalance);
    const expectedRewardClaim = getFloatFromBN(bnRewardClaim);
    expect(balance).to.be.greaterThan(0);  
    expect(balance).to.be.eq(expectedRewardClaim);  
  });


  it("Single address post mint claim successful if leftover reward available", async function () {
    const beyondThreshold = MINT_LIMIT/2;
    const rewardFeesAccrued = DarkBitsPolygon.MINT_PRICE * beyondThreshold; // 0.004 * 50 = 0.2
    const rewardClaim = rewardFeesAccrued * CLAIMER_PERCENTAGE; // 50% of fees accrued at that point in time i.e. 0.1
    const bnRewardClaim = ethers.utils.parseEther(rewardClaim.toString());
    const totalRewards = DarkBitsPolygon.MINT_PRICE * MINT_LIMIT;
    await doMintsForSigner(accounts[0], darkBits, beyondThreshold);
    await darkBits.claimMintReward();
    const signerBalance1 = await A_TOKEN.balanceOf(signerA);
    const balance1 = getFloatFromBN(signerBalance1);
    const expectedRewardClaim1 = getFloatFromBN(bnRewardClaim);
    await doMintsForSigner(accounts[0], darkBits, beyondThreshold);
    await darkBits.claimMintReward();
    const signerBalance2 = await A_TOKEN.balanceOf(signerA);
    const balance2 = getFloatFromBN(signerBalance2);
    expect(balance1).to.be.greaterThan(0);  
    expect(balance1).to.be.eq(expectedRewardClaim1);  
    expect(balance2).to.be.greaterThan(expectedRewardClaim1); 
    expect(balance2).to.be.eq(totalRewards/2); 
  });

  it("Multi address post mint claim successful if leftover reward available", async function () {
    const beyondThreshold = MINT_LIMIT/2;
    const totalRewards = DarkBitsPolygon.MINT_PRICE * MINT_LIMIT;

    // signer A claims first premint reward
    await doMintsForSigner(accounts[0], darkBits, beyondThreshold);
    await darkBits.claimMintReward();
    let signerBalanceA = await A_TOKEN.balanceOf(signerA);
    let balanceA = getFloatFromBN(signerBalanceA);

    // signer B claims second reward i.e. leftover pre mint rewards
    await doMintsForSigner(accounts[1], darkBits, beyondThreshold);
    await darkBits.connect(accounts[1]).claimMintReward();
    const signerBalanceB = await A_TOKEN.balanceOf(signerB);
    const balanceB = getFloatFromBN(signerBalanceB);

    expect(balanceA).to.be.greaterThan(0);  
    expect(balanceA).to.be.eq(totalRewards/4);  
    expect(balanceB).to.be.greaterThan(0); 
    expect(balanceB).to.be.eq(totalRewards/4); 
  });

  it("Revert single address post mint claim if no leftover reward available", async function () {
    const beyondThreshold = MINT_LIMIT/2;
    
    await doMintsForSigner(accounts[0], darkBits, beyondThreshold);
    await darkBits.claimMintReward();

    await doMintsForSigner(accounts[0], darkBits, beyondThreshold);
    await darkBits.claimMintReward();

    // if no leftover rewards, revert
    await expect(
      darkBits.claimMintReward()    
    ).to.be.revertedWith("There are no more rewards available.");  
  });

});


describe("Dark Bits Community Actions", function () {
  this.timeout(3000000);
  let accounts: Signer[];
  let signerA: string;
  let signerB: string;
  let darkBitsFactory: ContractFactory;
  let darkBits: Contract;
  let aWETH: Contract;
  const DEFAULT_NAMES = [
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

   
  beforeEach(async function () {
    await ethers.provider.send(
      "hardhat_reset",
      [
        DarkBitsPolygon.AlCHEMY_CONFIG
     ],
   );
    accounts = await ethers.getSigners();
    signerA = await accounts[0].getAddress();
    signerB = await accounts[1].getAddress();
    darkBitsFactory = await ethers.getContractFactory(DarkBitsPolygon.CONTRACT_NAME);
    darkBits = await darkBitsFactory.deploy();    
    await darkBits.deployed();
    aWETH = getContract(accounts[0], DarkBitsPolygon.A_TOKEN);
  });


  it("getDefaultNames should return correct list of names.", async function () {
    const defaultNames: string[] = await darkBits.getDefaultNames();
    expect(defaultNames).to.be.eql(DEFAULT_NAMES);
    expect(defaultNames.length).to.be.eq(11);  
  });

  it("getDefaultName should return correct name given a valid id.", async function () {
    const element0: string = await darkBits.getDefaultName(0);
    const organism10: string = await darkBits.getDefaultName(10);
    expect(element0).to.be.eql(DEFAULT_NAMES[0]);
    expect(organism10).to.be.eql(DEFAULT_NAMES[10]);
  });

  it("Reverts if getDefaultName called with invalid ids.", async function () {
    await expect(
      darkBits.getDefaultName(11)    
    ).to.be.revertedWith("Invalid class. Must be between 0 and 10 inclusive."); 

    await expect(
      darkBits.getDefaultName(101)    
    ).to.be.revertedWith("Invalid class. Must be between 0 and 10 inclusive."); 

    await expect(
      darkBits.getDefaultName(-1)    
    ).to.be.reverted;
  });

  it("isRewardAvailable true if transaction threshold is hit.", async function () {
    const beyondThreshold = TRANSACTION_THRESHOLD;
    await doMintsForSigner(accounts[0], darkBits, beyondThreshold);
    const isRewardAvailable = await darkBits.getRewardAvailability();
    expect(
      isRewardAvailable
    ).to.eq(true);  
  });

  it("isRewardAvailable true if transaction threshold is exceeded.", async function () {
    const beyondThreshold = TRANSACTION_THRESHOLD * 2;
    await doMintsForSigner(accounts[0], darkBits, beyondThreshold);
    const isRewardAvailable = await darkBits.getRewardAvailability();
    expect(
      isRewardAvailable
    ).to.eq(true);  
  });

  it("isRewardAvailable false if transaction threshold not met.", async function () {
    const beyondThreshold = TRANSACTION_THRESHOLD * 2;
    await doMintsForSigner(accounts[0], darkBits, beyondThreshold);
    await darkBits.claimMintReward();
    const isRewardAvailable = await darkBits.getRewardAvailability();
    expect(
      isRewardAvailable
    ).to.eq(false);  
  });

  it("transferToTreasury Success if called by owner account && mint limit reached.", async function () {
    const beyondThreshold = MINT_LIMIT;
    const treasuryAddress = '0x2aE55e69DAc53b9b03DC7fB6274153A6f94f7d06';
    const expectedTotalTreasuryAWeth = (DarkBitsPolygon.MINT_PRICE * MINT_LIMIT)/2;

    
    await doMintsForSigner(accounts[0], darkBits, beyondThreshold);
    await darkBits.claimMintReward();
    await darkBits.transferToTreasury();
    const updatedContractBalanceBN =  await aWETH.balanceOf(darkBits.address);
    const convertedContractBalanceBN = getFloatFromBN(updatedContractBalanceBN);

    const updatedTreasuryAddressBN =  await aWETH.balanceOf(treasuryAddress);
    const convertedTreasuryBalance = getFloatFromBN(updatedTreasuryAddressBN);
    expect(
      convertedContractBalanceBN
    ).to.be.eq(0);  

    expect(
      convertedTreasuryBalance
    ).to.be.eq(expectedTotalTreasuryAWeth); 
  });

  it("Reverts if transferToTreasury called by another account && mint limit reached.", async function () {
    const beyondThreshold = MINT_LIMIT;
    
    await doMintsForSigner(accounts[0], darkBits, beyondThreshold);
    await expect(
      darkBits.connect(accounts[1]).transferToTreasury()
    ).to.be.revertedWith("Ownable: caller is not the owner");  
  });

  it("Reverts if transferToTreasury called by owner && before transfer threshold reached.", async function () {
    const lessThanTransferThreshold = TRANSFER_TO_TREASURY_MINT_THRESHOLD - 1;
    
    await doMintsForSigner(accounts[0], darkBits, lessThanTransferThreshold);
    await darkBits.claimMintReward();
    await expect(
      darkBits.transferToTreasury()    
    ).to.be.revertedWith("Threshold not met. Transfer cannot be completed at this time.");  
  });


  it("Reverts if transferToTreasury called when amMATIC balance is 0", async function () {
    const beyondThreshold = MINT_LIMIT;
    
    await doMintsForSigner(accounts[0], darkBits, beyondThreshold);
    await darkBits.claimMintReward();
    await darkBits.transferToTreasury();
    await expect(
      darkBits.transferToTreasury()    
    ).to.be.revertedWith("Contract has empty amMATIC balance."); 
  });

});
