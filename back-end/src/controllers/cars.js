import prisma from '../database/client.js'
import Car from '../models/Car.js'
import { ZodError } from 'zod'

const controller = {}

controller.create = async function(req, res) {
  try {
    // 1. IMPORTANTE: Capture os dados tratados pelo Zod
    // Isso garante que números venham como números e vazios como null
    req.body = Car.parse(req.body)

    // Preenche qual usuário criou o carro com o id do usuário autenticado
    req.body.created_user_id = req.authUser.id

    // Preenche qual usuário modificou por último
    req.body.updated_user_id = req.authUser.id

    await prisma.car.create({ data: req.body })

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)

    if (error instanceof ZodError || error.name === 'ZodError') {
      const validationErrors = error.errors || error.issues
      res.status(422).send(validationErrors)
    }
    else {
      res.status(500).send({
        message: 'Ocorreu um erro interno no servidor.',
        details: error.message
      })
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

    res.send(result)
  }
  catch(error) {
    console.error(error)
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

    if(result) res.send(result)
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    res.status(500).end()
  }
}

controller.update = async function(req, res) {
  try {
    // 1. Capture os dados tratados pelo Zod
    req.body = Car.parse(req.body)

    // 2. IMPORTANTE: Atualize quem fez a alteração
    req.body.updated_user_id = req.authUser.id

    const result = await prisma.car.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    if(result) res.status(204).end()
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)

    if (error instanceof ZodError || error.name === 'ZodError') {
      const validationErrors = error.errors || error.issues
      res.status(422).send(validationErrors)
    }
    else {
      res.status(500).send({
        message: 'Ocorreu um erro interno no servidor.',
        details: error.message
      })
    }
  }
}

controller.delete = async function(req, res) {
  try {
    await prisma.car.delete({
      where: { id: Number(req.params.id) }
    })
    res.status(204).end()
  }
  catch(error) {
    if(error?.code === 'P2025') {
      res.status(404).end()
    }
    else {
      console.error(error)
      res.status(500).end()
    }
  }
}

export default controller