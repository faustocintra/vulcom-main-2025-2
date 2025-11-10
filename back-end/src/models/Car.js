import { z } from 'zod'

const colorOptions = [
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
]

const storeOpeningDate = new Date(2020, 2, 20)
const minimumManufactureYear = 1960

function toDateOrNull(value) {
  if(value === undefined) return undefined
  if(value === null || value === '') return null
  if(value instanceof Date) return value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed
}

function toNumberOrNull(value) {
  if(value === undefined) return undefined
  if(value === null || value === '') return null
  if(typeof value === 'number') return value
  if(typeof value === 'string') {
    const normalized = value.replace(',', '.').trim()
    const parsed = Number(normalized)
    return Number.isNaN(parsed) ? value : parsed
  }
  return value
}

function toInteger(value) {
  if(value === undefined) return undefined
  if(value === null || value === '') return undefined
  if(typeof value === 'number') return value
  if(typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
  }
  return value
}

function toBoolean(value) {
  if(typeof value === 'boolean') return value
  if(typeof value === 'string') {
    if(value === 'true') return true
    if(value === 'false') return false
  }
  return value
}

function toNullableInteger(value) {
  if(value === undefined) return undefined
  if(value === null || value === '') return null
  if(typeof value === 'number') return value
  if(typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
  }
  return value
}

const manufactureYearSchema = z.number({
  invalid_type_error: 'Ano de fabricação deve ser um número inteiro.'
})
  .int({ message: 'Ano de fabricação deve ser um número inteiro.' })
  .min(minimumManufactureYear, {
    message: `Ano de fabricação deve ser no mínimo ${minimumManufactureYear}.`
  })
  .refine(value => value <= new Date().getFullYear(), {
    message: 'Ano de fabricação não pode ser maior que o ano corrente.'
  })

const sellingDateSchema = z.date({
  invalid_type_error: 'Data de venda inválida.'
})
  .min(storeOpeningDate, {
    message: 'Data de venda não pode ser anterior a 20/03/2020.'
  })
  .refine(date => date <= new Date(), {
    message: 'Data de venda não pode ser posterior à data de hoje.'
  })

const sellingPriceSchema = z.number({
  invalid_type_error: 'Preço de venda deve ser numérico.'
})
  .min(5000, {
    message: 'Preço de venda deve ser de, pelo menos, R$ 5.000,00.'
  })
  .max(5_000_000, {
    message: 'Preço de venda deve ser de, no máximo, R$ 5.000.000,00.'
  })

const customerIdSchema = z.number({
  invalid_type_error: 'Cliente inválido.'
})
  .int({ message: 'Cliente inválido.' })
  .positive({ message: 'Cliente inválido.' })

const Car = z.object({
  brand: z.string()
    .trim()
    .min(1, { message: 'Marca deve ter, pelo menos, 1 caractere.' })
    .max(25, { message: 'Marca pode ter, no máximo, 25 caracteres.' }),

  model: z.string()
    .trim()
    .min(1, { message: 'Modelo deve ter, pelo menos, 1 caractere.' })
    .max(25, { message: 'Modelo pode ter, no máximo, 25 caracteres.' }),

  color: z.enum(colorOptions, {
    message: 'Cor inválida. Escolha uma das opções permitidas.'
  }),

  year_manufacture: z.preprocess(toInteger, manufactureYearSchema),

  imported: z.preprocess(toBoolean, z.boolean({
    invalid_type_error: 'Valor inválido para o campo importado.'
  })),

  plates: z.string()
    .trim()
    .length(8, { message: 'Placa deve ter exatamente 8 caracteres.' }),

  selling_date: z.preprocess(
    toDateOrNull,
    sellingDateSchema.nullable().optional()
  ),

  selling_price: z.preprocess(
    toNumberOrNull,
    sellingPriceSchema.nullable().optional()
  ),

  customer_id: z.preprocess(
    toNullableInteger,
    customerIdSchema.nullable().optional()
  )
})

export default Car
