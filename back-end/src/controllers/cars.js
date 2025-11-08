import prisma from '../database/client.js'
import Car from '../models/Car.js' // NOVO IMPORT

const controller = {}     // Objeto vazio

controller.create = async function(req, res) {
  try {
    // VALIDAÇÃO ZOD
    await Car.parseAsync(req.body) // Tenta validar o objeto.

    // Preenche qual usuário criou o carro com o id do usuário autenticado
    req.body.created_user_id = req.authUser.id

    // Preenche qual usuário modificou por último o carro com o id
    // do usuário autenticado
    req.body.updated_user_id = req.authUser.id

    await prisma.car.create({ data: req.body })

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)

    // Tratamento de erro Zod
    if (error.name === 'ZodError') {
      // HTTP 422: Unprocessable Entity
      res.status(422).send({
        // Mapeia os erros de validação
        errors: error.errors.map(err => ({
          field: err.path.join('.'), // Nome do campo com erro
          message: err.message       // Mensagem de erro
        }))
      })
    }
    else {
      // HTTP 500: Internal Server Error
      res.status(500).end()
    }
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
    // VALIDAÇÃO ZOD
    await Car.parseAsync(req.body) 

    // Preenche qual usuário modificou por último o carro com o id
    // do usuário autenticado
    req.body.updated_user_id = req.authUser.id

    const result = await prisma.car.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    // Encontrou e atualizou ~> HTTP 204: No Content
    if(result) res.status(204).end()
    // Não encontrou (e não atualizou) ~> HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)

    // Tratamento de erro Zod
    if (error.name === 'ZodError') {
      // HTTP 422: Unprocessable Entity
      res.status(422).send({
        // Mapeia os erros de validação
        errors: error.errors.map(err => ({
          field: err.path.join('.'), // Nome do campo com erro
          message: err.message       // Mensagem de erro
        }))
      })
    }
    else {
      // HTTP 500: Internal Server Error
      res.status(500).end()
    }
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