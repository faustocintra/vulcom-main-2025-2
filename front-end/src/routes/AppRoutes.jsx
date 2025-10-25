import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AuthGuard from './AuthGuard'

import Homepage from '../pages/Homepage'

import CarForm from '../pages/car/CarForm'
import CarList from '../pages/car/CarList'

import CustomerForm from '../pages/customer/CustomerForm'
import CustomerList from '../pages/customer/CustomerList'

import UserList from '../pages/user/UserList'
import UserForm from '../pages/user/UserForm'

import Login from '../pages/Login'

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


    <Route path="/cars" element={ <CarList /> } />
    <Route path="/cars/new" element={ <CarForm /> } />
    <Route path="/cars/:id" element={ <CarForm /> } />

    <Route path="/customers" element={ 
      <CustomerList /> 
    } />
    
    <Route path="/customers/new" element={ <CustomerForm />} />
    <Route path="/customers/:id" element={ <CustomerForm />  } />

    <Route path="/users" element={ <UserList /> } />
    <Route path="/users/new" element={ <UserForm /> } />
    <Route path="/users/:id" element={ <UserForm /> } />
    
  </Routes>
}