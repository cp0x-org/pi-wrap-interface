import { useCallback, useEffect, useMemo, useState } from 'react';
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
      dispatchSuccess(`${mode === 'wrap' ? 'Wrap' : 'Unwrap'} completed`);
      setAmount('');
      refetchNativeBalance();
      refetchWrappedBalance();
      resetTx();
    }

    if (txState === 'error') {
      dispatchError(parseError(txError, 'Transaction failed'));
    }
  }, [mode, refetchNativeBalance, refetchWrappedBalance, resetTx, txError, txState]);

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
        dispatchError(parseError(error, 'Failed to switch network'));
      }
    },
    [isConnected, resetTx, selectedChainId, switchChainAsync, walletChainId]
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
        dispatchError(parseError(error, 'Failed to switch network'));
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

  const actionLabel = useMemo(() => {
    if (!isConnected) return 'Connect Wallet';
    if (!walletChainSupported) return 'Unsupported wallet network';
    if (!isWalletOnSelectedChain) return `Switch to ${selectedChain.chainName}`;
    if (!amount) return mode === 'wrap' ? 'Enter amount to wrap' : 'Enter amount to unwrap';
    if (!hasAmount) return 'Enter valid amount';
    if (hasInsufficientBalance) return `Insufficient ${fromSymbol} balance`;
    if (isSwitchingChain) return 'Switching network...';
    if (isTxBusy) return mode === 'wrap' ? 'Wrapping...' : 'Unwrapping...';
    if (txState === 'error') return 'Try again';

    return mode === 'wrap' ? 'Wrap' : 'Unwrap';
  }, [
    amount,
    fromSymbol,
    hasAmount,
    hasInsufficientBalance,
    isConnected,
    isSwitchingChain,
    isTxBusy,
    isWalletOnSelectedChain,
    mode,
    selectedChain.chainName,
    txState,
    walletChainSupported
  ]);

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
        <Stack spacing={2}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" fontWeight={700}>
              {mode === 'wrap' ? 'Wrap' : 'Unwrap'}
            </Typography>

            <FormControl size="small" sx={{ minWidth: 142 }}>
              <Select value={selectedChainId} onChange={handleNetworkChange} disabled={isSwitchingChain}>
                {wrappedNativeChains.map((chain) => (
                  <MenuItem key={chain.chainId} value={chain.chainId}>
                    {chain.chainName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {isConnected && !walletChainSupported && (
            <Alert severity="warning">This wallet network is not supported. Pick a supported network above.</Alert>
          )}

          {/* From panel */}
          <Stack
            spacing={1}
            sx={{
              borderRadius: 3,
              p: 1.75,
              bgcolor: panelBg
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                From
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Balance: {isConnected ? formatBalance(fromBalance) : '-'} {fromSymbol}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5 }}>
              <CustomInput
                fullWidth
                value={amount}
                onChange={handleAmountChange}
                disabled={!isConnected || isTxBusy}
                placeholder="0"
                inputProps={{ inputMode: 'decimal' }}
                sx={{
                  '& .MuiInputBase-root': { fontSize: '2.25rem' },
                  '& .MuiInputBase-input::placeholder': { fontSize: '2.25rem' }
                }}
              />

              <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TokenIcon symbol={fromSymbol} avatarProps={{ sx: { width: 34, height: 34 } }} />
                    <Typography variant="h4" sx={{ minWidth: 52 }}>
                      {fromSymbol}
                    </Typography>
                  </Stack>
                </Box>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleMax}
                  disabled={!isConnected || fromBalance === undefined || isTxBusy}
                  sx={{ minWidth: 0, px: 0.5, py: 0, fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.5 }}
                >
                  Max
                </Button>
              </Box>
            </Box>
          </Stack>
          {/* Swap direction button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: -0.5 }}>
            <IconButton
              onClick={handleSwap}
              disabled={isTxBusy}
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
            sx={{
              borderRadius: 3,
              p: 1.75,
              bgcolor: panelBg
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                To
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Balance: {isConnected ? formatBalance(toBalance) : '-'} {toSymbol}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, pt: 1, alignItems: 'center' }}>
              <Typography
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
                <Typography variant="h4" sx={{ minWidth: 52 }}>
                  {toSymbol}
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ height: 5 }} />
          </Stack>

          {txState === 'submitted' && (
            <Alert severity="info" icon={<CircularProgress size={18} />}>
              Transaction submitted. Waiting for confirmation.
            </Alert>
          )}

          {txState === 'error' && <Alert severity="error">{parseError(txError, 'Transaction failed')}</Alert>}

          <ConnectButton.Custom>
            {({ openConnectModal, mounted }) => {
              const ready = mounted;

              return (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!ready || isActionDisabled}
                  onClick={isConnected ? handleSubmit : openConnectModal}
                  sx={{ height: 56, borderRadius: 3, fontSize: 17, fontWeight: 800 }}
                >
                  {actionLabel}
                </Button>
              );
            }}
          </ConnectButton.Custom>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            {selectedChain.nativeSymbol} wraps 1:1 into {selectedChain.wrappedSymbol} on {selectedChain.chainName}.
          </Typography>
        </Stack>
      </Paper>

      <SuggestToken />
      <WrapFaq />
    </Box>
  );
}
