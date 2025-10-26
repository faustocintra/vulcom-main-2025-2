/*
 Define as rotas e suas informações, servindo como fonte única
 de verdade para AppRoutes.jsx e MainMenu.jsx.
*/


import Homepage from '../pages/Homepage'


import Login from '../pages/Login'


import CustomerList from '../pages/customer/CustomerList'
import CustomerForm from '../pages/customer/CustomerForm'


import CarList from '../pages/car/CarList'
import CarForm from '../pages/car/CarForm'


import UserList from '../pages/user/UserList'
import UserForm from '../pages/user/UserForm'


/*
 Os níveis de acesso foram definidos como segue:
 0 ~> qualquer usuário (incluindo quando não há usuário autenticado)
 1 ~> qualquer usuário autenticado
 2 ~> somente usuário administrador
*/
const UserLevel = {
 ANY: 0,
 AUTHENTICATED: 1,
 ADMIN: 2
}


const routes = [
 {
   route: '/',
   description: 'Início',
   element: <Homepage />,
   userLevel: UserLevel.ANY,
   divider: true
 },
 {
   route: '/login',
   description: 'Entrar',
   element: <Login />,
   userLevel: UserLevel.ANY,
   omitFromMainMenu: true
 },
 {
   route: '/customers',
   description: 'Listagem de clientes',
   element: <CustomerList />,
   userLevel: UserLevel.AUTHENTICATED
 },
 {
   route: '/customers/new',
   description: 'Cadastro de clientes',
   element: <CustomerForm />,
   userLevel: UserLevel.AUTHENTICATED,
   divider: true
 },
 {
   route: '/customers/:id',
   description: 'Alterar cliente',
   element: <CustomerForm />,
   userLevel: UserLevel.ADMIN,
   omitFromMainMenu: true
 },
 {
   route: '/cars',
   description: 'Listagem de veículos',
   element: <CarList />,
   userLevel: UserLevel.AUTHENTICATED
 },
 {
   route: '/cars/new',
   description: 'Cadastro de veículos',
   element: <CarForm />,
   userLevel: UserLevel.AUTHENTICATED,
   divider: true
 },
 {
   route: '/cars/:id',
   description: 'Alterar veículo',
   element: <CarForm />,
   userLevel: UserLevel.ADMIN,
   omitFromMainMenu: true
 },
 {
   route: '/users',
   description: 'Listagem de usuários',
   element: <UserList />,
   userLevel: UserLevel.ADMIN
 },
 {
   route: '/users/new',
   description: 'Cadastro de usuários',
   element: <UserForm />,
   userLevel: UserLevel.ADMIN
 },
 {
   route: '/users/:id',
   description: 'Alterar usuário',
   element: <UserForm />,
   userLevel: UserLevel.ADMIN,
   omitFromMainMenu: true
 },
]


export { routes, UserLevel }