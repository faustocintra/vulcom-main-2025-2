import { z } from 'zod'

// =============================
// Constantes auxiliares
// =============================
const currentYear = new Date().getFullYear()
const minYear = 1960
const minDate = new Date('2020-03-20')
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

  selling_date: z
    .union([z.coerce.date(), z.null()])
    .optional()
    .refine(
      (date) => !date || (date >= minDate && date <= today),
      { message: 'A data de venda deve estar entre 20/03/2020 e hoje.' }
    ),

  selling_price: z
    .union([z.number(), z.null()])
    .optional()
    .refine(
      (price) => price === null || (price >= 5000 && price <= 5000000),
      { message: 'O preço de venda deve estar entre R$5.000 e R$5.000.000.' }
    ),

  customer_id: z.string().optional().nullable()
})

export default Car
