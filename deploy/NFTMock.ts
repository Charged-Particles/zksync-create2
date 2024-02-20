
import { deployContract } from "../utils/utils";

export default async function () {
  return await deployContract('NFTMock', ['Game of NTF', 'GONFT']);
}