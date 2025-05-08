import { HardhatRuntimeEnvironment } from "hardhat/types";
import dotenv from "dotenv"
import {getContract, mainWallet, makeContract, sendTx, setupHRE} from "../../utils/contract";
import hre from "hardhat";
import {ethers} from "ethers";
import {getPairInfo} from "./utils/info";
import {addLiquidity} from "./utils/router";

dotenv.config();

export async function deploy(hre: HardhatRuntimeEnvironment) {
  setupHRE(hre);

  const weth = await getContract("WETH9");
  const usdt = await getContract("TestERC20", "USDT");
  const usdc = await getContract("TestERC20", "USDC");
  const pepe = await getContract("TestERC20", "PEPE");

  await addLiquidity([
    pepe.address, usdt.address
  ], [
    ethers.utils.parseEther("5000000000"), ethers.utils.parseEther("300000")
  ])
  await addLiquidity([
    usdc.address, usdt.address
  ], [
    ethers.utils.parseEther("100000"), ethers.utils.parseEther("100000")
  ])
  await addLiquidity([
    usdt.address, weth.address
  ], [
    ethers.utils.parseEther("18000"), ethers.utils.parseEther("10")
  ])
}

deploy(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
