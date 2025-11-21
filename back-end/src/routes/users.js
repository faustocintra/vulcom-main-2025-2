import { Router } from 'express'
import controller from '../controllers/users.js'

const router = Router()

router.post('/', controller.create)
router.get('/', controller.retrieveAll)

// As rotas /me, /login e /logout devem vir antes da rota /:id
// para que não sejam confundidas com um parâmetro id
router.post('/login', controller.login)
router.get('/me', controller.me)
router.post('/logout', controller.logout)

router.get('/:id', controller.retrieveOne)
router.put('/:id', controller.update)
router.delete('/:id', controller.delete)

export default router