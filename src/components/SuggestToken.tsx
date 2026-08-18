import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function SuggestToken() {
  const theme = useTheme();
  const intl = useIntl();
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
    <Box component="section" aria-labelledby="suggest-token-heading" sx={{ width: '100%', maxWidth: 460, mt: 5, mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: 3,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.96)
        }}
      >
        <Typography id="suggest-token-heading" component="h2" variant="h5" fontWeight={700} mb={0.75}>
          {intl.formatMessage({ id: 'suggest.title' })}
        </Typography>
        <Typography id="suggest-token-description" variant="body2" color="text.secondary" mb={2.5}>
          {intl.formatMessage({ id: 'suggest.description' })}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} aria-busy={status === 'submitting'}>
          <TextField
            fullWidth
            id="suggest-token-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={intl.formatMessage({ id: 'suggest.input.placeholder' })}
            required
            disabled={status === 'submitting'}
            size="small"
            inputProps={{
              'aria-label': intl.formatMessage({ id: 'suggest.input.aria' }),
              'aria-describedby': 'suggest-token-description',
              'aria-invalid': status === 'error'
            }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              type="submit"
              variant="outlined"
              disabled={status === 'submitting' || !token.trim()}
              aria-label={intl.formatMessage({ id: status === 'submitting' ? 'suggest.sending.aria' : 'suggest.submit.aria' })}
              startIcon={status === 'submitting' ? <CircularProgress size={14} color="inherit" aria-hidden="true" /> : undefined}
            >
              {intl.formatMessage({ id: status === 'submitting' ? 'suggest.sending' : 'suggest.submit' })}
            </Button>

            {status === 'success' && (
              <Typography role="status" variant="body2" color="success.main">
                {intl.formatMessage({ id: 'suggest.success' })}
              </Typography>
            )}
            {status === 'error' && (
              <Typography role="alert" variant="body2" color="error.main">
                {intl.formatMessage({ id: 'suggest.error' })}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
