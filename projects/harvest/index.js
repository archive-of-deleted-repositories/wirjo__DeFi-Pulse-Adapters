/*==================================================
  Modules
  ==================================================*/

  const sdk = require('../../sdk');
  const abi = require('./abi.json');

/*==================================================
  TVL
  ==================================================*/

  const fTokens = {
    'fWETH':       {underlying: 'WETH', decimals: 18, contract: '0x8e298734681adbfC41ee5d17FF8B0d6d803e7098', created: 10861886 },
    'fUSDC':       {underlying: 'USDC', decimals: 6,  contract: '0xc3F7ffb5d5869B3ade9448D094d81B0521e8326f', created: 10770105 },
    'fUSDT':       {underlying: 'USDT', decimals: 6,  contract: '0xc7EE21406BB581e741FBb8B21f213188433D9f2F', created: 10770108 },
    'fTUSD':       {underlying: 'TUSD', decimals: 18, contract: '0x7674622c63Bee7F46E86a4A5A18976693D54441b', created: 10997721 },
    'fDAI':        {underlying: 'DAI',  decimals: 18, contract: '0xe85C8581e60D7Cd32Bbfd86303d2A4FA6a951Dac', created: 10770103 },
    'fWBTC':       {underlying: 'WBTC', decimals: 8,  contract: '0xc07EB91961662D275E2D285BdC21885A4Db136B0', created: 10802976 },
    'fRENBTC':     {underlying: 'RENBTC', decimals: 8, contract: '0xfBe122D0ba3c75e1F7C80bd27613c9f35B81FEeC', created: 10802986 },
    'fCRVRENWBTC': {underlying: 'CRVRENWBTC', decimals: 18, contract: '0x192E9d29D43db385063799BC239E772c3b6888F3', created: 10815917 },
  };

  async function tvl(timestamp, block) {
    const promises = [
      getUnderlying('fWETH',block),
      getUnderlying('fDAI',block),
      getUnderlying('fUSDC',block),
      getUnderlying('fUSDT',block),
      getUnderlying('fTUSD',block),
      getUnderlying('fWBTC',block),
      getUnderlying('fRENBTC',block),
      getUnderlying('fCRVRENWBTC',block),
    ];

    let results = await Promise.all(promises);


    let balances = {
      '***REMOVED***': results[0],   // WETH
      '***REMOVED***': results[1],   // DAI
      '***REMOVED***': results[2],   // USDC
      '***REMOVED***': results[3],   // USDT
      '0x0000000000085d4780B73119b644AE5ecd22b376': results[4],   // TUSD
      '***REMOVED***': results[5],   // WBTC
      '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D': Math.trunc(results[6])  // RENBTC
                                                      + Math.trunc(results[7]*Math.pow(10,-10)), //crvRENWBTC, estimate
      // TODO Uniswap LP underlying
    };

    return balances;
  }

  async function getUnderlying(token, block) {
    if (block > fTokens[token].created) {
      const promises = [
        sdk.api.abi.call({ block, target: fTokens[token].contract, abi: 'erc20:totalSupply', }),
        sdk.api.abi.call({ block, target: fTokens[token].contract, abi: abi['fABISharePrice'], }),
        sdk.api.abi.call({ block, target: fTokens[token].contract, abi: abi['fABIUnderlyingUnit'], })
      ];

      let results = await Promise.all(promises);

      let fBalance = results[0].output;
      let fSharePrice = results[1].output;
      let fUnderlyingUnit = results[2].output;

      return fBalance * fSharePrice / fUnderlyingUnit;
    }

    return 0;
}

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Harvest Finance', // project name
    website: 'https://harvest.finance',
    token: 'FARM',            // null, or token symbol if project has a custom token
    category: 'assets',       // allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
    start: 1598893200,        // unix timestamp (utc 0) specifying when the project began, or where live data begins
    tvl                       // tvl adapter
  };
