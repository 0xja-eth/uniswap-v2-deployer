import { HardhatRuntimeEnvironment } from "hardhat/types";
import dotenv from "dotenv"
import {getContract, mainWallet, makeContract, sendTx, setupHRE} from "../../../utils/contract";
import hre from "hardhat";
import {BigNumber, ethers} from "ethers";
import {addLiquidity, swap} from "../utils/router";
import {getPairInfo} from "../utils/info";

dotenv.config();

export async function run(hre: HardhatRuntimeEnvironment) {
  setupHRE(hre);

  const address = mainWallet().address;

  const weth = await getContract("WETH9");
  const usdt = await getContract("TestERC20", "USDT");

  await getPairInfo(weth.address, usdt.address, address)

  // await swap(
  //   usdt.address, weth.address, ethers.utils.parseUnits("300")
  // )
  await swap(
    weth.address, usdt.address, ethers.utils.parseUnits("0.1")
  )

  await getPairInfo(weth.address, usdt.address, address)
}

run(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
