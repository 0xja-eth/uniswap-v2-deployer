import { HardhatRuntimeEnvironment } from "hardhat/types";
import dotenv from "dotenv"
import {getContract, mainWallet, makeContract, sendTx, setupHRE} from "../../utils/contract";
import hre from "hardhat";
import {BigNumber, ethers} from "ethers";
import {getPairInfo} from "./utils/info";
import {addLiquidity, getAddressLiquidity, removeLiquidity} from "./utils/router";

dotenv.config();

export async function removePairs(hre: HardhatRuntimeEnvironment) {
  setupHRE(hre);

  const address = mainWallet().address;

  const pairAddresses = [
  ]
  const removeRate = 100; // 100%

  for (const pairAddress of pairAddresses) {
    const pair = await getContract("UniswapV2Pair", pairAddress, pairAddress);

    const token0 = await pair.token0();
    const token1 = await pair.token1();

    const liquidity = await getAddressLiquidity(address, token0, token1)

    await getPairInfo(token0, token1, address);

    if (liquidity.eq(0)) {
      console.log("No liquidity found");
      continue;
    }

    await removeLiquidity(
      [ token0, token1 ], BigNumber.from(liquidity)
        .mul(removeRate).div(100)
    )
  }
}

removePairs(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
