const sdk = require('../../sdk');
const BigNumber = require('bignumber.js');
const _ = require('underscore');

/*==================================================
Settings
==================================================*/

const cTokenDecimalScale = BigNumber("10").pow(18);

const tokens = [
  '***REMOVED***', // WETH
  '***REMOVED***', // WBTC
  '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
  '***REMOVED***', // SAI
  '***REMOVED***', // DAI
  '***REMOVED***', // USDC
  '***REMOVED***', // cUSDC
  '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643', // cDAI
]

const cTokensMap = {
  '***REMOVED***': '***REMOVED***', // cUSDC: USDC
  '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643': '***REMOVED***'  // cDAI: DAI
}

/*==================================================
  TVL
  ==================================================*/

module.exports = async function tvl(timestamp, block) {
  let balances = {};

  // Vault Asset Balances
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

  // cToken Exchange Rates
  let cTokenConversionRatesMap = (await sdk.api.abi.multiCall({
    block,
    calls: _.map(Object.keys(cTokensMap), (cToken) => {
      return {
        target: cToken
      }
    }),
    abi: {
      "constant": true,
      "inputs": [],
      "name": "exchangeRateStored",
      "outputs": [
        {
          "name":"",
          "type":"uint256"
        }
      ]
    }
  })).output.reduce(function(map, object) {
    map[object.input.target] = object.output;
    return map;
  }, {});

  // Compute Balances
  _.each(balanceOfResults.output, (balanceOf) => {
    if(balanceOf.success) {
      let address = balanceOf.input.target

      if (address in cTokensMap) {
        let addressOfUnderlying = cTokensMap[address];
        let conversionRate = BigNumber(cTokenConversionRatesMap[address]);
        let balanceOfUnderlying = BigNumber(balanceOf.output).times(conversionRate).div(cTokenDecimalScale);

        balances[addressOfUnderlying] = BigNumber(balances[addressOfUnderlying] || 0).plus(balanceOfUnderlying).toFixed();
      } else {
        balances[address] = BigNumber(balances[address] || 0).plus(balanceOf.output).toFixed();
      }
    }
  });

  return balances;
};
