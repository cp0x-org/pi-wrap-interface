import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import type { SelectChangeEvent } from '@mui/material/Select';
import { alpha, useTheme } from '@mui/material/styles';
import { useAccount, useBalance, useChainId, useReadContract, useSwitchChain } from 'wagmi';
import { formatEther, parseEther } from 'viem';

import { wethABI } from '@/appconfig/abi/weth';
import { wrappedNativeChains, wrappedNativeTokenConfig, type WrappedNativeChainId } from '@/appconfig';
import { CustomInput } from 'components/CustomInput';
import { TokenIcon } from 'components/TokenIcon';
import { WrapFaq } from 'components/WrapFaq';
import { SuggestToken } from 'components/SuggestToken';
import { useWriteTransaction } from 'hooks/useWriteTransaction';
import { dispatchError, dispatchSuccess, parseError } from 'utils/snackbar';

type Mode = 'wrap' | 'unwrap';

const DEFAULT_CHAIN_ID = wrappedNativeChains[0].chainId as WrappedNativeChainId;
const amountPattern = /^\d*(?:[.,]\d*)?$/;

// stable ids used to wire accessible names/descriptions in the AX tree
const ID = {
  heading: 'wrap-heading',
  rateNote: 'wrap-rate-note',
  networkWarning: 'wrap-network-warning',
  txStatus: 'wrap-tx-status',
  txError: 'wrap-tx-error',
  fromLabel: 'wrap-from-label',
  fromSymbol: 'wrap-from-symbol',
  fromBalance: 'wrap-from-balance',
  toLabel: 'wrap-to-label',
  toSymbol: 'wrap-to-symbol',
  toBalance: 'wrap-to-balance'
} as const;

const normalizeAmount = (value: string) => value.replace(',', '.');

const formatBalance = (value?: bigint) => {
  if (value === undefined) return '-';

  const formatted = Number(formatEther(value));
  if (!Number.isFinite(formatted)) return '0';
  if (formatted === 0) return '0';
  if (formatted < 0.000001) return '<0.000001';

  return formatted.toLocaleString(undefined, {
    maximumFractionDigits: 6
  });
};

const parseAmount = (value: string) => {
  const normalized = normalizeAmount(value);
  if (!normalized || normalized === '.') return null;

  try {
    return parseEther(normalized);
  } catch {
    return null;
  }
};

