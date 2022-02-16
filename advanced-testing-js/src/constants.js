module.exports = {
  USER: "0x72cea5e3540956b2b71a91012a983267472d2fb1", // has lots of tether
  USER2: "0xc458e1a4ec03c5039fbf38221c54be4e63731e2a", // some random address
  ERC20_TRANSFER:
    "event Transfer(address indexed from, address indexed to, uint value)",
  TETHER_ADDRESS: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  TETHER_DECIMALS: 6,
  TETHER_ABI: [
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "transfer",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};
