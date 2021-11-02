import { BlockEvent, Finding, HandleBlock } from 'forta-agent'
import PolyAssetBalanceAgent from './poly.asset.balance.agent'
import PolyKeeperChangedAgent from './poly.keeper.changed.agent'

const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
  const findings: Finding[] = (await Promise.all([
    PolyAssetBalanceAgent.handleBlock(blockEvent),
    PolyKeeperChangedAgent.handleBlock(blockEvent)
  ])).flat()

  return findings
}

export default {
  handleBlock
}