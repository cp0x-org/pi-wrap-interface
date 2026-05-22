import { useEffect, useRef } from 'react';
import { useChainId, useConfig } from 'wagmi';
import { dispatchSuccess } from 'utils/snackbar';

export default function ChainSwitchNotifier() {
  const chainId = useChainId();
  const { chains } = useConfig();
  const prevChainId = useRef<number | null>(null);

  useEffect(() => {
    if (prevChainId.current !== null && prevChainId.current !== chainId) {
      const chain = chains.find((c) => c.id === chainId);
      if (chain) dispatchSuccess(`Switched to ${chain.name}`);
    }
    prevChainId.current = chainId;
  }, [chainId, chains]);

  return null;
}
