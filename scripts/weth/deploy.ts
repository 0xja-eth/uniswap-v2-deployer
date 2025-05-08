import { HardhatRuntimeEnvironment } from "hardhat/types";
import dotenv from "dotenv"
import {makeContract, sendTx, setupHRE} from "../../utils/contract";
import hre from "hardhat";
import {ethers} from "ethers";

dotenv.config();

export async function deploy(hre: HardhatRuntimeEnvironment) {
  setupHRE(hre);

  const [weth] = await makeContract("WETH9");

  console.log(`WETH: ${weth.address}`);
}

deploy(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
