import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function createUser() {
  try {
    const hashedPassword = await bcrypt.hash('teste123', 10)
    
    const user = await prisma.user.create({
      data: {
        fullname: 'Usuário Teste',
        username: 'teste',
        email: 'teste@email.com',
        password: hashedPassword,
        is_admin: false
      }
    })
    
    console.log('✅ Usuário criado com sucesso!')
    console.log('Username: teste')
    console.log('Senha: teste123')
    console.log(user)
  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()
