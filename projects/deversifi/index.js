/*==================================================
  Modules
  ==================================================*/

const sdk = require('../../sdk')
const _ = require('underscore')

/*==================================================
  Settings
  ==================================================*/

const deversifiStarkAddr = '0x5d22045daceab03b158031ecb7d9d06fad24609b'

const listedTokens = [
  '***REMOVED***', // USDT
  '***REMOVED***', // DAI
  '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07', // OMG
  '0x940a2db1b7008b6c776d4faaca729d6d4a4aa551', // DUSK
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // MKR
  '***REMOVED***', // WBTC
  '0xe41d2489571d322189246dafa5ebde1f4699f498', // ZRX
  '0xcc80c051057b774cd75067dc48f8987c4eb97a5e', // NEC
  '***REMOVED***', // USDC
  '0x419d0d8bdd9af5e606ae2232ed285aff190e711b', // FUN
  '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d' // PNK
]

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  const ethBalance = await sdk.api.eth.getBalance({ target: deversifiStarkAddr, block })

  const balances = {
    '0x0000000000000000000000000000000000000000': ethBalance.output
  }

  const calls = []
  _.each(listedTokens, (token) => {
    calls.push({
      target: token,
      params: deversifiStarkAddr
    })
  })

  const balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls,
    abi: 'erc20:balanceOf'
  })

  await sdk.util.sumMultiBalanceOf(balances, balanceOfResults)

  return balances
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: 'DeversiFi',
  token: 'NEC',
  category: 'dexes',
  start: 1590969600, // 06/01/2020
  tvl
}
