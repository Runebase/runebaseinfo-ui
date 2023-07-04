export default {
  mainnet: {
    pubkey: 0x3d,
    pubkeyhash: 0x3d,
    scripthash: 0x7b,
    witness_v0_keyhash: 'rc',
    witness_v0_scripthash: 'rc'
  },
  testnet: {
    pubkey: 0x78,
    pubkeyhash: 0x78,
    scripthash: 0x6e,
    witness_v0_keyhash: 'tr',
    witness_v0_scripthash: 'tr'
  }
}[process.env.network || 'mainnet']
