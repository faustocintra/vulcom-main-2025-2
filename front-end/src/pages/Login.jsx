import React from 'react'
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import myfetch from '../lib/myfetch'
import useNotification from '../ui/useNotification'
import useWaiting from '../ui/useWaiting'
import { useNavigate } from 'react-router-dom'
import AuthUserContext from '../contexts/AuthUserContext'

export default function Login() {

  const [state, setState] = React.useState({
    email: '',
    password: '',
    showPassword: false
  })
  const {
    email,
    password,
    showPassword
  } = state

  const { 
    setAuthUser, 
    redirectLocation, 
    setRedirectLocation 
  } = React.useContext(AuthUserContext)

  const { notify, Notification} = useNotification()
  const { showWaiting, Waiting } = useWaiting()

  const navigate = useNavigate()

  function handleChange(event) {
    // Atualiza a variável de estado associada ao
    // input que foi modificado
    setState({ ...state, [event.target.name]: event.target.value })
  }

  function handleClick(event) {
    // Alterna a visibilidade da senha
    setState({ ...state, showPassword: !showPassword })
  }

  async function handleSubmit(event) {
    event.preventDefault()      // Evita o recarregamento da página
    showWaiting(true)
    try {

      // Validação básica dos campos para evitar requests com valores vazios
      const trimmed = String(email ?? '').trim()
      if(!trimmed) {
        showWaiting(false)
        notify('Informe nome de usuário ou e-mail.', 'error')
        return
      }
      if(!password) {
        showWaiting(false)
        notify('Informe a senha.', 'error')
        return
      }

      const loginData = { password }

      if(trimmed.includes('@')) loginData.email = trimmed
      // Se o valor da variável email não contiver @, será tratado
      // como um username
      else loginData.username = trimmed

      // console.log({ loginData })

      // Envia email e password para o back-end para fazer autenticação
      const response = await myfetch.post('/users/login', loginData)


      // Armazena as informações do usuário autenticado
      setAuthUser(response.user)

      // Mostra a notificação de sucesso e depois vai para a página inicial
      notify('Autenticação realizada com sucesso', 'success', 1500, () => {
        // Verifica se existe algum destino para redirecionamento
        if(redirectLocation) {
          const dest = redirectLocation
          setRedirectLocation(null)   // Reseta o destino de redirecionamento
          navigate(dest, { replace: true })
        }
        else navigate('/', { replace: true })
      })
    }
    catch(error) {
      console.error(error)
      notify(error.message, 'error')
    }
    finally {
      showWaiting(false)
    }
  }

  return(
    <>
      <Notification />
      <Waiting />

      <Typography variant="h1" gutterBottom>
        Autentique-se
      </Typography>

      <Paper
        elevation={6}
        sx={{
          padding: '24px',
          maxWidth: '500px',
          margin: 'auto'
        }}
      >
        <form onSubmit={handleSubmit}>
          <TextField
            name="email"
            value={email}
            label="Nome de usuário ou e-mail"
            variant="filled"
            fullWidth
            onChange={handleChange}
            autoFocus
            sx={{ mb: '24px' /* mb = marginBottom */ }}
          />

          <TextField
            name="password"
            value={password}
            label="Senha"
            variant="filled"
            type={ showPassword ? 'text': 'password' }
            fullWidth
            onChange={handleChange}
            sx={{ mb: '24px' /* mb = marginBottom */ }}
            InputProps={{
              endAdornment:
                <InputAdornment position="end">
                  <IconButton
                    aria-label="alterna a visibilidade da senha"
                    onClick={handleClick}
                    edge="end"
                  >
                    { showPassword ? <VisibilityOffIcon /> : <VisibilityIcon /> }
                  </IconButton>
                </InputAdornment>
            }}
          />

          <Button
            variant="contained"
            type="submit"
            color="secondary"
            fullWidth
          >
            Enviar
          </Button>
        </form>
      </Paper>
    </>
  )
}