import { alpha, Theme } from '@mui/material/styles';

import { ThemeMode } from 'config';

export default function componentStyleOverrides(theme: Theme, borderRadius: number, outlinedFilled: boolean) {
  const mode = theme.palette.mode;
  const bgColor = mode === ThemeMode.DARK ? theme.palette.dark[800] : theme.palette.grey[50];

  return {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: `${borderRadius}px`
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        },
        rounded: {
          borderRadius: `${borderRadius}px`
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          alignItems: 'center'
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: theme.palette.text.dark,
          '&::placeholder': {
            color: theme.palette.text.secondary,
            fontSize: '0.875rem'
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: outlinedFilled ? bgColor : 'transparent',
          borderRadius: `${borderRadius}px`,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === ThemeMode.DARK ? alpha(theme.palette.text.primary, 0.28) : theme.palette.grey[400]
          }
        },
        input: {
          fontWeight: 500,
          background: outlinedFilled ? bgColor : 'transparent',
          borderRadius: `${borderRadius}px`
        },
        notchedOutline: {
          borderRadius: `${borderRadius}px`
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          '&:focus': {
            backgroundColor: 'transparent'
          }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        flexContainer: {
          borderBottom: 0
        }
      }
    }
  };
}
