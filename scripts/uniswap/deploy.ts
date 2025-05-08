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

  const [weth] = await makeContract("WETH9");
  const [usdt] = await makeContract("TestERC20", "USDT", ["USDT", "USDT", "100000000000000000000000"]);

  const feeTo = "0x6FE3Fc08dA6eE0e875E0BBa0b2547160AA534FC9" // Seed phrase #2

  const [factory] = await makeContract("UniswapV2Factory", [address]);
  const [router] = await makeContract("UniswapV2Router02", [factory.address, weth.address]);

  const INIT_CODE_PAIR_HASH = await factory.INIT_CODE_PAIR_HASH();

  await sendTx(factory.setFeeTo(feeTo), `setFeeTo(${feeTo})`);
  await sendTx(factory.createPair(weth.address, usdt.address), `createPair(${weth.address}, ${usdt.address})`);

  console.log(`WETH: ${weth.address}`);
  console.log(`USDT: ${usdt.address}`);
  console.log(`Factory: ${factory.address}`);
  console.log(`Router: ${router.address}`);
  console.log(`INIT_CODE_PAIR_HASH: ${INIT_CODE_PAIR_HASH}`);

  await getPairInfo(weth.address, usdt.address, address)
}

deploy(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
