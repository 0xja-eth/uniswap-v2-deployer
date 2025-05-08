import { HardhatRuntimeEnvironment } from "hardhat/types";
import dotenv from "dotenv"
import {mainWallet, makeContract, sendTx, setupHRE} from "../../utils/contract";
import hre from "hardhat";
import {ethers} from "ethers";
import {getPairInfo} from "./utils/info";

dotenv.config();

export async function deploy(hre: HardhatRuntimeEnvironment) {
  setupHRE(hre);

  const address = mainWallet().address;
  const feeTo = "0x6FE3Fc08dA6eE0e875E0BBa0b2547160AA534FC9"

  const [factory] = await makeContract("UniswapV2Factory", [address]);

  await sendTx(factory.setFeeTo(feeTo), `Setting feeTo to ${feeTo}`);
}

deploy(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
