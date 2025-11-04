import prisma from '../database/client.js'
import Customer from '../models/Customer.js'
import { ZodError } from 'zod'

const controller = {}     // Objeto vazio

controller.create = async function(req, res) {
 try {


   // Sempre que houver um campo que represente uma data,
   // precisamos garantir sua conversão para o tipo Date
   // antes de passá-lo ao Zod para validação
   if(req.body.birth_date) req.body.birth_date = new Date(req.body.birth_date)


   // Invoca a validação do modelo do Zod para os dados que
   // vieram em req.body
   Customer.parse(req.body)


   await prisma.customer.create({ data: req.body })


   // HTTP 201: Created
   res.status(201).end()
 }
 catch(error) {
   console.error(error)


   // Se for erro de validação do Zod, retorna
   // HTTP 422: Unprocessable Entity
   if(error instanceof ZodError) res.status(422).send(error.issues)


   // Senão, retorna o habitual HTTP 500: Internal Server Error
   else res.status(500).end()
 }
}

controller.retrieveAll = async function(req, res) {
  try {
    const result = await prisma.customer.findMany({
      orderBy: [
        { name: 'asc' }
      ],
      include: {
        cars: req.query.include === 'cars'
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
    const result = await prisma.customer.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        cars: req.query.include === 'cars'
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


   // Sempre que houver um campo que represente uma data,
   // precisamos garantir sua conversão para o tipo Date
   // antes de passá-lo ao Zod para validação
   if(req.body.birth_date) req.body.birth_date = new Date(req.body.birth_date)


   // Invoca a validação do modelo do Zod para os dados que
   // vieram em req.body
   Customer.parse(req.body)


   await prisma.customer.update({
     where: { id: Number(req.params.id) },
     data: req.body
   })


   // Encontrou e atualizou ~> HTTP 204: No Content
   res.status(204).end()
  
 }
 catch(error) {
   console.error(error)


   // Não encontrou e não atualizou ~> HTTP 404: Not Found
   if(error?.code === 'P2025') res.status(404).end()


   // Erro do Zod ~> HTTP 422: Unprocessable Entity
   else if(error instanceof ZodError) res.status(422).send(error.issues)


   // Outros erros ~> HTTP 500: Internal Server Error
   else res.status(500).end()
 }
}

controller.delete = async function(req, res) {
  try {
    await prisma.customer.delete({
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