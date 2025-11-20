import React from 'react'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import CoffeeIcon from '@mui/icons-material/Coffee'

export default function FooterBar() {
  return (
    <Toolbar
      variant="dense"
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100vw',
        justifyContent: 'center',
        backgroundColor: 'action.disabledBackground'
      }}
    >
      <Typography
        variant="caption"
        sx={{
          '& a': {
            color: 'secondary.light'
          }
        }}
      >
        Desenvolvido e mantido com <CoffeeIcon fontSize="small" /> por Sheila Alves de Araujo (<a href="mailto:sheila.silva12@fatec.sp.gov.br">sheila.silva12@fatec.sp.gov.br</a>)
      </Typography>
    </Toolbar>
  )
}
