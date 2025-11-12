import { z } from 'zod'

// =============================
// Constantes auxiliares
// =============================
const currentYear = new Date().getFullYear()
const minYear = 1960
const minDate = new Date('2020-03-20') // Data de abertura da loja
const today = new Date()

// Cores permitidas
const coresPermitidas = [
  'AMARELO', 'AZUL', 'BRANCO', 'CINZA', 'DOURADO', 'LARANJA',
  'MARROM', 'PRATA', 'PRETO', 'ROSA', 'ROXO', 'VERDE', 'VERMELHO'
]

// =============================
// Modelo Zod para Car
// =============================
const Car = z.object({
  brand: z.string()
    .trim()
    .min(1, { message: 'A marca deve ter, no mínimo, 1 caractere.' })
    .max(25, { message: 'A marca pode ter, no máximo, 25 caracteres.' }),

  model: z.string()
    .trim()
    .min(1, { message: 'O modelo deve ter, no mínimo, 1 caractere.' })
    .max(25, { message: 'O modelo pode ter, no máximo, 25 caracteres.' }),

  color: z.enum(coresPermitidas, {
    message: 'A cor informada é inválida.'
  }),

  year_manufacture: z.number({
      required_error: 'O ano de fabricação é obrigatório.',
      invalid_type_error: 'O ano de fabricação deve ser um número inteiro.'
    })
    .int({ message: 'O ano de fabricação deve ser um número inteiro.' })
    .min(minYear, { message: `O ano de fabricação deve ser no mínimo ${minYear}.` })
    .max(currentYear, { message: `O ano de fabricação não pode ser maior que ${currentYear}.` }),

  imported: z.boolean({
    required_error: 'O campo "importado" deve ser verdadeiro ou falso.'
  }),

  plates: z.string()
    .trim()
    .length(8, { message: 'A placa deve ter exatamente 8 caracteres.' }),

  selling_date: z.coerce.date()
    .min(minDate, { message: 'A data de venda não pode ser anterior a 20/03/2020.' })
    .max(today, { message: 'A data de venda não pode ser posterior à data atual.' })
    .optional()
    .nullable(),

  selling_price: z.number({
      invalid_type_error: 'O preço de venda deve ser numérico.'
    })
    .min(5000, { message: 'O preço mínimo de venda é R$ 5.000,00.' })
    .max(5000000, { message: 'O preço máximo de venda é R$ 5.000.000,00.' })
    .optional()
    .nullable()
})

export default Car
