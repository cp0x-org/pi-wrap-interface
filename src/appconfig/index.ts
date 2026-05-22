import { arbitrum, base, mainnet, optimism, polygon, unichain, hyperEvm, megaeth } from 'wagmi/chains';

export const INPUT_DECIMALS = 12;

export type WrappedNativeTokenConfig = {
  chainId: number;
  chainName: string;
  nativeSymbol: string;
  wrappedSymbol: string;
  wrappedAddress: `0x${string}`;
};

export const wrappedNativeTokenConfig = {
  [mainnet.id]: {
    chainId: mainnet.id,
    chainName: 'Ethereum',
    nativeSymbol: 'ETH',
    wrappedSymbol: 'WETH',
    wrappedAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  [base.id]: {
    chainId: base.id,
    chainName: 'Base',
    nativeSymbol: 'ETH',
    wrappedSymbol: 'WETH',
    wrappedAddress: '0x4200000000000000000000000000000000000006'
  },
  [arbitrum.id]: {
    chainId: arbitrum.id,
    chainName: 'Arbitrum',
    nativeSymbol: 'ETH',
    wrappedSymbol: 'WETH',
    wrappedAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
  },
  [optimism.id]: {
    chainId: optimism.id,
    chainName: 'Optimism',
    nativeSymbol: 'ETH',
    wrappedSymbol: 'WETH',
    wrappedAddress: '0x4200000000000000000000000000000000000006'
  },
  [polygon.id]: {
    chainId: polygon.id,
    chainName: 'Polygon',
    nativeSymbol: 'POL',
    wrappedSymbol: 'WPOL',
    wrappedAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
  },
  [unichain.id]: {
    chainId: unichain.id,
    chainName: 'Unichain',
    nativeSymbol: 'ETH',
    wrappedSymbol: 'WETH',
    wrappedAddress: '0x4200000000000000000000000000000000000006'
  },
  [hyperEvm.id]: {
    chainId: hyperEvm.id,
    chainName: 'HyperEVM',
    nativeSymbol: 'HYPE',
    wrappedSymbol: 'WHYPE',
    wrappedAddress: '0x5555555555555555555555555555555555555555'
  },
  [megaeth.id]: {
    chainId: megaeth.id,
    chainName: 'MegaETH',
    nativeSymbol: 'ETH',
    wrappedSymbol: 'WETH',
    wrappedAddress: '0x4200000000000000000000000000000000000006'
  }
} as const satisfies Record<number, WrappedNativeTokenConfig>;

export type WrappedNativeChainId = keyof typeof wrappedNativeTokenConfig;

export const wrappedNativeChains = Object.values(wrappedNativeTokenConfig);
