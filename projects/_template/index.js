/*==================================================
  Modules
  ==================================================*/

  const sdk = require('../../sdk');

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    let balances = {
      '0x0000000000000000000000000000000000000000': 1000000000000000000, // ETH
      '***REMOVED***': 2000000000000000000  // DAI
    };

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Template Project', // project name
    token: null,              // null, or token symbol if project has a custom token
    category: 'assets',       // allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
    start: 1514764800,        // unix timestamp (utc 0) specifying when the project began, or where live data begins
    tvl                       // tvl adapter
  }
