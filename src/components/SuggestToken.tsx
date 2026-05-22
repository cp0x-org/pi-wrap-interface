import { useState } from 'react';
import { Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function SuggestToken() {
  const theme = useTheme();
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || status === 'submitting') return;

    setStatus('submitting');
    try {
      const web3formsKey = (window as any).APP_CONFIG?.web3formsKey ?? '';
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: web3formsKey,
          subject: `Token suggestion: ${token.trim()}`,
          Token: token.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setToken('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 460, mt: 5, mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: 3,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.96)
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={0.75}>
          Don't see your token?
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2.5}>
          Let us know which token or chain you'd like us to add — we review all suggestions.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g. WBTC on Base or 0x123..."
            required
            disabled={status === 'submitting'}
            size="small"
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              type="submit"
              variant="outlined"
              disabled={status === 'submitting' || !token.trim()}
              startIcon={status === 'submitting' ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              {status === 'submitting' ? 'Sending...' : 'Submit'}
            </Button>

            {status === 'success' && (
              <Typography variant="body2" color="success.main">
                Sent! We'll review it soon.
              </Typography>
            )}
            {status === 'error' && (
              <Typography variant="body2" color="error.main">
                Something went wrong, try again.
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
