/*==================================================
  Modules
==================================================*/

  const sdk = require('../../sdk');
  const _ = require('underscore');
  const BigNumber = require("bignumber.js");

/*==================================================
    Settings
 ==================================================*/

  const contracts = [
    '0x5199071825CC1d6cd019B0D7D42B08106f6CF16D',
    '0x1e0447b19bb6ecfdae1e4ae1694b0c3659614e4e'
  ];

  const tokens = [
    '***REMOVED***',
    '***REMOVED***',
    '***REMOVED***',
    '***REMOVED***'
  ];

/*==================================================
  Main
==================================================*/

  async function tvl (timestamp, block) {
    const balances = {};

    let balanceOfCalls = [];
    _.forEach(contracts, (contract) => {
      balanceOfCalls = [
        ...balanceOfCalls,
        ..._.map(tokens, (token) => ({
          target: token,
          params: contract
        }))
      ];
    });

    const balanceOfResult = (await sdk.api.abi.multiCall({
      block,
      calls: balanceOfCalls,
      abi: 'erc20:balanceOf',
    })).output;

    /* combine token volumes on multiple contracts */
    _.forEach(balanceOfResult, (result) => {
      let balance = new BigNumber(result.output || 0);
      if (balance <= 0) return;

      let asset = result.input.target;
      let total = balances[asset];

      if (total) {
        balances[asset] = balance.plus(total).toFixed();
      } else {
        balances[asset] = balance.toFixed();
      }
    });

    return balances;
  }

/*==================================================
  Exports
==================================================*/

  module.exports = {
    name: 'dYdX',
    token: null,
    category: 'Lending',
    start: 1538179200,  // 09/29/2018 @ 12:00am (UTC)
    tvl,
  };
