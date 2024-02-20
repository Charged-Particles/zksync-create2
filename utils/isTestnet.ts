import { network } from 'hardhat';

export const isTestnet = () => {
  const chainId = network.config.chainId ?? 1;
  if (chainId === 1 || chainId === 137 || chainId == 300) {
    return false;
  }
  return true;
};
