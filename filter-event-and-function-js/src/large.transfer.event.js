const BigNumber = require("bignumber.js");
const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { USDT_ADDRESS, USDT_DECIMALS, ERC20_TRANSFER_EVENT } = require("./constants");

const AMOUNT_THRESHOLD = "1000000"; // 1 million

function provideHandleTransaction(amountThreshold) {
  return async function handleTransaction(txEvent) {
    const findings = [];

    // filter the transaction logs for USDT Transfer events
    const usdtTransferEvents = txEvent.filterLog(ERC20_TRANSFER_EVENT, USDT_ADDRESS);

    // fire alerts for transfers of large amounts
    usdtTransferEvents.forEach(usdtTransfer => {
      // shift decimal places of transfer amount
      const amount = new BigNumber(usdtTransfer.args.value.toString()).dividedBy(
        10 ** USDT_DECIMALS
      );

      if (amount.lt(amountThreshold)) return;

      const formattedAmount = amount.toFixed(2);
      findings.push(
        Finding.fromObject({
          name: "Large Tether Transfer",
          description: `${formattedAmount} USDT transferred`,
          alertId: "FORTA-7",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            from: usdtTransfer.args.from,
            to: usdtTransfer.args.to,
            amount: formattedAmount,
          },
        })
      );
    });

    return findings;
  };
}

module.exports = {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(AMOUNT_THRESHOLD),
};
