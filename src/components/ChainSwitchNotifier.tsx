import { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useChainId, useConfig } from 'wagmi';
import { dispatchSuccess } from 'utils/snackbar';

export default function ChainSwitchNotifier() {
  const intl = useIntl();
  const chainId = useChainId();
  const { chains } = useConfig();
  const prevChainId = useRef<number | null>(null);

  useEffect(() => {
    if (prevChainId.current !== null && prevChainId.current !== chainId) {
      const chain = chains.find((c) => c.id === chainId);
      if (chain) dispatchSuccess(intl.formatMessage({ id: 'tx.networkSwitched' }, { chain: chain.name }));
    }
    prevChainId.current = chainId;
  }, [chainId, chains, intl]);

  return null;
}
