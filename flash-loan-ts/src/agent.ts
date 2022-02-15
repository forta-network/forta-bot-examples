import { getEthersProvider } from 'forta-agent'
import provideHandleTransaction from './agentCore'

const ethersProvider = getEthersProvider()

export default {
  handleTransaction: provideHandleTransaction(ethersProvider)
}