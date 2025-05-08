import {BigNumber, Contract, ethers} from 'ethers';
import {getContract, mainWallet, saveContract, sendTx} from "../../../utils/contract";

const DefaultDeadlineDelta = 5 * 60;

export async function approve(token: Contract, address: string, spenderAddress: string, amount: BigNumber) {
  const symbol = await token.symbol();
  if (BigNumber.from(await token.allowance(mainWallet().address, spenderAddress)).lt(amount)) {
    console.log(`Approving ${ethers.utils.formatUnits(amount)} of ${symbol} to ${spenderAddress}`);
    await sendTx(token.approve(spenderAddress, amount), `tokenContract.approve(${spenderAddress}, ${amount})`);
  }
}
export async function fetchToken(tokenAddress: string) {
  const token = await getContract('TestERC20', 'TestERC20', tokenAddress);
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();

  console.log(`Token ${name}(${symbol}) at ${tokenAddress} with decimals ${decimals}`);
  return {token, name, symbol, decimals};
}

export async function doAddLiquidity(
  tokenAAddress: string,
  tokenBAddress: string,
  amountTokenADesired: BigNumber,
  amountTokenBDesired: BigNumber,
  amountTokenAMin: BigNumber,
  amountTokenBMin: BigNumber,
  accountAddress?: string,
  deadline = Math.floor(Date.now() / 1000) + DefaultDeadlineDelta,
) {
  const address = mainWallet().address;
  accountAddress ||= address;

  const {token: tokenA, symbol: symbolA} = await fetchToken(tokenAAddress);
  const {token: tokenB, symbol: symbolB} = await fetchToken(tokenBAddress);

  console.log(`Adding liquidity for ${symbolA} and ${symbolB}`);

  const router = await getContract('UniswapV2Router02');

  await approve(tokenA, address, router.address, amountTokenADesired);
  await approve(tokenB, address, router.address, amountTokenBDesired);

  try {
    await sendTx(router.addLiquidity(
      tokenAAddress, tokenBAddress,
      amountTokenADesired,
      amountTokenBDesired,
      amountTokenAMin,
      amountTokenBMin,
      accountAddress,
      deadline, // {gasLimit: 10000}
    ), `router.addLiquidity(${symbolA}, ${symbolB}, ${amountTokenADesired}, ${amountTokenBDesired}, ${amountTokenAMin}, ${amountTokenBMin}, ${accountAddress}, ${deadline})`);
  } catch (error) {
    console.error('Failed to add liquidity', error);
    throw error;
  }
}
export async function addLiquidity(
  tokens: [string, string],
  amounts: [BigNumber, BigNumber],
  slippages: number | [number, number] = 2,
  accountAddress?: string,
  deadline = Math.floor(Date.now() / 1000) + DefaultDeadlineDelta,
) {
  slippages = Array.isArray(slippages) ? slippages : [slippages, slippages];

  return doAddLiquidity(
    tokens[0], tokens[1],
    amounts[0], amounts[1],
    BigNumber.from(amounts[0].mul(100 - slippages[0]).div(100)),
    BigNumber.from(amounts[1].mul(100 - slippages[1]).div(100)),
    accountAddress,
    deadline
  );
}

export async function doRemoveLiquidity(
  tokenAAddress: string,
  tokenBAddress: string,
  liquidity: BigNumber,
  amountAMin: BigNumber,
  amountBMin: BigNumber,
  accountAddress?: string,
  deadline = Math.floor(Date.now() / 1000) + DefaultDeadlineDelta,
) {
  const address = mainWallet().address;
  accountAddress ||= address;

  const {symbol: symbolA} = await fetchToken(tokenAAddress);
  const {symbol: symbolB} = await fetchToken(tokenBAddress);

  const factory = await getContract('UniswapV2Factory');
  const pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
  const pair = await saveContract("UniswapV2Pair", pairAddress,
    `${symbolA.toUpperCase()}-${symbolB.toUpperCase()}`);

  console.log(`Removing ${liquidity} liquidity for ${symbolA} and ${symbolB}`);

  const router = await getContract('UniswapV2Router02');

  await approve(pair, address, router.address, liquidity);

  try {
    await sendTx(router.removeLiquidity(
      tokenAAddress, tokenBAddress,
      liquidity,
      amountAMin,
      amountBMin,
      accountAddress,
      deadline, // {gasLimit: 10000}
    ), `router.removeLiquidity(${symbolA}, ${symbolB}, ${liquidity}, ${amountAMin}, ${amountBMin}, ${accountAddress}, ${deadline})`);
  } catch (error) {
    console.error('Failed to remove liquidity', error);
    throw error;
  }
}
export async function removeLiquidity(
  tokens: [string, string],
  liquidity: BigNumber,
  slippages: number | [number, number] = 5,
  accountAddress?: string,
  deadline = Math.floor(Date.now() / 1000) + DefaultDeadlineDelta,
) {
  slippages = Array.isArray(slippages) ? slippages : [slippages, slippages];

  const total = await getLiquidity(tokens[0], tokens[1]);
  const [reserveA, reserveB] = await getReserves(tokens[0], tokens[1]);

  const amountADesired = reserveA.mul(liquidity.mul(10000).div(total)).div(10000);
  const amountBDesired = reserveB.mul(liquidity.mul(10000).div(total)).div(10000);

  const amountAMin = amountADesired.mul(100 - slippages[0]).div(100);
  const amountBMin = amountBDesired.mul(100 - slippages[1]).div(100);

  console.log(`Total: ${total}, Withdraw ${liquidity}, ${liquidity.mul(100).div(total)}%`);
  console.log(`Reserve: ${reserveA}, ${reserveB}`);
  console.log(`Amounts: ${amountADesired}, ${amountBDesired}`);

  return doRemoveLiquidity(
    tokens[0], tokens[1],
    liquidity, amountAMin, amountBMin,
    accountAddress,
    deadline
  );
}

