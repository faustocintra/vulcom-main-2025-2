
import React from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import myfetch from '../lib/myfetch'
import AuthUserContext from '../contexts/AuthUserContext'
import useWaiting from '../ui/useWaiting'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'


import { UserLevel } from './routes'


export default function AuthGuard({ children, userLevel = UserLevel.ANY }) {


 const { setAuthUser, authUser, setRedirectLocation } = React.useContext(AuthUserContext)
  const [status, setStatus] = React.useState('IDLE')


 const location = useLocation()
 const { showWaiting, Waiting } = useWaiting()
 const navigate = useNavigate()


 async function checkAuthUser() {
   if(setStatus) setStatus('PROCESSING')
   showWaiting(true)
   try {
     const authUser = await myfetch.get('/users/me')
     setAuthUser(authUser)
   }
   catch(error) {
     setAuthUser(null)
     console.error(error)
     navigate('/login', { replace: true })
   }
   finally {
     showWaiting(false)
     setStatus('DONE')
   }
 }


 React.useEffect(() => {
   // Salva a rota atual para posterior redirecionamento,
   // caso a rota atual não seja o próprio login
   if(! location.pathname.includes('login')) setRedirectLocation(location)


   checkAuthUser()
 }, [location])


 // Enquanto ainda não temos a resposta do back-end para /users/me,
 // exibimos um componente Waiting
 if(status === 'PROCESSING') return <Waiting />


 /*
   Se não há usuário autenticado e o nível de acesso assim o
   exige, redirecionamos para a página de login
 */
 if(!authUser && userLevel > UserLevel.ANY) {
   console.log({authUser, userLevel})
   return <Navigate to="/login" replace />
 }


 /*
   Senão, se há um usuário não administrador tentando acessar uma
   rota exclusiva para esse nível, mostramos uma mensagem de acesso negado
 */
 if(!(authUser?.is_admin) && userLevel === UserLevel.ADMIN) return (
   <Box>
     <Typography variant="h2" color="error">
       Acesso negado
     </Typography>
   </Box>
 )


   /*
     Se chegou até aqui, é porque a rota é liberada para qualquer
     um ou o usuário possui autorização para acessar o
     nível
   */
   console.log('AUTHGUARD:', authUser)
   return children
 }

