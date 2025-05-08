import { HardhatRuntimeEnvironment } from "hardhat/types";
import dotenv from "dotenv"
import {mainWallet, makeContract, sendTx, setupHRE} from "../../utils/contract";
import hre from "hardhat";
import {ethers} from "ethers";
import {getPairInfo} from "./utils/info";

dotenv.config();

export async function deploy(hre: HardhatRuntimeEnvironment) {
  setupHRE(hre);

  const [usdt] = await makeContract("TestERC20", "USDT", ["Tether", "USDT", "10000000000000000000000000000"]);
  const [usdc] = await makeContract("TestERC20", "USDC", ["USD Coin", "USDC", "10000000000000000000000000000"]);
  const [pepe] = await makeContract("TestERC20", "PEPE", ["Pepe Coin", "PEPE", "10000000000000000000000000000"]);
}

deploy(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
