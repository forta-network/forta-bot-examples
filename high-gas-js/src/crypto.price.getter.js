const axios = require("axios");

const API_URL =
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
const API_KEY = "YOUR_COINMARKETCAP_API_KEY";
const FIVE_MINS_IN_MS = 1000 * 60 * 5;

// fetches USD price of wei using CoinMarketCap API
// see https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyListingsLatest
module.exports = class CryptoPriceGetter {
  constructor() {
    this.weiPriceUsd = undefined;
    this.lastFetchTimestamp = undefined;
  }

  async getWeiPriceUsd() {
    // if data is stale
    if (this.shouldFetchData()) {
      const { data } = await axios.get(API_URL, {
        headers: { "X-CMC_PRO_API_KEY": API_KEY },
        params: { start: "1", limit: "3", convert: "USD" },
      });
      const ethPriceUsd = data.data.find(
        (crypto) => crypto.symbol.toLowerCase() === "eth"
      ).quote.USD.price;
      this.weiPriceUsd = (ethPriceUsd / 1000000000000000000).toString();
      this.lastFetchTimestampMs = Date.now();
    }

    return this.weiPriceUsd;
  }

  shouldFetchData() {
    return (
      !this.weiPriceUsd ||
      Date.now() - this.lastFetchTimestampMs > FIVE_MINS_IN_MS
    );
  }
};
