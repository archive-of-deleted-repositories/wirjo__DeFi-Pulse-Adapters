/*==================================================
  Modules
  ==================================================*/

  const sdk = require('../../sdk');
  const BN = require("bignumber.js");

/*==================================================
  Main
  ==================================================*/

  const investedAmountInDaiAbi = {
    constant: true,
    inputs: [],
    name: "investedAmountInDai",
    outputs: [
      {
        name: "balance",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  };
  const dsrBalanceAbi = {
    constant: true,
    inputs: [],
    name: "dsrBalance",
    outputs: [
      {
        name: "balance",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  };

  async function run(timestamp, block) {
    const bridgeAddress = '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016';
    const saiAddress = '***REMOVED***';
    const daiAddress = '***REMOVED***';
    const daiDeploymentBlock = 8928158;
    const initializeChaiBlock = 9779414;
    const saiShutdownBlock = 9884448;

    let saiBalance = '0';
    let daiBalance = '0';

    saiBalance = (await sdk.api.erc20.balanceOf({
      target: saiAddress,
      owner: bridgeAddress,
      block: Math.min(block, saiShutdownBlock)
    })).output;

    if (block >= daiDeploymentBlock) {
      daiBalance = (await sdk.api.erc20.balanceOf({
        target: daiAddress,
        owner: bridgeAddress,
        block
      })).output;
    }

    // bridge contract of prior versions didn't support investedAmountInDai / dsrBalance call
    // so we include chai balance into consideration only after it was properly initialized in the bridge contract
    if (block >= initializeChaiBlock) {
      const investedAmountInDai = (await sdk.api.abi.call({
        target: bridgeAddress,
        abi: investedAmountInDaiAbi,
        block
      })).output;

      const dsrBalance = (await sdk.api.abi.call({
        target: bridgeAddress,
        abi: dsrBalanceAbi,
        block
      })).output;

      daiBalance = BN.sum(daiBalance, BN.min(dsrBalance, investedAmountInDai)).toString(10);
    }
    
    const balances = {
      [saiAddress]: saiBalance,
      [daiAddress]: daiBalance
    };

    const symbolBalances = await sdk.api.util.toSymbols(balances);

    return symbolBalances.output;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'xDai',
    token: null,
    category: 'Payments',
    start: 1539028166,
    run
  };
