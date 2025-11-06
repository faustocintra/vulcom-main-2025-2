import { Routes, Route } from 'react-router-dom'

import AuthGuard from './AuthGuard'

import { routes, UserLevel } from './routes'

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={ <Homepage /> } />

    <Route path="/login" element={ <Login /> } />

    <Route path="/cars" element={ <AuthGuard> <CarList /> </AuthGuard> } />
    <Route path="/cars/new" element={ <AuthGuard> <CarForm /> </AuthGuard> } />
    <Route path="/cars/:id" element={ <AuthGuard> <CarForm /> </AuthGuard> } />

    <Route path="/customers" element={ 
      <AuthGuard> <CustomerList /> </AuthGuard> 
    } />

    <Route path="/customers/new" element={ 
      <AuthGuard> <CustomerForm /> </AuthGuard>
    } />
    <Route path="/customers/:id" element={ 
      <AuthGuard> <CustomerForm /> </AuthGuard>  
    } />

    <Route path="/users" element={ 
      <AuthGuard adminOnly={true}> <UserList /> </AuthGuard> } 
    />
    <Route path="/users/new" element={ 
      <AuthGuard adminOnly={true}> <UserForm /> </AuthGuard> } 
    />
    <Route path="/users/:id" element={ 
      <AuthGuard adminOnly={true}> <UserForm /> </AuthGuard> } 
    />
    
  </Routes>
}
