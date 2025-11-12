import carSchema from './car.js'

export function validateBody(req, res, next) {
  try {
    // Para PUT (atualizações parciais) permita partial schema
    const usePartial = req.method === 'PUT'
    const parsed = usePartial ? carSchema.partial().safeParse(req.body) : carSchema.safeParse(req.body)
    if (!parsed.success) {
      const errors = {}
      parsed.error.errors.forEach(e => {
        const key = e.path[0] || '_'
        errors[key] = e.message
      })
      return res.status(400).send({ errors })
    }

    // Replace body with parsed (normalized) data
    req.body = parsed.data
    next()
  }
  catch(err) {
    console.error('Validation middleware error', err)
    res.status(500).end()
  }
}

export default validateBody
