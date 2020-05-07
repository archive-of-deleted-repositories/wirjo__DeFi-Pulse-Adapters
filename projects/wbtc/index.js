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
    start: 1543095952,  // Nov-24-2018 09:45:52 PM +UTC
    tvl,
  };
