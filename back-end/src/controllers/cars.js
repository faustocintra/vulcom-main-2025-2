import prisma from '../database/client.js'
import Car from '../models/Car.js'
import { ZodError } from 'zod'

const controller = {}     // Objeto vazio

controller.create = async function (req, res) {
  try {
    if (req.body.selling_date) req.body.selling_date = new Date(req.body.selling_date)
    req.body.year_manufacture = Number(req.body.year_manufacture)
    if (req.body.selling_price) req.body.selling_price = Number(req.body.selling_price)

    Car.parse(req.body)

    await prisma.car.create({ data: req.body })
    res.status(201).end()
  } catch (error) {
    console.error(error)
    if (error instanceof ZodError) res.status(422).send(error.issues)
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

controller.update = async function (req, res) {
  try {
    if (req.body.selling_date) req.body.selling_date = new Date(req.body.selling_date)
    req.body.year_manufacture = Number(req.body.year_manufacture)
    if (req.body.selling_price) req.body.selling_price = Number(req.body.selling_price)

    Car.parse(req.body)

    await prisma.car.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    res.status(204).end()
  } catch (error) {
    console.error(error)
    if (error?.code === 'P2025') res.status(404).end()
    else if (error instanceof ZodError) res.status(422).send(error.issues)
    else res.status(500).end()
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