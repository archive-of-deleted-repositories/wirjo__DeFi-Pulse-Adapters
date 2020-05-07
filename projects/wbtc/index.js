/*==================================================
  Modules
==================================================*/

  const abi = require('./abi');
  const sdk = require('../../sdk');

/*==================================================
  Settings
==================================================*/

  const wbtcContract = '***REMOVED***';

/*==================================================
  Main
==================================================*/

  async function tvl (timestamp, block) {
    const totalSupply = (await sdk.api.abi.call({
      block,
      target: wbtcContract,
      abi: abi['totalSupply'],
    })).output;

    return (await sdk.api.util.toSymbols({ [wbtcContract]: totalSupply })).output;
  }

/*==================================================
  Exports
==================================================*/

  module.exports = {
    name: 'WBTC',
    token: null,
    category: 'Assets',
    start: 1543104000,  // 11/25/2018 @ 12:00am (UTC)
    tvl,
  };
