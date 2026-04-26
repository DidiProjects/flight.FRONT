import type { SxProps } from '@mui/material'

export type ChipStatus = 'active' | 'pending' | 'suspended' | 'paused'

const colorMap: Record<ChipStatus, { bg: string; text: string; bullet: string; border: string }> = {
  active:    { bg: '#E8F7F1', text: '#1E7050', bullet: '#2D9B6B', border: 'rgba(45,155,107,0.3)' },
  pending:   { bg: '#FEF3E2', text: '#A86308', bullet: '#D9860A', border: 'rgba(217,134,10,0.3)' },
  suspended: { bg: '#FDEAEA', text: '#A82E2E', bullet: '#D94040', border: 'rgba(217,64,64,0.3)' },
  paused:    { bg: '#F1EFE8', text: '#5F5E5A', bullet: '#9BA5B4', border: 'rgba(155,165,180,0.3)' },
}

export const chipStyles = {
  root: (status: ChipStatus): SxProps => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    px: 1,
    py: 0.375,
    borderRadius: '99px',
    backgroundColor: colorMap[status].bg,
    border: `1px solid ${colorMap[status].border}`,
    color: colorMap[status].text,
  }),

  bullet: (status: ChipStatus): SxProps => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: colorMap[status].bullet,
    flexShrink: 0,
  }),

  label: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    color: 'inherit',
    lineHeight: 1,
  } as SxProps,
}
