import dotenv from 'dotenv'
dotenv.config()

import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

const app = express()

import cors from 'cors'

// CORS mais robusto
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true // Descomente se usar cookies/sessions
}))

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())

/*********** ROTAS DA API **************/

// ⚠️ REMOVA ou MODIFIQUE o middleware auth global se tiver rotas públicas
// import auth from './middleware/auth.js'
// app.use(auth) // Isso autentica TODAS as rotas

// Rotas públicas (sem autenticação) - se houver
import usersRouter from './routes/users.js'
app.use('/users', usersRouter) // Ex: login, registro

// Rotas protegidas (com autenticação)
import auth from './middleware/auth.js'
import carsRouter from './routes/cars.js'
import customersRouter from './routes/customers.js'

app.use('/cars', auth, carsRouter) // Aplica auth apenas nas rotas de cars
app.use('/customers', auth, customersRouter) // Aplica auth apenas nas rotas de customers

export default app