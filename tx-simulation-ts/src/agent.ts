import { 
  BlockEvent, 
  Finding, 
  HandleBlock, 
  FindingSeverity, 
  FindingType, 
  getJsonRpcUrl,
  ethers
} from 'forta-agent'
import ganache from 'ganache'

export const USER_ADDRESS = "0x72cea5e3540956b2b71a91012a983267472d2fb1"
export const USER2_ADDRESS = "0xc458e1a4ec03c5039fbf38221c54be4e63731e2a"
const TETHER_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7"
const TETHER_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "who", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

// returns an ethers provider pointing to a forked version of the chain from the specified block
function getEthersForkProvider(blockNumber: number) {
  return new ethers.providers.Web3Provider(ganache.provider({
    fork: {
      url: getJsonRpcUrl(), // specify the chain to fork from
      blockNumber // specify the block number to fork from
    }, 
     wallet: { 
      unlockedAccounts: [USER_ADDRESS] // specify any accounts to unlock so you dont need the private key to make transactions
    },
    logging: { quiet: true }, // turn off ganache logs
  }) as any)
}

function getTetherContract(provider: ethers.providers.Web3Provider) {
  // use an ethers signer with the specified address so we can make transactions from the address
  return new ethers.Contract(TETHER_ADDRESS, TETHER_ABI, provider.getSigner(USER_ADDRESS))
}

export function provideHandleBlock(
  getEthersForkProvider: (blockNumber: number) => ethers.providers.Web3Provider,
  getTetherContract: (provider: ethers.providers.Web3Provider) => ethers.Contract
): HandleBlock {

  return async function handleBlock(blockEvent: BlockEvent) {
    const findings: Finding[] = [];

    // create an ethers provider that points to a forked ganache chain
    const provider = getEthersForkProvider(blockEvent.blockNumber)
    // create an ethers contract pointing to the Tether ERC-20 token on the forked ganache chain
    const tetherContract = getTetherContract(provider)

    // simulate a Tether ERC-20 transfer on the forked chain
    let userBalance
    try {
      // get the user's balance
      userBalance = await tetherContract.balanceOf(USER_ADDRESS)
      // transfer the entire balance to another user
      // NOTE: to trigger the finding, try changing the transfer amount to something higher than userBalance
      const tx = await tetherContract.transfer(USER2_ADDRESS, userBalance)
      // wait for transaction to be mined by ganache
      await tx.wait() 
    } catch (e) {
      // report a finding if the transaction fails due to on-chain error (e.g. insufficient balance)
      findings.push(Finding.fromObject({
        name: "Failed transfer",
        description: "Failed to make ERC-20 transfer",
        alertId: "FORTA-9",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          from: USER_ADDRESS,
          to: USER2_ADDRESS,
          amount: userBalance.toString(),
        },
      }))
    }
    
    return findings;
  }
}

export default {
  handleBlock: provideHandleBlock(getEthersForkProvider, getTetherContract)
}