/*==================================================
  Modules
  ==================================================*/

const sdk = require("../../sdk");

/*==================================================
  Main
  ==================================================*/

async function run(timestamp, block) {
  let balances = {
    "0x0000000000000000000000000000000000000000": 1000000000000000000, // ETH
    "***REMOVED***": 2000000000000000000 // DAI
  };

  let symbolBalances = await sdk.api.util.toSymbols(balances);

  return symbolBalances.output;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: "Melon", // project name
  token: MLN, // null, or token symbol if project has a custom token
  category: "Assets", // allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
  start: 1550939901, // unix timestamp (utc 0) specifying when the project began, or where live data begins
  run // adapter
};
