/*==================================================
  Modules
==================================================*/

const sdk = require('../../sdk');
const BigNumber = require('bignumber.js');
const _ = require('underscore');

const abi = require('./abi');
const itoken = require('./itoken');

/*==================================================
  Main
  ==================================================*/

let iTokens = [
  // sUSD
  {
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "0x57Ab1E02fEE23774580C119740129eAC7081e9D3"
  },
  // CHAI
  {
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "0x06AF07097C9Eeb7fD685c692751D5C66dB49c215"
  },
];

let iTokensNew = [
  // Those are new iTokens
  { // Fulcrum DAI iToken
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "***REMOVED***"
  },
  { // Fulcrum ETH iToken
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "***REMOVED***"
  },
  { // Fulcrum USDC iToken
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "***REMOVED***"
  },
  { // Fulcrum WBTC iToken
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "***REMOVED***"
  },
  { // Fulcrum LEND iToken
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "0x80fB784B7eD66730e8b1DBd9820aFD29931aab03"
  },
  { // Fulcrum KNC iToken
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "0xdd974d5c2e2928dea5f71b9825b8b646686bd200"
  },
  { // Fulcrum MKR iToken
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2"
  },
  { // Fulcrum BZRX iToken
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "***REMOVED***"
  },
  { // Fulcrum LINK iToken
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA"
  },
  { // Fulcrum YFI iToken
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e"
  },
  { // Fulcrum USDT iToken
    iTokenAddress: "***REMOVED***",
    underlyingAddress: "***REMOVED***"
  }
]

async function tvl(timestamp, block) {
  let balances = {};

  const getTokensResult = await sdk.api.abi.call({
    block,
    target: '0xD8dc30d298CCf40042991cB4B96A540d8aFFE73a',
    params: [0, 200, 0],
    abi: abi["getTokens"]
  });
  // for when staking is ready
  let bzrxTokenAddress = "***REMOVED***";
  let vbzrxTokenAddress = "***REMOVED***";

  _.each(getTokensResult.output, (token) => {
    if (token[4] === '1') {
      iTokens.push({
        iTokenAddress: token[0],
        underlyingAddress: token[1]
      });
    }
  });


  iTokens = iTokens.concat(iTokensNew);
  const iTokenCalls = _.map(iTokens, (iToken) => ({
    target: iToken.iTokenAddress
  }));

  const supplyResult = await sdk.api.abi.multiCall({
    block,
    calls: iTokenCalls,
    abi: abi["totalAssetSupply"]
  });

  const borrowResult = await sdk.api.abi.multiCall({
    block,
    calls: iTokenCalls,
    abi: abi["totalAssetBorrow"]
  });

  _.each(iTokens, (iToken) => {
    const supply = _.find(supplyResult.output, (result) => (result.input.target === iToken.iTokenAddress));
    const borrow = _.find(borrowResult.output, (result) => (result.input.target === iToken.iTokenAddress));

    if (supply.success && borrow.success) {
      const totalSupply = supply.output;
      const totalBorrow = borrow.output;
      balances[iToken.underlyingAddress] = BigNumber(totalSupply).minus(totalBorrow).toFixed();
    }
  });

  const kyberTokens = (await sdk.api.util.kyberTokens()).output;

  // Legacy bZx address
  balanceOfCallsLegacy = [
    ..._.map(kyberTokens, (data, address) => ({
      target: address,
      params: '0x8b3d70d628ebd30d4a2ea82db95ba2e906c71633'
    }))
  ];

  // new bZx address
  balanceOfCalls = [
    ..._.map(kyberTokens, (data, address) => ({
      target: address,
      params: '0xd8ee69652e4e4838f2531732a46d1f7f584f0b7f'
    }))
  ];

  const balanceOfResult = await sdk.api.abi.multiCall({
    block,
    calls: balanceOfCalls,
    abi: 'erc20:balanceOf',
  });

  sdk.util.sumMultiBalanceOf(balances, balanceOfCallsLegacy);
  sdk.util.sumMultiBalanceOf(balances, balanceOfResult);
  console.log(balances);
  return balances;
}


/*==================================================
  Rates
  ==================================================*/
async function rates(timestamp, block) {
  let ratesData = { lend: {}, borrow: {}, supply: {} };

  const iTokenCalls = _.map(iTokensNew, (iToken) => ({
    target: iToken.iTokenAddress
  }));

  const supplyInterestRate = await sdk.api.abi.multiCall({
    block,
    calls: iTokenCalls,
    abi: itoken["supplyInterestRate"]
  });

  const borrowInterestRate = await sdk.api.abi.multiCall({
    block,
    calls: iTokenCalls,
    abi: itoken["borrowInterestRate"]
  });

  const totalAssetBorrow = await sdk.api.abi.multiCall({
    block,
    calls: iTokenCalls,
    abi: itoken["totalAssetBorrow"]
  });

  const iTokenUnderlyingCalls = _.map(iTokensNew, (iToken) => ({
    target: iToken.underlyingAddress
  }));

  const underlyingSymbol = await sdk.api.abi.multiCall({
    block,
    calls: iTokenUnderlyingCalls,
    abi: 'erc20:symbol'
  });
  // console.log("underlyingSymbol", underlyingSymbol);
  // _.each(underlyingSymbol.output, (symbol) => {
  //   console.log("target", symbol.input.target);
  // });

  _.each(iTokensNew, (iToken) => {
    const supply = _.find(supplyInterestRate.output, (result) => (result.input.target === iToken.iTokenAddress));
    const borrow = _.find(borrowInterestRate.output, (result) => (result.input.target === iToken.iTokenAddress));
    const totalBorrow = _.find(totalAssetBorrow.output, (result) => (result.input.target === iToken.iTokenAddress));
    let symbol = _.find(underlyingSymbol.output, (result) => (result.input.target === iToken.underlyingAddress));

    if (iToken.underlyingAddress.toUpperCase() == "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2".toUpperCase()) {
      symbol.output = "MKR";
    }

    console.log("symbol", symbol.output);
    console.log("supply", supply.output);
    console.log("borrow", borrow.output);
    console.log("totalBorrow", totalBorrow.output);
    console.log("");
    ratesData.lend[symbol.output] = String(supply.output / 1e18);
    ratesData.borrow[symbol.output] = String(borrow.output / 1e18);
    ratesData.supply[symbol.output] = String(totalBorrow.output);
  });


  // iToken supplyInterestRate - lendRate
  // iToken avgBorrowInterestRate - borrowRate
  // iToken totalAssetBorrow - total supply
  console.log("ratesData", JSON.stringify(ratesData));
  return ratesData;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: 'bZx',
  token: 'BZRX',
  category: 'lending',
  website: "https://bzx.network",
  start: 1558742400,  // 05/25/2019(UTC)
  tvl,
  rates,
  term: "1 block",
  variability: "medium",
};
