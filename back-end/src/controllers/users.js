import prisma from '../database/client.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const controller = {}     // Objeto vazio

controller.create = async function(req, res) {
  try {
    // Se houver senha no req.body, faz o hash antes de salvar
    if(req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12)
    }

    await prisma.user.create({ data: req.body })

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveAll = async function(req, res) {
  try {
    const result = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        //  todos os outros campos EXCETO password
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
    const result = await prisma.user.findUnique({
      // Omite o campo "password" do resultado
      // por questão de segurança
      select: {
        id: true,
        username: true,
        email: true,
      }
      ,//  todos os outros campos EXCETO password
      where: { id: Number(req.params.id) }
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
    // Se houver senha no req.body, faz o hash antes de atualizar
    if(req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12)
    }

    const result = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      select: {
        id: true,
        username: true,
        email: true,
        // outros campos exceto password
      }
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
    await prisma.user.delete({
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

controller.login = async function(req, res) {
  try {
  // Busca o usuário no BD usando o valor dos campos
    // "username" OU "email"
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        username: true,
        email: true,
        password: true, // Precisamos do password para verificação
        // outros campos que quiser retornar
      },
      where: {
        OR: [
          { username: req.body?.username },
          { email: req.body?.email }
        ]
      }
    })

    // Se o usuário não for encontrado, retorna
    // HTTP 401: Unauthorized
    if (!user) return res.status(401).end()

    // REMOVENDO VULNERABILIDADE DE AUTENTICAÇÃO FIXA
    // Usuário encontrado, vamos conferir a senha
    // let passwordIsValid
    // if(req.body?.username === 'admin' && req.body?.password === 'admin123') passwordIsValid = true
    // else passwordIsValid = user.password === req.body?.password

    // Chamando bcrypt.compare() para verificar se o hash da senha
    // enviada coincide com o hash da senha armazenada no BD
    const passwordIsValid = await bcrypt.compare(req.body?.password, user.password)

    // Se a senha estiver errada, retorna
    // HTTP 401: Unauthorized
    if (!passwordIsValid) return res.status(401).end()

    // Por motivos de segurança, exclui o campo "password" dos dados do usuário
    // para que ele não seja incluído no token
    //if(user.password) delete user.password
    // Remove o password do objeto user antes de criar o token
    const { password, ...userWithoutPassword } = user

    if (!process.env.TOKEN_SECRET) {
      console.error('ERRO: TOKEN_SECRET não está definido')
      return res.status(500).json({ error: 'Configuração do servidor incompleta' })
    }
    // Usuário e senha OK, passamos ao procedimento de gerar o token
    const token = jwt.sign(
      userWithoutPassword,         // Dados do usuário sem a senha
      process.env.TOKEN_SECRET,   // Senha para criptografar o token
      { expiresIn: '24h' }        // Prazo de validade do token
    )

    // Formamos o cookie para enviar ao front-end
    res.cookie(process.env.AUTH_COOKIE_NAME, token, {
      httpOnly: true, // O cookie ficará inacessível para o JS no front-end
      secure: true,   // O cookie será criptografado em conexões https
      sameSite: 'None',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000  // 24h // tem q ser 1000 e não 100
    })
    // Cookie não HTTP-only, acessível via JS no front-end
    res.cookie('not-http-only', 'Este-cookie-NAO-eh-HTTP-Only', {
      httpOnly: false,
      secure: true,   // O cookie será criptografado em conexões https
      sameSite: 'None',
      path: '/',
      maxAge: 24 * 60 * 60 * 100  // 24h
    })


    // Retorna o usuário autenticado com
    // HTTP 200: OK (implícito)
    //res.send({ token, user })
    res.send({ user: userWithoutPassword })

  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}


controller.me = function(req, res) {
  // Retorna as informações do usuário autenticado
  // HTTP 200: OK (implícito)
  res.send(req?.authUser)
}

controller.logout = function(req, res) {
  // Apaga no front-end o cookie que armazena o token
  res.clearCookie(process.env.AUTH_COOKIE_NAME)
  // HTTP 204: No Content
  res.status(204).end()
}
export default controller