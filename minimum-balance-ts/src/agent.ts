import { getEthersProvider } from "forta-agent"
import provideHandleBlock from "./agentCore"

const ethersProvider = getEthersProvider()

export default {
  provideHandleBlock,
  handleBlock: provideHandleBlock(ethersProvider)
}