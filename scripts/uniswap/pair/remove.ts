import { HardhatRuntimeEnvironment } from "hardhat/types";
import dotenv from "dotenv"
import {getContract, mainWallet, makeContract, sendTx, setupHRE} from "../../../utils/contract";
import hre from "hardhat";
import {BigNumber, ethers} from "ethers";
import {addLiquidity, getAddressLiquidity, removeLiquidity} from "../utils/router";
import {getPairInfo} from "../utils/info";

dotenv.config();

export async function run(hre: HardhatRuntimeEnvironment) {
  setupHRE(hre);

  const address = mainWallet().address;

  const weth = await getContract("WETH9");
  const usdt = await getContract("TestERC20", "USDT");

  await getPairInfo(weth.address, usdt.address, address)

  const liquidity = await getAddressLiquidity(address, weth.address, usdt.address)
  await removeLiquidity(
    [ weth.address, usdt.address ], BigNumber.from(liquidity).div(2)
  )

  await getPairInfo(weth.address, usdt.address, address)
}

run(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
