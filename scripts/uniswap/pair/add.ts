import { HardhatRuntimeEnvironment } from "hardhat/types";
import dotenv from "dotenv"
import {getContract, mainWallet, makeContract, sendTx, setupHRE} from "../../../utils/contract";
import hre from "hardhat";
import {BigNumber, ethers} from "ethers";
import {addLiquidity, getReserves} from "../utils/router";
import {getPairInfo} from "../utils/info";

dotenv.config();

export async function run(hre: HardhatRuntimeEnvironment) {
  setupHRE(hre);

  const address = mainWallet().address;

  const token0 = await getContract("WETH9");
  const token1 = await getContract("TestERC20", "USDT");

  const router = await getContract('UniswapV2Router02');

  await getPairInfo(token0.address, token1.address, address)

  let token0Amount = ethers.utils.parseUnits("1")
  let token1Amount = ethers.utils.parseUnits("1800")

  let token0Reserve = BigNumber.from(0)
  let token1Reserve = BigNumber.from(0)
  try {
    [token0Reserve, token1Reserve] = await getReserves(token0.address, token1.address)
  } catch (e) {
    console.log(`Pair does not exist yet`, e)
  }

  console.log(`Reserves: ${ethers.utils.formatUnits(token0Reserve)} WETH, ${ethers.utils.formatUnits(token1Reserve)} USDT`)

  if (token0Amount.eq(0) && token1Amount.eq(0)) return
  if (token0Amount.eq(0))
    token0Amount = await router.quote(token1Amount, token1Reserve, token0Reserve)
  if (token1Amount.eq(0))
    token1Amount = await router.quote(token0Amount, token0Reserve, token1Reserve)

  console.log(`Add liquidity: ${ethers.utils.formatUnits(token0Amount)} WETH, ${ethers.utils.formatUnits(token1Amount)} USDT`)

  await addLiquidity(
    [ token0.address, token1.address ],
    [ token0Amount, token1Amount ]
  )

  await getPairInfo(token0.address, token1.address, address)
}

run(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
