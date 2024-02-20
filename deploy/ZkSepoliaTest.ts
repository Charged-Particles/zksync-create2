import { Wallet, Provider, Contract, utils } from "zksync-ethers";
import { ethers } from "ethers";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { getProvider, getWallet } from '../utils/utils';
import DeployAll from './DeployAll';
import DeployERC20Mock from './ERC20Mock';
import DeployNFTMock from './NFTMock';

const salt = ethers.encodeBytes32String('');
const input = ethers.encodeBytes32String('');
const chainId = 1;

let _smartAccountHash: Uint8Array;
let _nftMockAddress: string = '';
let _erc20MockAddress: string = '';

let _zkSyncRegistry: Contract;
let _nftMock: Contract;
let _erc20Mock: Contract;

let _provider: Provider;
let _wallet: Wallet;
let _walletAddress: string;
let _deployer: Deployer;

const calculateAccountAddress = async () => {
  const newAccountAddress = utils.create2Address(
    _walletAddress,
    _smartAccountHash,
    salt,
    input,
  );
  return newAccountAddress;
};

export default async function () {
  _provider = getProvider();
  _wallet = getWallet();
  _deployer = new Deployer(hre, _wallet);
  _walletAddress = _wallet.address;

  const { zkSyncRegistry, smartAccountHash } = await DeployAll();
  _zkSyncRegistry = zkSyncRegistry;
  _smartAccountHash = smartAccountHash;

  console.log(`Deploying Mock ERC20 Token...`);
  const { contract: erc20Mock, address: erc20MockAddress } = await DeployERC20Mock();
  _erc20Mock = erc20Mock;
  _erc20MockAddress = erc20MockAddress;

  console.log(`Deploying Mock NFT Contract...`);
  const { contract: nftMock, address: nftMockAddress } = await DeployNFTMock();
  _nftMock = nftMock;
  _nftMockAddress = nftMockAddress;

  console.log(`Minting Mock Tokens...`);
  await _erc20Mock.mint(_walletAddress, 10000n).then(tx => tx.wait());
  const tokenBalance = await _erc20Mock.balanceOf(_walletAddress);
  console.log(`Token Balance: ${tokenBalance}`);

  console.log(`Minting Mock NFT...`);
  const nftBalance = await _nftMock.balanceOf(_walletAddress);
  await _nftMock.mint(_walletAddress, nftBalance + 1n).then(tx => tx.wait());
  const newNftBalance = await _nftMock.balanceOf(_walletAddress);
  console.log(`New NFT Balance: ${newNftBalance}`);

  // Calculate Expected Account Address via Registry
  const tokenId = 1;
  const newAccountAddress = await calculateAccountAddress();
  console.log(`Expected Account Address: ${newAccountAddress}`);

  // Try to Create SmartAccount by calling the Registry directly
  const txReceipt = await _zkSyncRegistry.createAccount(
    _smartAccountHash,
    salt,
    chainId,
    _nftMockAddress,
    tokenId,
  ).then(tx => tx.wait());
  console.log(`txReceipt = ${txReceipt}`);
}