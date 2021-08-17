import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { BlockEvent, Finding, HandleBlock, FindingSeverity, FindingType, getJsonRpcUrl } from 'forta-agent'
import ECCDMetadata from './EthCrossChainData.json'

const web3 = new Web3(getJsonRpcUrl())
const ECCD_ADDRESS = "0xcf2afe102057ba5c16f899271045a0a37fcb10f2"
const eccdContract = new web3.eth.Contract(<AbiItem[]>ECCDMetadata.abi, ECCD_ADDRESS)
let cachedPkBytes: string

const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
  const findings: Finding[] = [];
  
  // get the keeper public keys on the EthCrossChainData contract for the specified block
  const pkBytes = await eccdContract.methods.getCurEpochConPubKeyBytes().call({}, blockEvent.blockNumber)
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