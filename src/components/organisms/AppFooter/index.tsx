import { Box, Typography, Link } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'

const authorName = import.meta.env.VITE_AUTHOR_NAME
const authorGithub = import.meta.env.VITE_AUTHOR_GITHUB
const feedbackEmail = import.meta.env.VITE_FEEDBACK_EMAIL

export function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        px: { xs: 2, sm: 3, md: 4 },
        py: 2,
        maxWidth: 1200,
        width: '100%',
        mx: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        Feito com
        <FavoriteIcon sx={{ fontSize: 11, color: 'error.main', mx: 0.25 }} />
        por{' '}
        <Link href={authorGithub} target="_blank" rel="noopener noreferrer" underline="hover" color="text.secondary">
          {authorName}
        </Link>
      </Typography>

      <Link
        href={`mailto:${feedbackEmail}?subject=Feedback`}
        underline="hover"
        color="text.secondary"
        sx={{ typography: 'caption' }}
      >
        Enviar feedback
      </Link>
    </Box>
  )
}
