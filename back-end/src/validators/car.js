import { z } from 'zod'

const currentYear = new Date().getFullYear()
const storeOpenDate = new Date(2020, 2, 20) // 20/03/2020 -> months 0-based

export const carSchema = z.object({
  brand: z
    .string({ required_error: 'Marca é obrigatória' })
    .min(1, { message: 'Marca deve ter ao menos 1 caractere' })
    .max(25, { message: 'Marca pode ter no máximo 25 caracteres' }),

  model: z
    .string({ required_error: 'Modelo é obrigatório' })
    .min(1, { message: 'Modelo deve ter ao menos 1 caractere' })
    .max(25, { message: 'Modelo pode ter no máximo 25 caracteres' }),

  color: z.enum([
    'AMARELO',
    'AZUL',
    'BRANCO',
    'CINZA',
    'DOURADO',
    'LARANJA',
    'MARROM',
    'PRATA',
    'PRETO',
    'ROSA',
    'ROXO',
    'VERDE',
    'VERMELHO'
  ], { errorMap: () => ({ message: 'Cor inválida' }) }),

  year_manufacture: z.preprocess((val) => {
    // aceita string ou number
    const n = Number(val)
    return Number.isNaN(n) ? val : n
  }, z.number({ invalid_type_error: 'Ano inválido' }).int({ message: 'Ano deve ser inteiro' }).min(1960, { message: 'Ano mínimo é 1960' }).max(currentYear, { message: `Ano máximo é ${currentYear}` })),

  imported: z.boolean({ required_error: 'Campo imported deve ser booleano' }),

  plates: z.string({ required_error: 'Placa é obrigatória' }).length(8, { message: 'Placa deve ter exatamente 8 caracteres' }),

  selling_date: z
    .union([
      z.string().nullable(),
      z.date(),
      z.null()
    ])
    .optional()
    .transform((val) => {
      if (!val) return null
      // se for string, tenta converter
      if (typeof val === 'string') {
        const d = new Date(val)
        return isNaN(d.getTime()) ? val : d
      }
      return val
    })
    .refine((d) => {
      if (!d) return true // opcional
      if (!(d instanceof Date)) return false
      return d.getTime() >= storeOpenDate.getTime() && d.getTime() <= new Date().getTime()
    }, { message: 'Data de venda deve estar entre 20/03/2020 e hoje' }),

  selling_price: z
    .union([z.number(), z.string().transform((s) => Number(s)), z.null()])
    .optional()
    .refine((v) => {
      if (v === null || v === undefined || v === '') return true
      const n = Number(v)
      if (Number.isNaN(n)) return false
      return n >= 5000 && n <= 5000000
    }, { message: 'Preço de venda, se informado, deve estar entre 5.000 e 5.000.000' }),

  customer_id: z
    .union([z.number(), z.string().transform((s) => (s === '' ? null : Number(s))), z.null()])
    .optional()
})

export default carSchema
