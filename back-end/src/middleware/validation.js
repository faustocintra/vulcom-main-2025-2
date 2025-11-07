import { z } from 'zod'

/**
 * Middleware para validação de dados usando esquemas Zod
 * @param {z.ZodSchema} schema - Esquema Zod para validação
 * @returns {Function} Middleware do Express
 */
function validateData(schema) {
  return (req, res, next) => {
    try {
      // Valida os dados do corpo da requisição
      const validatedData = schema.parse(req.body)
      
      // Substitui req.body pelos dados validados e transformados
      req.body = validatedData
      
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Formata os erros de validação do Zod
        const validationErrors = {}
        
        error.errors.forEach((err) => {
          const field = err.path.join('.')
          validationErrors[field] = err.message
        })
        
        return res.status(422).json({
          message: 'Dados inválidos',
          errors: validationErrors,
          details: error.errors
        })
      }
      
      // Outros tipos de erro
      console.error('Erro de validação:', error)
      return res.status(500).json({
        message: 'Erro interno do servidor'
      })
    }
  }
}

export default validateData
