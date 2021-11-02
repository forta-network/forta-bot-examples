import { BlockEvent, Finding, HandleBlock, FindingSeverity, FindingType, getEthersProvider, ethers } from 'forta-agent'
import ECCDMetadata from './EthCrossChainData.json'

const ethersProvider = getEthersProvider()
const ECCD_ADDRESS = "0xcf2afe102057ba5c16f899271045a0a37fcb10f2"
const eccdContract = new ethers.Contract(ECCD_ADDRESS, ECCDMetadata.abi, ethersProvider)
let cachedPkBytes: string

const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
  const findings: Finding[] = [];
  
  // get the keeper public keys on the EthCrossChainData contract for the specified block
  const pkBytes = await eccdContract.getCurEpochConPubKeyBytes({ blockTag: blockEvent.blockNumber})
  // if the keys have changed from the previous block, fire an alert
  if (cachedPkBytes && cachedPkBytes !== pkBytes) {
    findings.push(Finding.fromObject({
      name: 'Book Keepers Changed',
      description: 'Consensus Book Keepers Public Key Bytes Changed',
      protocol: 'polynetwork',
      alertId: 'POLY-1',
      type: FindingType.Suspicious,
      severity: FindingSeverity.High,
      metadata: {
        oldPkBytes: cachedPkBytes,
        newPkBytes: pkBytes
      }
    }))
  }
  cachedPkBytes = pkBytes

  return findings;
}

export default {
  handleBlock
}