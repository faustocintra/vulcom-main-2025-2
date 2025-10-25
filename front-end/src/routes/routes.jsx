/*
 Define as rotas e suas informações, servindo como fonte única
 de verdade para AppRoutes.jsx e MainMenu.jsx.
*/

import Homepage from '../pages/Homepage'

import Login from '../pages/Login'

import CustomersList from '../pages/customer/CustomerList'
import CustomersForm from '../pages/customer/CustomerForm'

import CarsList from '../pages/car/CarList'
import CarsForm from '../pages/car/CarForm'

import UsersList from '../pages/user/UserList'
import UsersForm from '../pages/user/UserForm'

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
   element: <CustomersList />,
   userLevel: UserLevel.AUTHENTICATED
 },
 {
   route: '/customers/new',
   description: 'Cadastro de clientes',
   element: <CustomersForm />,
   userLevel: UserLevel.AUTHENTICATED,
   divider: true
 },
 {
   route: '/customers/:id',
   description: 'Alterar cliente',
   element: <CustomersForm />,
   userLevel: UserLevel.ADMIN,
   omitFromMainMenu: true
 },
 {
   route: '/cars',
   description: 'Listagem de veículos',
   element: <CarsList />,
   userLevel: UserLevel.AUTHENTICATED
 },
 {
   route: '/cars/new',
   description: 'Cadastro de veículos',
   element: <CarsForm />,
   userLevel: UserLevel.AUTHENTICATED,
   divider: true
 },
 {
   route: '/cars/:id',
   description: 'Alterar veículo',
   element: <CarsForm />,
   userLevel: UserLevel.ADMIN,
   omitFromMainMenu: true
 },
 {
   route: '/users',
   description: 'Listagem de usuários',
   element: <UsersList />,
   userLevel: UserLevel.ADMIN
 },
 {
   route: '/users/new',
   description: 'Cadastro de usuários',
   element: <UsersForm />,
   userLevel: UserLevel.ADMIN
 },
 {
   route: '/users/:id',
   description: 'Alterar usuário',
   element: <UsersForm />,
   userLevel: UserLevel.ADMIN,
   omitFromMainMenu: true
 },
]

export { routes, UserLevel }