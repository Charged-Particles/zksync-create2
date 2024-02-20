
import { deployContract } from "../utils/utils";

export default async function () {
  return await deployContract('ERC6551zkSyncRegistry', []);
}