
import DeployRegistry from './ERC6551zkSyncRegistry';
import DeploySmartAccount from './SmartAccount';

export default async function () {
  // Deploy zkSyncRegistry
  const { contract: zkSyncRegistry, address: zkSyncRegistryAddress, bytecodeHash: zkSyncRegistryHash } = await DeployRegistry();
  console.log(` -- ERC6551zkSyncRegistry Address: ${zkSyncRegistryAddress}`);
  console.log(` -- ERC6551zkSyncRegistry BytecodeHash: ${zkSyncRegistryHash}`);

  // Deploy SmartAccount
  const { contract: smartAccount, address: smartAccountAddress, bytecodeHash: smartAccountHash, bytecode: smartAccountBytecode } = await DeploySmartAccount();
  console.log(` -- SmartAccount Address: ${smartAccountAddress}`);
  console.log(` -- SmartAccount BytecodeHash: ${smartAccountHash}`);

  return {
    zkSyncRegistry,
    zkSyncRegistryAddress,
    smartAccount,
    smartAccountAddress,
    smartAccountHash,
  }
}