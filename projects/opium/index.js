/*==================================================
  Modules
  ==================================================*/

  const sdk = require('../../sdk');
  const _ = require('underscore');

/*==================================================
  Settings
  ==================================================*/

  const tokenAddresses = [
    '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359', // SAI
    '***REMOVED***', // DAI
    '***REMOVED***',  // USDC
    '***REMOVED***',  // WETH
  ];

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    const balances = {};

    const balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls: _.map(tokenAddresses, (address) => ({
        target: address,
        params: '0xafda317cb15967c2fd379885de227ca236e59cd3'
      })),
      abi: 'erc20:balanceOf'
    });

    _.each(balanceOfResults.output, (balanceOf) => {
      if(balanceOf.success) {
        const balance = balanceOf.output;
        const address = balanceOf.input.target;

        balances[address] = balance;
      }
    });

    return (await sdk.api.util.toSymbols(balances)).output;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Opium Network',
    token: null,
    category: 'Derivatives',
    start: 1579601633, // 2020-01-21T10:13:53+00:00
    tvl,
  };