export async function swapTokens(
  amountIn: BigNumber,
  amountOutMin: BigNumber,
  path: string[],
  to?: string,
  deadline = Math.floor(Date.now() / 1000) + DefaultDeadlineDelta,
) {
  const address = mainWallet().address;
  to ||= address;

  const firstToken = await getContract('TestERC20', 'FirstToken', path[0]);
  const router = await getContract('UniswapV2Router02');

  await approve(firstToken, address, router.address, amountIn);

  try {
    await sendTx(router.swapExactTokensForTokens(
      amountIn, amountOutMin, path, to, deadline
    ), `router.swapExactTokensForTokens(${amountIn}, ${amountOutMin}, ${path}, ${to}, ${deadline})`);
  } catch (error) {
    console.error('Swap failed', error);
    throw error;
  }
}

export async function swap(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  slippage = 5,
  to?: string,
  deadline = Math.floor(Date.now() / 1000) + DefaultDeadlineDelta,
) {
  const {symbol: symbolIn} = await fetchToken(tokenIn);
  const {symbol: symbolOut} = await fetchToken(tokenOut);

  const router = await getContract('UniswapV2Router02');
  const amountOutMin = (await router.getAmountsOut(amountIn, [tokenIn, tokenOut]))[1]

  console.log(`Swapping ${amountIn} ${symbolIn} for at least ${amountOutMin} ${symbolOut} (${slippage}%)`);

  await swapTokens(amountIn, amountOutMin, [tokenIn, tokenOut], to, deadline);
}

export async function getReserves(tokenA: string, tokenB: string) {
  const factory = await getContract('UniswapV2Factory');
  const pairAddress = await factory.getPair(tokenA, tokenB);
  console.log(`Pair address: ${pairAddress}`);

  const pair = await getContract("UniswapV2Pair", "UniswapV2Pair", pairAddress);

  const reserves = await pair.getReserves();

  return tokenA < tokenB ? [reserves[0], reserves[1]] : [reserves[1], reserves[0]];
}

export async function getPrice(tokenIn: string, tokenOut: string, amountIn = BigNumber.from(1)) {
  const [reserveIn, reserveOut] = await getReserves(tokenIn, tokenOut);
  // const reserveIn = tokenIn < tokenOut ? reserves[0] : reserves[1];
  // const reserveOut = tokenIn < tokenOut ? reserves[1] : reserves[0];

  return reserveOut.eq(0) || reserveIn.eq(0) ?
    BigNumber.from(0) : reserveOut.mul(1000).mul(amountIn).div(reserveIn).toNumber() / 1000;
}

export async function getAddressLiquidity(address: string, tokenA: string, tokenB: string) {
  const factory = await getContract('UniswapV2Factory');
  const pairAddress = await factory.getPair(tokenA, tokenB);
  const pair = await getContract("UniswapV2Pair", "UniswapV2Pair", pairAddress);

  return pair.balanceOf(address);
}
export async function getLiquidity(tokenA: string, tokenB: string) {
  const factory = await getContract('UniswapV2Factory');
  const pairAddress = await factory.getPair(tokenA, tokenB);
  const pair = await getContract("UniswapV2Pair", "UniswapV2Pair", pairAddress);

  return pair.totalSupply();
}
