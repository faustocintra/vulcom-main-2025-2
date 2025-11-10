import { ZodError } from 'zod'

const carroCtrl = {}  

carroCtrl.create = async (req, res) => {
  try {
    const dados = req.body

    // Converte data de venda caso esteja presente
    if (dados.selling_date) {
      dados.selling_date = new Date(dados.selling_date)
    }

    // Validação via Zod
    Car.parse(dados)

    // Define quem criou e quem modificou inicialmente
    dados.created_user_id = req.authUser.id
    dados.updated_user_id = req.authUser.id

    await prisma.car.create({ data: dados })

    res.status(201).end()
  }
  catch (erro) {
    console.error(erro)

    if (erro instanceof ZodError) {
      return res.status(422).send(erro.issues)
    }

    res.status(500).end()
  }
}

carroCtrl.retrieveAll = async (req, res) => {
  try {
    const relacoesIncluidas = req.query.include?.split(',') ?? []

    const lista = await prisma.car.findMany({
      orderBy: [
        { brand: 'asc' },
        { model: 'asc' },
        { id: 'asc' }
      ],
      include: {
        customer: relacoesIncluidas.includes('customer'),
        created_user: relacoesIncluidas.includes('created_user'),
        updated_user: relacoesIncluidas.includes('updated_user')
      }
    })

    res.send(lista)
  }
  catch (erro) {
    console.error(erro)
    res.status(500).end()
  }
}

carroCtrl.retrieveOne = async (req, res) => {
  try {
    const relacoesIncluidas = req.query.include?.split(',') ?? []

    const carro = await prisma.car.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        customer: relacoesIncluidas.includes('customer'),
        created_user: relacoesIncluidas.includes('created_user'),
        updated_user: relacoesIncluidas.includes('updated_user')
      }
    })

    if (carro) {
      res.send(carro)
    } else {
      res.status(404).end()
    }
  }
  catch (erro) {
    console.error(erro)
    res.status(500).end()
  }
}

carroCtrl.update = async (req, res) => {
  try {
    const novosDados = req.body

    if (novosDados.selling_date) {
      novosDados.selling_date = new Date(novosDados.selling_date)
    }

    Car.parse(novosDados)

    novosDados.updated_user_id = req.authUser.id

    await prisma.car.update({
      where: { id: Number(req.params.id) },
      data: novosDados
    })

    res.status(204).end()
  }
  catch (erro) {
    console.error(erro)

    if (erro?.code === 'P2025') return res.status(404).end()
    if (erro instanceof ZodError) return res.status(422).send(erro.issues)

    res.status(500).end()
  }
}

carroCtrl.delete = async (req, res) => {
  try {
    await prisma.car.delete({
      where: { id: Number(req.params.id) }
    })

    res.status(204).end()
  }
  catch (erro) {
    if (erro?.code === 'P2025') {
      res.status(404).end()
    } else {
      console.error(erro)
      res.status(500).end()
    }
  }
}

export default carroCtrl
const controller = carroCtrl
export { controller }