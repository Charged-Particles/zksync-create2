import { expect } from "chai";
import { Wallet, Contract, utils } from "zksync-ethers";
import { ethers } from "ethers";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { getWallet } from '../utils/utils';

import DeployRegistry from '../deploy/ERC6551zkSyncRegistry';
import DeploySmartAccount from '../deploy/SmartAccount';
import DeployERC20Mock from '../deploy/ERC20Mock';
import DeployNFTMock from '../deploy/NFTMock';

describe('ERC6551zkSyncRegistry', async function () {
  const salt = ethers.encodeBytes32String('');
  const input = ethers.encodeBytes32String('');
  const chainId = 1;

  let _zkSyncRegistry: Contract;
  let _nftMock: Contract;
  let _erc20Mock: Contract;
  let _nftMockAddress: string;
  let _wallet: Wallet;
  let _deployer: Deployer;
  let _smartAccountHash: Uint8Array;
  let _deployerAddress: string;

  const calculateAccountAddress = async () => {
    const newAccountAddress = utils.create2Address(
      _deployerAddress,
      _smartAccountHash,
      salt,
      input,
    );
    return newAccountAddress;
  };

  before(async function () {
    _wallet = getWallet();
    _deployer = new Deployer(hre, _wallet);
    _deployerAddress = _deployer.ethWallet.address;

    // Deploy ERC20 Mock
    const { contract: erc20Mock, address: erc20MockAddress } = await DeployERC20Mock();
    _erc20Mock = erc20Mock;

    // Deploy NFT Mock
    const { contract: nftMock, address: nftMockAddress } = await DeployNFTMock();
    _nftMock = nftMock;
    _nftMockAddress = nftMockAddress;

    // Deploy zkSyncRegistry
    const { contract: zkSyncRegistry, address: zkSyncRegistryAddress } = await DeployRegistry();
    _zkSyncRegistry = zkSyncRegistry;

    // Deploy SmartAccount
    const { bytecodeHash: smartAccountHash } = await DeploySmartAccount();
    _smartAccountHash = smartAccountHash;
  });

  it('Deploys a SmartAccount for an NFT', async function () {
    const tokenId = 1;

    await _nftMock.mint(_deployerAddress, tokenId).then(tx => tx.wait());
    expect(await _nftMock.balanceOf(_deployerAddress)).to.be.equal(1);

    await _erc20Mock.mint(_deployerAddress, 10000n).then(tx => tx.wait());
    expect(await _erc20Mock.balanceOf(_deployerAddress)).to.be.equal(10000n);

    // Calculate Expected Account Address via Registry
    const newAccountAddress = await calculateAccountAddress();
    expect(newAccountAddress).to.not.be.empty;

    // Try to Create SmartAccount by calling the Registry
    const txReceipt = await _zkSyncRegistry.createAccount(
      _smartAccountHash,
      salt,
      chainId,
      _nftMockAddress,
      1n,
    ).then(tx => tx.wait());
    console.log(`txReceipt = ${txReceipt}`);

    // // Confirm new SmartAccount was actually created
    // const provider = new Provider();
    // const smartAccountCode = await provider.getCode(newAccountAddress);
    // expect(smartAccountCode.replace('0x', '')).to.not.be.empty;

    // // Confirm SmartAccount Supports correct Interface
    // const smartAccountContract = await hre.zksyncEthers.getContractAt('SmartAccount', newAccountAddress);
    // const isSmartAccount = await smartAccountContract.supportsInterface(interfaceIds.ISmartAccount);
    // expect(isSmartAccount).to.be.true;

    // // Confirm SmartAccount knows its Parent Token
    // const smartAccountToken = await smartAccountContract.token();
    // expect(smartAccountToken).to.be.lengthOf(3);
    // expect(smartAccountToken[0]).to.be.equal(chainId);
    // expect(smartAccountToken[1]).to.be.equal(_nftMockAddress);
    // expect(smartAccountToken[2]).to.be.equal(tokenId);
  });
});
