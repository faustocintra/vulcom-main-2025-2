import prisma from '../database/client.js'
import { carCreateSchema, carUpdateSchema } from '../validation/car.js'
import validateData from '../middleware/validation.js'

const controller = {}     // Objeto vazio

controller.create = async function(req, res) {
  try {
    // Valida os dados usando o schema Zod
    const validatedData = carCreateSchema.parse(req.body)

    // Preenche qual usuário criou o carro com o id do usuário autenticado
    validatedData.created_user_id = req.authUser.id

    // Preenche qual usuário modificou por último o carro com o id
    // do usuário autenticado
    validatedData.updated_user_id = req.authUser.id

    await prisma.car.create({ data: validatedData })

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)

    // Se for erro de validação do Zod
    if (error.name === 'ZodError') {
      const validationErrors = {}
      
      error.errors.forEach((err) => {
        const field = err.path.join('.')
        validationErrors[field] = err.message
      })
      
      return res.status(422).json({
        message: 'Dados inválidos',
        errors: validationErrors
      })
    }

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveAll = async function(req, res) {
  try {

    const includedRels = req.query.include?.split(',') ?? []
    
    const result = await prisma.car.findMany({
      orderBy: [
        { brand: 'asc' },
        { model: 'asc' },
        { id: 'asc' }
      ],
      include: {
        customer: includedRels.includes('customer'),
        created_user: includedRels.includes('created_user'),
        updated_user: includedRels.includes('updated_user')
      }
    })

    // HTTP 200: OK (implícito)
    res.send(result)
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveOne = async function(req, res) {
  try {

    const includedRels = req.query.include?.split(',') ?? []

    const result = await prisma.car.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        customer: includedRels.includes('customer'),
        created_user: includedRels.includes('created_user'),
        updated_user: includedRels.includes('updated_user')
      }
    })

    // Encontrou ~> retorna HTTP 200: OK (implícito)
    if(result) res.send(result)
    // Não encontrou ~> retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.update = async function(req, res) {
  try {
    // Valida os dados usando o schema Zod para atualização
    const validatedData = carUpdateSchema.parse(req.body)

    // Preenche qual usuário modificou por último o carro
    validatedData.updated_user_id = req.authUser.id

    const result = await prisma.car.update({
      where: { id: Number(req.params.id) },
      data: validatedData
    })

    // Encontrou e atualizou ~> HTTP 204: No Content
    if(result) res.status(204).end()
    // Não encontrou (e não atualizou) ~> HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)

    // Se for erro de validação do Zod
    if (error.name === 'ZodError') {
      const validationErrors = {}
      
      error.errors.forEach((err) => {
        const field = err.path.join('.')
        validationErrors[field] = err.message
      })
      
      return res.status(422).json({
        message: 'Dados inválidos',
        errors: validationErrors
      })
    }

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.delete = async function(req, res) {
  try {
    await prisma.car.delete({
      where: { id: Number(req.params.id) }
    })

    // Encontrou e excluiu ~> HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    if(error?.code === 'P2025') {
      // Não encontrou e não excluiu ~> HTTP 404: Not Found
      res.status(404).end()
    }
    else {
      // Outros tipos de erro
      console.error(error)

      // HTTP 500: Internal Server Error
      res.status(500).end()
    }
  }
}

export default controller