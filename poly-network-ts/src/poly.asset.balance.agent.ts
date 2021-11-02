import BigNumber from 'bignumber.js'
import { BlockEvent, Finding, HandleBlock, FindingSeverity, FindingType, getEthersProvider, ethers } from 'forta-agent'
import ERC20Abi from './ERC20Abi.json'

const ethersProvider = getEthersProvider()
const POLY_ASSET_PROXY = "0x250e76987d838a75310c34bf422ea9f1ac4cc906"
const tokenAddresses: { [symbol: string] : string} = {
  "ETH": "0x0",
  "USDC": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "WBTC": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  "DAI": "0x6b175474e89094c44da98b954eedeac495271d0f",
  "UNI": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  "SHIB": "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
  "USDT": "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "WETH": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  "FEI": "0x956f47f50a910163d8bf957cf5846d573e7f87ca"
}
const tokenBalances: { [symbol: string]: string} = { }

const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
  const findings: Finding[] = [];
  const tokens = Object.keys(tokenAddresses)

  // query the current balance of all tokens we are interested in for the Poly Asset Proxy
  const balanceQueries = []
  for (let i=0; i<tokens.length; i++) {
    if (tokens[i] === "ETH") {
      balanceQueries.push(ethersProvider.getBalance(POLY_ASSET_PROXY, blockEvent.blockNumber))
    } else {
      const erc20Contract = new ethers.Contract(tokenAddresses[tokens[i]], ERC20Abi, ethersProvider)
      balanceQueries.push(erc20Contract.balanceOf(POLY_ASSET_PROXY, {blockTag: blockEvent.blockNumber}))
    }
  }
  const currBalances = await Promise.all(balanceQueries)

  // compare to the previous block's balance
  let currBalance, prevBalance
  for (let i=0; i<tokens.length; i++) {
    prevBalance = tokenBalances[tokens[i]]
    currBalance = currBalances[i].toString()

    if (prevBalance && new BigNumber(currBalance).isLessThan(prevBalance)) {
      const diff = new BigNumber(prevBalance).minus(currBalance)
      const percentChange = diff.dividedBy(prevBalance).times(100)
      if (percentChange.isGreaterThan(50)) {
        findings.push(Finding.fromObject({
          name: 'Poly Asset Balance Drained',
          description: `Poly asset ${tokens[i]} drained by ${percentChange}%`,
          protocol: 'polynetwork',
          alertId: 'POLY-2',
          type: FindingType.Exploit,
          severity: percentChange.isGreaterThan(90) ? FindingSeverity.Critical : FindingSeverity.High,
          metadata: {
            currentBalance: currBalance,
            previousBalance: prevBalance
          }
        }))
      }
    }
    tokenBalances[tokens[i]] = currBalance
  }

  return findings;
}

export default {
  handleBlock
}