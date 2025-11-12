import { Router } from 'express'
import controller from '../controllers/cars.js'
import { validateBody } from '../validators/validate.js'

const router = Router()

router.post('/', validateBody, controller.create)
router.get('/', controller.retrieveAll)
router.get('/:id', controller.retrieveOne)
router.put('/:id', validateBody, controller.update)
router.delete('/:id', controller.delete)

export default router