import {BigNumber, Contract, ethers} from 'ethers';
import {getContract, hre, mainWallet, saveContract, sendTx} from "../../../utils/contract";
import {fetchToken, getAddressLiquidity, getLiquidity, getPrice, getReserves} from "./router";

export async function getPairInfo(tokenAAddress: string, tokenBAddress: string, address?) {

  const {token: tokenA, symbol: symbolA} = await fetchToken(tokenAAddress);
  const {token: tokenB, symbol: symbolB} = await fetchToken(tokenBAddress);

  try {
    const totalLiquidity = await getLiquidity(tokenAAddress, tokenBAddress)
    const a2bPrice = await getPrice(tokenAAddress, tokenBAddress)
    const b2aPrice = await getPrice(tokenBAddress, tokenAAddress)

    const [tokenAReserve, tokenBReserve] = await getReserves(tokenAAddress, tokenBAddress)
    // const tokenAReserve = tokenAAddress < tokenBAddress ? reserves[0] : reserves[1];
    // const tokenBReserve = tokenAAddress < tokenBAddress ? reserves[1] : reserves[0];

    console.log(`==== ${symbolA}${symbolB} Pair Info ====`)
    console.log(`Total Liquidity: ${ethers.utils.formatUnits(totalLiquidity)}`)
    console.log(`${symbolA} Reserve: ${ethers.utils.formatUnits(tokenAReserve)}`)
    console.log(`${symbolB} Reserve: ${ethers.utils.formatUnits(tokenBReserve)}`)
    console.log(`${symbolA}/${symbolB} Price: ${a2bPrice}`)
    console.log(`${symbolB}/${symbolA} Price: ${b2aPrice}`)
  } catch (e) {
    console.log(`Pair does not exist yet`, e)
  }

  if (address) {
    const balance = await hre.ethers.provider.getBalance(address);

    const tokenABalance = await tokenA.balanceOf(address)
    const tokenBBalance = await tokenB.balanceOf(address)

    console.log(`==== ${address} Info ====`)
    console.log(`ETH Balance: ${ethers.utils.formatUnits(balance)}`)
    console.log(`${symbolA} Balance: ${ethers.utils.formatUnits(tokenABalance)}`)
    console.log(`${symbolB} Balance: ${ethers.utils.formatUnits(tokenBBalance)}`)
    try {
      const liquidity = await getAddressLiquidity(address, tokenAAddress, tokenBAddress)
      console.log(`Liquidity: ${ethers.utils.formatUnits(liquidity)}`)
    } catch (e) {
      console.log(`No liquidity`, e)
    }
  }
}
