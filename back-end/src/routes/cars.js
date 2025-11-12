import auth from '../middleware/auth.js'
import { Router } from 'express'
import controller from '../controllers/cars.js'

const router = Router()

router.post('/', auth, controller.create)
router.get('/', controller.retrieveAll)
router.get('/:id', controller.retrieveOne)
router.put('/:id', controller.update)
router.delete('/:id', controller.delete)

export default router