import prisma from '../database/client.js'
import { ZodError } from 'zod'
import Car from '../models/Car.js'

const controller = {}     // Objeto vazio

controller.create = async function(req, res) {
  try {

    // Cria uma cópia dos dados recebidos para adicionar os IDs do usuário
    const dados = { ...req.body }

    // Preenche qual usuário criou o carro com o id do usuário autenticado
    // Se não houver usuário autenticado (middleware desabilitado), usa ID 1 como padrão
    dados.created_user_id = req.authUser?.id || 1

    // Preenche qual usuário modificou por último o carro com o id
    // do usuário autenticado
    dados.updated_user_id = req.authUser?.id || 1

    // Invoca a validação do modelo do Zod para os dados que
    // o cliente enviou no corpo da requisição (não faz INSERT ainda)
    const dadosValidados = Car.parse(dados)

    await prisma.car.create({ data: dadosValidados })

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)

    // Se for erro de validação do Zod, retorna HTTP 422
    if(error instanceof ZodError) res.status(422).send(error.issues)
    // Outros tipos de erro ~> HTTP 500
    else res.status(500).end()
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