import { z } from 'zod'

// Enum para as cores permitidas
const colorEnum = [
  'AMARELO', 'AZUL', 'BRANCO', 'CINZA', 'DOURADO', 'LARANJA',
  'MARROM', 'PRATA', 'PRETO', 'ROSA', 'ROXO', 'VERDE', 'VERMELHO'
]

// Constantes para regras de data e ano
const currentYear = new Date().getFullYear()
const minYear = 1960
const shopOpenDate = new Date('2020-03-20T00:00:00') // Definindo hora para evitar fuso
const today = new Date()

const Car = z.object({

  brand:
    z.string()
      .min(1, { message: 'A marca deve ter no mínimo 1 caractere.' })
      .max(25, { message: 'A marca deve ter no máximo 25 caracteres.' }),

  model:
    z.string()
      .min(1, { message: 'O modelo deve ter no mínimo 1 caractere.' })
      .max(25, { message: 'O modelo deve ter no máximo 25 caracteres.' }),

  color:
    z.enum(colorEnum, {
      errorMap: () => ({ message: 'A cor selecionada não é válida.' })
    }),

  year_manufacture:
    z.number({
      coerce: true, // Força a conversão de string (do form) para número
      invalid_type_error: 'O ano de fabricação é obrigatório.'
    })
      .int({ message: 'O ano de fabricação deve ser um número inteiro.' })
      .min(minYear, { message: `O ano de fabricação deve ser no mínimo ${minYear}.` })
      .max(currentYear, { message: `O ano de fabricação deve ser no máximo ${currentYear}.` }),

  imported:
    z.boolean({ message: 'O campo "importado" deve ser um valor booleano (true/false).' }),

  plates:
    z.string()
      .length(8, { message: 'A placa deve ter exatamente 8 caracteres (ex: AAA-9A99).' }),

  selling_date:
    // Preprocessa o valor: se for string vazia ou nulo, vira 'null'.
    // Se for uma data (ou string de data), converte para objeto Date.
    z.preprocess(arg => {
      if (!arg || arg === '') return null
      return new Date(arg)
    },
      // Regra: ser uma data, dentro do intervalo, ou nulo.
      z.date()
        .min(shopOpenDate, { message: 'A data de venda não pode ser anterior a 20/03/2020.' })
        .max(today, { message: 'A data de venda não pode ser posterior à data de hoje.' })
        .nullable() // Permite que o campo seja nulo
    ),

  selling_price:
    // Preprocessa o valor: se for string vazia ou nulo, vira 'null'.
    // Se for um número (ou string de número), converte para float.
    z.preprocess(arg => {
      if (arg === '' || arg === null || arg === undefined) return null
      return parseFloat(arg)
    },
      // Regra: ser um número, dentro do intervalo, ou nulo.
      z.number()
        .min(5000, { message: 'O preço de venda deve ser no mínimo R$ 5.000,00.' })
        .max(5000000, { message: 'O preço de venda deve ser no máximo R$ 5.000.000,00.' })
        .nullable() // Permite que o campo seja nulo
    ),

  customer_id:
    z.number({
      coerce: true, // Força string para número
      required_error: 'O cliente é obrigatório.',
      invalid_type_error: 'O cliente é obrigatório.'
    })
      .int()
      .positive({ message: 'O cliente é obrigatório.' })

})

export default Car