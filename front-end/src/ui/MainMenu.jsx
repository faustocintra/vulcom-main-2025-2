import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AuthUserContext from '../contexts/AuthUserContext'
import { routes, UserLevel } from '../routes/routes'


export default function MainMenu() {
 const [anchorEl, setAnchorEl] = React.useState(null);
 const open = Boolean(anchorEl);
 const handleClick = (event) => {
   setAnchorEl(event.currentTarget);
 };
 const handleClose = () => {
   setAnchorEl(null);
 };


 const { authUser } = React.useContext(AuthUserContext)


 // Determina o nível do usuário autenticado
 let currentUserLevel = UserLevel.ANY


 if(!authUser) currentUserLevel = UserLevel.ANY
 else if(authUser.is_admin) currentUserLevel = UserLevel.ADMIN
 else currentUserLevel = UserLevel.AUTHENTICATED


 /*
   Filtra as rotas que se tornarão itens de menu, excluindo:
   - rotas com omitFromMainMenu === true
   - rotas com userLevel > currentUserLevel
 */
 const menuRoutes = routes.filter(
   r => !(r?.omitFromMainMenu) && r.userLevel <= currentUserLevel
 )


 return (
   <div>
       <IconButton
           edge="start"
           color="inherit"
           aria-label="menu"
           sx={{ mr: 2 }}
           aria-controls={open ? 'basic-menu' : undefined}
           aria-haspopup="true"
           aria-expanded={open ? 'true' : undefined}
           onClick={handleClick}
         
       >
         <MenuIcon />
       </IconButton>
     <Menu
       id="basic-menu"
       anchorEl={anchorEl}
       open={open}
       onClose={handleClose}
       slotProps={{
         list: {
           'aria-labelledby': 'basic-button',
         }
       }}
     >
       {
         menuRoutes.map(r => (
           <MenuItem
             key={r.route}
             onClick={handleClose}
             component={Link}
             to={r.route}
             divider={r?.divider}
           >
             {r.description}
           </MenuItem>
         ))
       }
     </Menu>
   </div>
 );
}
