import type { Components, Theme } from '@mui/material'

export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      '*': {
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      },
      html: {
        scrollBehavior: 'smooth',
      },
      body: {
        backgroundColor: '#F7F8FA',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#C8D0DA',
        borderRadius: '3px',
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: '8px',
        padding: '8px 20px',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      outlined: {
        borderWidth: '1px',
        '&:hover': {
          borderWidth: '1px',
        },
      },
      sizeSmall: {
        padding: '5px 14px',
        fontSize: '0.8125rem',
      },
      sizeLarge: {
        padding: '11px 28px',
        fontSize: '1rem',
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'small',
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        transition: 'box-shadow 0.2s ease',
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#1E3A5F',
        },
        '&.Mui-focused': {
          boxShadow: '0 0 0 3px rgba(30, 58, 95, 0.08)',
        },
      },
      input: {
        padding: '10px 14px',
      },
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        border: '1px solid #E4E8EF',
        borderRadius: '12px',
        transition: 'border-color 0.2s ease',
        '&:hover': {
          borderColor: '#B8C4D4',
        },
      },
    },
  },
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      outlined: {
        border: '1px solid #E4E8EF',
        borderRadius: '12px',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '6px',
        fontWeight: 500,
        fontSize: '0.75rem',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: '#E4E8EF',
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      arrow: true,
    },
    styleOverrides: {
      tooltip: {
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 500,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '16px',
        border: '1px solid #E4E8EF',
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: '4px',
        backgroundColor: '#E4E8EF',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 600,
        fontSize: '0.75rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#5A6478',
        borderBottom: '2px solid #E4E8EF',
        backgroundColor: '#F7F8FA',
      },
      body: {
        borderBottom: '1px solid #F0F2F5',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.15s ease',
        '&:hover': {
          backgroundColor: '#F7F9FC',
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        transition: 'all 0.2s ease',
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        padding: 8,
      },
      track: {
        borderRadius: 22 / 2,
      },
    },
  },
  MuiSelect: {
    defaultProps: {
      size: 'small',
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: '6px',
        margin: '2px 6px',
        padding: '6px 10px',
        fontSize: '0.875rem',
        transition: 'background-color 0.15s ease',
      },
    },
  },
  MuiList: {
    styleOverrides: {
      root: {
        padding: '6px',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        transition: 'all 0.2s ease',
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        top: '-0.25rem',
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        marginLeft: '2px',
        marginTop: '4px',
        fontSize: '0.75rem',
      },
    },
  },
  MuiBreadcrumbs: {
    styleOverrides: {
      root: {
        fontSize: '0.875rem',
      },
    },
  },
}
