import { HardhatRuntimeEnvironment } from "hardhat/types";
import dotenv from "dotenv"
import {mainWallet, makeContract, sendTx, setupHRE} from "../../utils/contract";
import hre from "hardhat";
import {ethers} from "ethers";
import {getPairInfo} from "./utils/info";

dotenv.config();

export async function deploy(hre: HardhatRuntimeEnvironment) {
  setupHRE(hre);

  const targets = ["0x72F8D621AC142F0a7De0C818A5a721470BD28dc1"];

  const [usdt] = await makeContract("TestERC20", "USDT", ["Tether", "USDT", "10000000000000000000000000000"]);
  const [usdc] = await makeContract("TestERC20", "USDC", ["USD Coin", "USDC", "10000000000000000000000000000"]);
  const [pepe] = await makeContract("TestERC20", "PEPE", ["Pepe Coin", "PEPE", "10000000000000000000000000000"]);

  const tokens = [usdt, usdc, pepe]
  const names = ["USDT", "USDC", "PEPE"];

  const values = [100, 100, 1]; // in 10^18wei

  for (const target of targets) {
    console.log(`Sending tokens for ${target}`);
    for (let i = 0; i < tokens.length; i++) {
      const wei = ethers.utils.parseEther(values[i].toString())
      await sendTx(tokens[i].transfer(target, wei), `Sending ${values[i]} ${names[i]} to ${target}`);
    }
  }
}

deploy(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
