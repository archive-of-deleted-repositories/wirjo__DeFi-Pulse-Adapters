/*==================================================
  Modules
  ==================================================*/

const sdk = require("../../sdk");
const abi = require("./abi.json");
const Bignumber = require("bignumber.js");

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  const startTimestamp = 1602054167;

  const ethAddress = "0x0000000000000000000000000000000000000000";
  let balances = {
    [ethAddress]: "0", // ETH
  };

  if (timestamp < startTimestamp) {
    return balances;
  }

  const bankAddress = "0x67b66c99d3eb37fa76aa3ed1ff33e8e39f0b9c7a";
  const WETHAddress = "***REMOVED***";

  const pools = [
    {
      name: "WETH/WBTC",
      tokenAddress: "***REMOVED***",
      goblinAddress: "0x41f07d87a28adec58dba1d063d540b86ccbb989f",
      lpTokenAddress: "***REMOVED***",
      lpStakingAddress: "0xCA35e32e7926b96A9988f61d510E038108d8068e",
    },
    {
      name: "WETH/USDC",
      tokenAddress: "***REMOVED***",
      goblinAddress: "0xb7bf6d2e6c4fa291d6073b51911bac17890e92ec",
      lpTokenAddress: "***REMOVED***",
      lpStakingAddress: "0x7FBa4B8Dc5E7616e59622806932DBea72537A56b",
    },
    {
      name: "WETH/USDT",
      tokenAddress: "***REMOVED***",
      goblinAddress: "0x4668ff4d478c5459d6023c4a7efda853412fb999",
      lpTokenAddress: "***REMOVED***",
      lpStakingAddress: "0x6C3e4cb2E96B01F4b866965A91ed4437839A121a",
    },
    {
      name: "WETH/DAI",
      tokenAddress: "***REMOVED***",
      goblinAddress: "0x14804802592c0f6e2fd03e78ec3efc9b56f1963d",
      lpTokenAddress: "***REMOVED***",
      lpStakingAddress: "0xa1484C3aa22a66C62b77E0AE78E15258bd0cB711",
    },
    {
      name: "WETH/DPI",
      tokenAddress: "***REMOVED***",
      goblinAddress: "0xdaa93955982d32451f90a1109ecec7fecb7ee4b3",
      lpTokenAddress: "***REMOVED***",
      lpStakingAddress: "0x8f06fba4684b5e0988f215a47775bb611af0f986",
    },
  ];

  const { output: _totalETH } = await sdk.api.abi.call({
    target: bankAddress,
    block,
    abi: abi["totalETH"],
  });

  const totalETH = Bignumber(_totalETH);

  const { output: _totalDebt } = await sdk.api.abi.call({
    target: bankAddress,
    block,
    abi: abi["glbDebtVal"],
  });

  const totalDebt = Bignumber(_totalDebt);

  const { output: _lpTokens } = await sdk.api.abi.multiCall({
    calls: pools.map((pool) => ({
      target: pool.lpStakingAddress,
      params: [pool.goblinAddress],
    })),
    abi: abi["balanceOf"],
    block,
  });

  const lpTokens = _lpTokens.map((_lpToken) => Bignumber(_lpToken.output));

  const { output: _totalETHOnStakings } = await sdk.api.abi.multiCall({
    calls: pools.map((pool) => ({
      target: WETHAddress,
      params: [pool.lpTokenAddress],
    })),
    abi: abi["balanceOf"],
    block,
  });

  const totalETHOnStakings = _totalETHOnStakings.map((stake) =>
    Bignumber(stake.output)
  );

  const { output: _totalLpTokens } = await sdk.api.abi.multiCall({
    calls: pools.map((pool) => ({
      target: pool.lpStakingAddress,
    })),
    abi: abi["totalSupply"],
    block,
  });

  const totalLpTokens = _totalLpTokens.map((_totalLpToken) =>
    Bignumber(_totalLpToken.output)
  );

  const unUtilizedValue = totalETH.minus(totalDebt);

  let tvl = Bignumber(unUtilizedValue);

  for (let i = 0; i < lpTokens.length; i++) {
    const amount = lpTokens[i]
      .times(totalETHOnStakings[i])
      .div(totalLpTokens[i])
      .times(Bignumber(2));

    tvl = tvl.plus(amount);
  }

  balances[ethAddress] = tvl.toFixed(0);

  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: "Alpha Homora", // project name
  token: null, // null, or token symbol if project has a custom token
  category: "assets", // allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
  start: 1602054167, // unix timestamp (utc 0) specifying when the project began, or where live data begins
  tvl, // tvl adapter
};