export default function WrapPage() {
  const theme = useTheme();
  const intl = useIntl();
  const { address, isConnected } = useAccount();
  const walletChainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { sendTransaction, txState, txError, resetTx } = useWriteTransaction();

  const [mode, setMode] = useState<Mode>('wrap');
  const [selectedChainId, setSelectedChainId] = useState<WrappedNativeChainId>(DEFAULT_CHAIN_ID);
  const [amount, setAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  const selectedChain = wrappedNativeTokenConfig[selectedChainId];
  const walletChainSupported = walletChainId in wrappedNativeTokenConfig;
  const isWalletOnSelectedChain = walletChainId === selectedChainId;

  const {
    data: nativeBalance,
    refetch: refetchNativeBalance,
    isLoading: isNativeBalanceLoading
  } = useBalance({
    address,
    chainId: selectedChain.chainId,
    query: {
      enabled: !!address
    }
  });

  const {
    data: wrappedBalance,
    refetch: refetchWrappedBalance,
    isLoading: isWrappedBalanceLoading
  } = useReadContract({
    abi: wethABI.abi,
    address: selectedChain.wrappedAddress,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: selectedChain.chainId,
    query: {
      enabled: !!address
    }
  });

  const fromBalance = mode === 'wrap' ? nativeBalance?.value : (wrappedBalance as bigint | undefined);
  const toBalance = mode === 'wrap' ? (wrappedBalance as bigint | undefined) : nativeBalance?.value;
  const fromSymbol = mode === 'wrap' ? selectedChain.nativeSymbol : selectedChain.wrappedSymbol;
  const toSymbol = mode === 'wrap' ? selectedChain.wrappedSymbol : selectedChain.nativeSymbol;

  const amountValue = useMemo(() => parseAmount(amount), [amount]);
  const hasAmount = amountValue !== null && amountValue > 0n;
  const hasInsufficientBalance = !!amountValue && fromBalance !== undefined && amountValue > fromBalance;
  const isBalanceLoading = isNativeBalanceLoading || isWrappedBalanceLoading;
  const isTxBusy = txState === 'submitting' || txState === 'submitted';

  useEffect(() => {
    if (walletChainSupported) {
      setSelectedChainId(walletChainId as WrappedNativeChainId);
      setAmount('');
      resetTx();
    }
  }, [resetTx, walletChainId, walletChainSupported]);

  useEffect(() => {
    if (txState === 'confirmed') {
      dispatchSuccess(intl.formatMessage({ id: mode === 'wrap' ? 'tx.completed.wrap' : 'tx.completed.unwrap' }));
      setAmount('');
      refetchNativeBalance();
      refetchWrappedBalance();
      resetTx();
    }

    if (txState === 'error') {
      dispatchError(parseError(txError, intl.formatMessage({ id: 'tx.failed' })));
    }
  }, [intl, mode, refetchNativeBalance, refetchWrappedBalance, resetTx, txError, txState]);

  const handleNetworkChange = useCallback(
    async (event: SelectChangeEvent<number>) => {
      const nextChainId = Number(event.target.value) as WrappedNativeChainId;
      const previousChainId = selectedChainId;

      setSelectedChainId(nextChainId);
      setAmount('');
      resetTx();

      if (!isConnected || walletChainId === nextChainId) return;

      try {
        await switchChainAsync({ chainId: nextChainId });
      } catch (error) {
        setSelectedChainId(previousChainId);
        dispatchError(parseError(error, intl.formatMessage({ id: 'tx.switchNetworkFailed' })));
      }
    },
    [intl, isConnected, resetTx, selectedChainId, switchChainAsync, walletChainId]
  );

  const handleSwap = () => {
    if (isTxBusy) return;
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 300);
    setMode((prev) => (prev === 'wrap' ? 'unwrap' : 'wrap'));
    setAmount('');
    resetTx();
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (!amountPattern.test(nextValue)) return;

    setAmount(nextValue);
    if (txState === 'error') resetTx();
  };

  const handleMax = () => {
    if (fromBalance === undefined) return;
    setAmount(formatEther(fromBalance));
    resetTx();
  };

  const handleSubmit = async () => {
    if (!amountValue || !isConnected || !address || hasInsufficientBalance || isTxBusy) return;

    if (!isWalletOnSelectedChain) {
      try {
        await switchChainAsync({ chainId: selectedChainId });
      } catch (error) {
        dispatchError(parseError(error, intl.formatMessage({ id: 'tx.switchNetworkFailed' })));
      }
      return;
    }

    if (mode === 'wrap') {
      await sendTransaction({
        abi: wethABI.abi,
        address: selectedChain.wrappedAddress,
        functionName: 'deposit',
        value: amountValue as never
      });
    } else {
      await sendTransaction({
        abi: wethABI.abi,
        address: selectedChain.wrappedAddress,
        functionName: 'withdraw',
        args: [amountValue]
      });
    }
  };

  // The panel is marked up as a <form> purely for semantics/landmarks. Submission
  // stays driven by the action button's onClick, so implicit submission is a no-op.
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const actionLabel = useMemo(() => {
    const t = (id: string, values?: Record<string, string>) => intl.formatMessage({ id }, values);

    if (!isConnected) return t('wallet.connect');
    if (!walletChainSupported) return t('wrap.action.unsupportedNetwork');
    if (!isWalletOnSelectedChain) return t('wrap.action.switchTo', { chain: selectedChain.chainName });
    if (!amount) return t(mode === 'wrap' ? 'wrap.action.enterAmount.wrap' : 'wrap.action.enterAmount.unwrap');
    if (!hasAmount) return t('wrap.action.invalidAmount');
    if (hasInsufficientBalance) return t('wrap.action.insufficientBalance', { symbol: fromSymbol });
    if (isSwitchingChain) return t('wrap.action.switchingNetwork');
    if (isTxBusy) return t(mode === 'wrap' ? 'wrap.action.wrapping' : 'wrap.action.unwrapping');
    if (txState === 'error') return t('wrap.action.retry');

    return t(mode === 'wrap' ? 'wrap.action.wrap' : 'wrap.action.unwrap');
  }, [
    amount,
    fromSymbol,
    hasAmount,
    hasInsufficientBalance,
    intl,
    isConnected,
    isSwitchingChain,
    isTxBusy,
    isWalletOnSelectedChain,
    mode,
    selectedChain.chainName,
    txState,
    walletChainSupported
  ]);

  // Longer, context-rich name for AT/agents. Returns undefined when the visible
  // label is already unambiguous, so the visible text stays the accessible name.
  const actionAriaLabel = useMemo(() => {
    if (!isConnected || !walletChainSupported) return undefined;

    const chain = selectedChain.chainName;
    const t = (id: string, values?: Record<string, string>) => intl.formatMessage({ id }, values);

    if (!isWalletOnSelectedChain) return t('wrap.action.aria.switchTo', { chain });
    if (!amount)
      return t(mode === 'wrap' ? 'wrap.action.aria.enterAmount.wrap' : 'wrap.action.aria.enterAmount.unwrap', {
        from: fromSymbol,
        to: toSymbol,
        chain
      });
    if (!hasAmount || hasInsufficientBalance || isSwitchingChain) return undefined;

    const operation = { amount: normalizeAmount(amount), from: fromSymbol, to: toSymbol, chain };

    if (isTxBusy) return t(mode === 'wrap' ? 'wrap.action.aria.wrapping' : 'wrap.action.aria.unwrapping', operation);
    if (txState === 'error') return t(mode === 'wrap' ? 'wrap.action.aria.retry.wrap' : 'wrap.action.aria.retry.unwrap', operation);

    return t(mode === 'wrap' ? 'wrap.action.aria.wrap' : 'wrap.action.aria.unwrap', operation);
  }, [
    amount,
    fromSymbol,
    hasAmount,
    hasInsufficientBalance,
    intl,
    isConnected,
    isSwitchingChain,
    isTxBusy,
    isWalletOnSelectedChain,
    mode,
    selectedChain.chainName,
    toSymbol,
    txState,
    walletChainSupported
  ]);

  const actionDescribedBy =
    [
      isConnected && !walletChainSupported ? ID.networkWarning : null,
      txState === 'submitted' ? ID.txStatus : null,
      txState === 'error' ? ID.txError : null,
      ID.rateNote
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const isActionDisabled =
    isConnected &&
    (!walletChainSupported || !hasAmount || hasInsufficientBalance || isSwitchingChain || isTxBusy || isBalanceLoading);

  const panelBg = alpha(theme.palette.text.primary, 0.045);
  const panelBgTo = alpha(theme.palette.text.primary, 0.028);

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 96px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: { xs: 4, md: 6 }
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 4,
          p: 2,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.96),
          boxShadow: `0 24px 80px ${alpha(theme.palette.common.black, 0.16)}`
        }}
      >
        <Stack
          component="form"
          spacing={2}
          noValidate
          onSubmit={handleFormSubmit}
          aria-labelledby={ID.heading}
          aria-describedby={ID.rateNote}
          aria-busy={isTxBusy || isSwitchingChain}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography id={ID.heading} component="h1" variant="h5" fontWeight={700}>
              {intl.formatMessage({ id: mode === 'wrap' ? 'wrap.title.wrap' : 'wrap.title.unwrap' })}
            </Typography>

            <FormControl size="small" sx={{ minWidth: 142 }}>
              <Select
                value={selectedChainId}
                onChange={handleNetworkChange}
                disabled={isSwitchingChain}
                inputProps={{ 'aria-label': intl.formatMessage({ id: 'wrap.network.aria' }) }}
              >
                {wrappedNativeChains.map((chain) => (
                  <MenuItem key={chain.chainId} value={chain.chainId}>
                    {chain.chainName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {isConnected && !walletChainSupported && (
            <Alert severity="warning" id={ID.networkWarning}>
              {intl.formatMessage({ id: 'wrap.network.unsupported' })}
            </Alert>
          )}

          {/* From panel */}
          <Stack
            spacing={1}
            role="group"
            aria-labelledby={`${ID.fromLabel} ${ID.fromSymbol}`}
            sx={{
              borderRadius: 3,
              p: 1.75,
              bgcolor: panelBg
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
              <Typography id={ID.fromLabel} variant="body2" color="text.secondary">
                {intl.formatMessage({ id: 'wrap.direction.from' })}
              </Typography>
              <Typography id={ID.fromBalance} variant="body2" color="text.secondary">
                {intl.formatMessage(
                  { id: 'wrap.balance' },
                  { value: isConnected ? formatBalance(fromBalance) : '-', symbol: fromSymbol }
                )}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5 }}>
              <CustomInput
                fullWidth
                id="wrap-amount"
                value={amount}
                onChange={handleAmountChange}
                disabled={!isConnected || isTxBusy}
                placeholder="0"
                inputProps={{
                  inputMode: 'decimal',
                  'aria-label': intl.formatMessage(
                    { id: mode === 'wrap' ? 'wrap.amount.aria.wrap' : 'wrap.amount.aria.unwrap' },
                    { symbol: fromSymbol }
                  ),
                  'aria-describedby': ID.fromBalance,
                  'aria-invalid': hasInsufficientBalance
                }}
                sx={{
                  '& .MuiInputBase-root': { fontSize: '2.25rem' },
                  '& .MuiInputBase-input::placeholder': { fontSize: '2.25rem' }
                }}
              />

              <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TokenIcon symbol={fromSymbol} avatarProps={{ sx: { width: 34, height: 34 } }} />
                    <Typography id={ID.fromSymbol} component="div" variant="h4" sx={{ minWidth: 52 }}>
                      {fromSymbol}
                    </Typography>
                  </Stack>
                </Box>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleMax}
                  disabled={!isConnected || fromBalance === undefined || isTxBusy}
                  aria-label={intl.formatMessage({ id: 'wrap.max.aria' }, { symbol: fromSymbol })}
                  sx={{ minWidth: 0, px: 0.5, py: 0, fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.5 }}
                >
                  {intl.formatMessage({ id: 'wrap.max' })}
                </Button>
              </Box>
            </Box>
          </Stack>
          {/* Swap direction button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: -0.5 }}>
            <IconButton
              onClick={handleSwap}
              disabled={isTxBusy}
              aria-label={intl.formatMessage(
                { id: mode === 'wrap' ? 'wrap.swap.toUnwrap.aria' : 'wrap.swap.toWrap.aria' },
                { native: selectedChain.nativeSymbol, wrapped: selectedChain.wrappedSymbol }
              )}
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                transition: 'transform 0.3s ease',
                transform: isSwapping ? 'rotate(180deg)' : 'rotate(0deg)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.text.primary, 0.06)
                }
              }}
            >
              <SwapVertIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* To panel */}
          <Stack
            spacing={1}
            role="group"
            aria-labelledby={`${ID.toLabel} ${ID.toSymbol}`}
            sx={{
              borderRadius: 3,
              p: 1.75,
              bgcolor: panelBg
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Typography id={ID.toLabel} variant="body2" color="text.secondary">
                {intl.formatMessage({ id: 'wrap.direction.to' })}
              </Typography>
              <Typography id={ID.toBalance} variant="body2" color="text.secondary">
                {intl.formatMessage({ id: 'wrap.balance' }, { value: isConnected ? formatBalance(toBalance) : '-', symbol: toSymbol })}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, pt: 1, alignItems: 'center' }}>
              <Typography
                component="div"
                variant="h2"
                sx={{
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '2.25rem',
                  color: 'text.secondary',
                  height: '3rem',
                }}
              >
                {amount || '0'}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                <TokenIcon symbol={toSymbol} avatarProps={{ sx: { width: 34, height: 34 } }} />
                <Typography id={ID.toSymbol} component="div" variant="h4" sx={{ minWidth: 52 }}>
                  {toSymbol}
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ height: 5 }} />
          </Stack>

          {txState === 'submitted' && (
            <Alert severity="info" role="status" id={ID.txStatus} icon={<CircularProgress size={18} aria-hidden="true" />}>
              {intl.formatMessage({ id: 'tx.submitted' })}
            </Alert>
          )}

          {txState === 'error' && (
            <Alert severity="error" id={ID.txError}>
              {parseError(txError, intl.formatMessage({ id: 'tx.failed' }))}
            </Alert>
          )}

          <ConnectButton.Custom>
            {({ openConnectModal, mounted }) => {
              const ready = mounted;

              return (
                <Button
                  type="button"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!ready || isActionDisabled}
                  onClick={isConnected ? handleSubmit : openConnectModal}
                  aria-label={actionAriaLabel}
                  aria-describedby={actionDescribedBy}
                  aria-busy={isTxBusy || isSwitchingChain}
                  sx={{ height: 56, borderRadius: 3, fontSize: 17, fontWeight: 800 }}
                >
                  {actionLabel}
                </Button>
              );
            }}
          </ConnectButton.Custom>

          <Typography id={ID.rateNote} variant="caption" color="text.secondary" textAlign="center">
            {intl.formatMessage(
              { id: 'wrap.rateNote' },
              {
                native: selectedChain.nativeSymbol,
                wrapped: selectedChain.wrappedSymbol,
                chain: selectedChain.chainName
              }
            )}
          </Typography>
        </Stack>
      </Paper>

      <SuggestToken />
      <WrapFaq />
    </Box>
  );
}
