export const COMPOUND_TOKEN_ADDRESS = "0xc00e94cb662c3520282e6f5717214004a7f26888"
export const COMPOUND_COMPTROLLER_ADDRESS = "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b"
export const COMPOUND_RESERVOIR_ADDRESS = "0x2775b1c75658be0f640272ccb8c72ac986009e38"
export const DISTRIBUTED_SUPPLIER_COMP_EVENT = "event DistributedSupplierComp(address indexed cToken, address indexed supplier, uint compDelta, uint compSupplyIndex)"
export const DISTRIBUTED_BORROWER_COMP_EVENT = "event DistributedBorrowerComp(address indexed cToken, address indexed borrower, uint compDelta, uint compBorrowIndex)"
export const ERC20_TRANSFER_EVENT = "event Transfer(address indexed from, address indexed to, uint value)"
export const COMPTROLLER_ABI = [{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"compAccrued","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xcc7ebdc4"}]