/*==================================================
  Modules
  ==================================================*/

  const sdk = require('../../sdk');
  const _ = require('underscore');
  const BigNumber = require('bignumber.js');

/*==================================================
  Settings
  ==================================================*/

  const tokens = [
    '***REMOVED***', // SAI
    '***REMOVED***', // WETH
    '***REMOVED***', // WBTC
    '***REMOVED***'  // USDC
  ]

/*==================================================
  Main
  ==================================================*/

  async function run(timestamp, block) {
    let balances = {};

    let balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls: _.map(tokens, (token) => {
        return {
          target: token,
          params: '0x5B67871C3a857dE81A1ca0f9F7945e5670D986Dc'
        }
      }),
      abi: 'erc20:balanceOf'
    });

    _.each(balanceOfResults.output, (balanceOf) => {
      if(balanceOf.success) {
        let address = balanceOf.input.target
        balances[address] = BigNumber(balances[address] || 0).plus(balanceOf.output).toFixed();
      }
    });

    let symbolBalances = await sdk.api.util.toSymbols(balances);

    return symbolBalances.output;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Set Protocol',
    token: null,
    category: 'Assets',
    start: 1554848955,  // 04/09/2019 @ 10:29pm (UTC)
    run
  }
