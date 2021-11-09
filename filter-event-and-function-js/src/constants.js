const USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const USDT_DECIMALS = 6;
const ERC20_TRANSFER_EVENT =
  "event Transfer(address indexed from, address indexed to, uint value)";
const ERC20_TRANSFER_FROM_FUNCTION =
  "function transferFrom(address from, address to, uint value)";

module.exports = {
  USDT_ADDRESS,
  USDT_DECIMALS,
  ERC20_TRANSFER_EVENT,
  ERC20_TRANSFER_FROM_FUNCTION,
};
