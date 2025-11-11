import { z } from 'zod'

const colors = [
  'AMARELO','AZUL','BRANCO','CINZA','DOURADO','LARANJA','MARROM',
  'PRATA','PRETO','ROSA','ROXO','VERDE','VERMELHO'
]

const currentYear = new Date().getFullYear()
const minYear = 1960

const storeOpeningDate = new Date(2020, 2, 20) // 20/03/2020 (mês 2 = março)

const sellingPriceSchema = z.preprocess(val => {
  // Trata '' como undefined, permite envio vazio do front-end
  if(val === '' || val === null || val === undefined) return undefined
  // Tenta converter strings numéricas
  const n = Number(val)
  return Number.isNaN(n) ? val : n
}, z.number().min(5000, { message: 'O preço de venda deve ser no mínimo R$ 5.000,00.' })
  .max(5000000, { message: 'O preço de venda deve ser no máximo R$ 5.000.000,00.' })
  .optional())

const Car = z.object({
  brand: z.string()
    .trim()
    .min(1, { message: 'Marca deve ter, no mínimo, 1 caractere.' })
    .max(25, { message: 'Marca pode ter, no máximo, 25 caracteres.' }),

  model: z.string()
    .trim()
    .min(1, { message: 'Modelo deve ter, no mínimo, 1 caractere.' })
    .max(25, { message: 'Modelo pode ter, no máximo, 25 caracteres.' }),

  color: z.enum(colors, { message: 'Cor inválida.' }),

  year_manufacture: z.coerce.number()
    .int({ message: 'Ano de fabricação deve ser um número inteiro.' })
    .min(minYear, { message: `Ano de fabricação não pode ser anterior a ${minYear}.` })
    .max(currentYear, { message: `Ano de fabricação não pode ser maior que ${currentYear}.` }),

  imported: z.boolean({ invalid_type_error: 'O campo imported deve ser booleano.' }),

  plates: z.string()
    .transform(val => String(val).trim())
    .refine(val => val.length === 8, { message: 'Placas devem ter exatamente 8 caracteres.' }),

  selling_date: z.coerce.date()
    .min(storeOpeningDate, { message: 'Data de venda não pode ser anterior à abertura da loja (20/03/2020).' })
    .max(new Date(), { message: 'Data de venda não pode ser posterior à data atual.' })
    .nullish(),

  selling_price: sellingPriceSchema
})

export default Car
