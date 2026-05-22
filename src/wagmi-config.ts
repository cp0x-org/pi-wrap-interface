import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { arbitrum, base, hyperEvm, mainnet, optimism, polygon, unichain, megaeth } from 'wagmi/chains';

const ankrKey = (window as any).APP_CONFIG?.ankrKey ?? '';
const ankr = (network: string) =>
  ankrKey ? http(`https://rpc.ankr.com/${network}/${ankrKey}`) : http();

export const config = getDefaultConfig({
  appName: 'Unwrap Interface',
  projectId: '3bd0ad741725d54fbc9a4c7b6545720e',
  chains: [mainnet, base, polygon, unichain, arbitrum, optimism, hyperEvm, megaeth],
  transports: {
    [mainnet.id]: ankr('eth'),
    [base.id]: ankr('base'),
    [polygon.id]: ankr('polygon'),
    [arbitrum.id]: ankr('arbitrum'),
    [optimism.id]: ankr('optimism'),
    [unichain.id]: ankr('unichain_mainnet'),
    [hyperEvm.id]: ankr('hyperevm'),
    [megaeth.id]: http('https://mainnet.megaeth.com/rpc')
  },
  ssr: false
});
