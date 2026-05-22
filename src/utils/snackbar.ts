import { enqueueSnackbar } from 'notistack';

export function parseError(error: unknown, fallback = 'Something went wrong'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error.split('\n')[0] || fallback;
  if (typeof error === 'object') {
    if ('shortMessage' in error && typeof (error as any).shortMessage === 'string') {
      return (error as any).shortMessage;
    }
    if ('message' in error && typeof (error as any).message === 'string') {
      return (error as any).message.split('\n')[0] || fallback;
    }
  }
  return fallback;
}

/**
 * Default duration (in milliseconds) for how long snackbars should remain visible
 */
const DEFAULT_DURATION = 3500;

/**
 * Display a success snackbar notification
 * @param message The message to display in the snackbar
 */
export const dispatchSuccess = (message: string) => {
  enqueueSnackbar(message, {
    autoHideDuration: DEFAULT_DURATION,
    variant: 'success',
    anchorOrigin: { vertical: 'top', horizontal: 'center' },
    preventDuplicate: true,
    hideIconVariant: false
  });
};

/**
 * Display an error snackbar notification
 * @param message The message to display in the snackbar
 */
export const dispatchError = (message: string) => {
  enqueueSnackbar(message, {
    autoHideDuration: DEFAULT_DURATION,
    variant: 'error',
    anchorOrigin: { vertical: 'top', horizontal: 'center' },
    preventDuplicate: true,
    hideIconVariant: false
  });
};

/**
 * Display an info snackbar notification
 * @param message The message to display in the snackbar
 */
export const dispatchInfo = (message: string) => {
  enqueueSnackbar(message, {
    autoHideDuration: DEFAULT_DURATION,
    variant: 'info',
    anchorOrigin: { vertical: 'top', horizontal: 'center' },
    preventDuplicate: true,
    hideIconVariant: false
  });
};

/**
 * Display a warning snackbar notification
 * @param message The message to display in the snackbar
 */
export const dispatchWarning = (message: string) => {
  enqueueSnackbar(message, {
    autoHideDuration: DEFAULT_DURATION,
    variant: 'warning',
    anchorOrigin: { vertical: 'top', horizontal: 'center' },
    preventDuplicate: true,
    hideIconVariant: false
  });
};
