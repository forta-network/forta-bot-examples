const BigNumber = require("bignumber.js");
const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const CryptoPriceGetter = require("./crypto.price.getter");

const MEDIUM_FEE_THRESHOLD = "100";
const HIGH_FEE_THRESHOLD = "500";
const CRITICAL_FEE_THRESHOLD = "1000";

const cryptoPriceGetter = new CryptoPriceGetter();

function provideHandleTransaction(cryptoPriceGetter) {
  return async function handleTransaction(txEvent) {
    // report finding if transaction gas fee in USD is higher than threshold
    const findings = [];
    const gasUsed = new BigNumber(txEvent.gasUsed);
    const totalGasCostWei = gasUsed.multipliedBy(txEvent.gasPrice);
    const weiPriceUsd = await cryptoPriceGetter.getWeiPriceUsd();
    const totalFeeUsd = totalGasCostWei.multipliedBy(weiPriceUsd);

    if (totalFeeUsd.isLessThan(MEDIUM_FEE_THRESHOLD)) return findings;

    findings.push(
      Finding.fromObject({
        name: "High Gas Fee (USD)",
        description: `Gas Fee: $${totalFeeUsd.toFixed(2)}`,
        alertId: "FORTA-2",
        type: FindingType.Suspicious,
        severity: getSeverity(totalFeeUsd),
        metadata: {
          fee: totalFeeUsd.toFixed(2),
        },
      })
    );

    return findings;
  };
}

const getSeverity = (totalFeeUsd) => {
  return totalFeeUsd.isGreaterThan(CRITICAL_FEE_THRESHOLD)
    ? FindingSeverity.Critical
    : totalFeeUsd.isGreaterThan(HIGH_FEE_THRESHOLD)
    ? FindingSeverity.High
    : FindingSeverity.Medium;
};

module.exports = {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(cryptoPriceGetter),
};
