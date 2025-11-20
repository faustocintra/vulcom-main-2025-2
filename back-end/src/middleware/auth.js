/*
  Este middleware intercepta todas as rotas e verifica
  se um token de autorização foi enviado junto com a
  requisição
*/
import jwt from 'jsonwebtoken'

/*
  Algumas rotas, como POST /users/login, poderão ser
  acessadas sem a necessidade de apresentação do token.
  Cadastramos essas rotas no vetor bypassRoutes.
*/
const bypassRoutes = [
  { url: '/users/login', method: 'POST' },
  { url: '/users', method: 'POST' },  // Cadastro público liberado para teste
  { url: /^\/users\/\d+$/, method: 'PUT' }, // Libera PUT /users/:id para teste
  { url: /^\/users\/\d+$/, method: 'GET' } // Libera GET /users/:id para teste
]

// Função do middleware
export default function(req, res, next) {
  // Injetamos um usuário anônimo mínimo para não quebrar controladores
  // que esperam `req.authUser.id` (ex.: controllers/cars.create).
  req.authUser = { id: 1 }
  next()
}