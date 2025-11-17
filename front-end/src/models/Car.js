import { z } from 'zod'

/*
  Cores permitidas para os veículos
*/
const allowedColors = [
  'AMARELO', 'AZUL', 'BRANCO', 'CINZA', 'DOURADO', 
  'LARANJA', 'MARROM', 'PRATA', 'PRETO', 'ROSA', 
  'ROXO', 'VERDE', 'VERMELHO'
]

/*
  Ano mínimo de fabricação: 1960
  Ano máximo: ano corrente
*/
const currentYear = new Date().getFullYear()
const minYear = 1960

/*
  Data de abertura da loja: 20/03/2020
  Usada para validar selling_date
*/
const storeOpeningDate = new Date('2020-03-20')

const Car = z.object({
  brand: z.string()
    .trim()
    .min(1, { message: 'Marca deve ter, pelo menos, 1 caractere.' })
    .max(25, { message: 'Marca pode ter, no máximo, 25 caracteres.' }),

  model: z.string()
    .trim()
    .min(1, { message: 'Modelo deve ter, pelo menos, 1 caractere.' })
    .max(25, { message: 'Modelo pode ter, no máximo, 25 caracteres.' }),

  color: z.enum(allowedColors, {
    message: 'Cor inválida. Deve ser uma das cores permitidas.'
  }),

  year_manufacture: z.number()
    .int({ message: 'Ano de fabricação deve ser um número inteiro.' })
    .min(minYear, { message: `Ano de fabricação deve ser, no mínimo, ${minYear}.` })
    .max(currentYear, { message: `Ano de fabricação deve ser, no máximo, ${currentYear}.` }),

  imported: z.boolean({
    message: 'Campo importado deve ser verdadeiro ou falso.'
  }),

  plates: z.string()
    .trim()
    .length(8, { message: 'Placa deve ter exatamente 8 caracteres.' }),

  selling_date: z.coerce.date()
    .min(storeOpeningDate, {
      message: 'Data de venda não pode ser anterior à abertura da loja (20/03/2020).'
    })
    .max(new Date(), {
      message: 'Data de venda não pode ser posterior à data atual.'
    })
    .nullish(), // Campo opcional

  selling_price: z.number()
    .min(5000, { message: 'Preço de venda deve ser, no mínimo, R$ 5.000,00.' })
    .max(5000000, { message: 'Preço de venda deve ser, no máximo, R$ 5.000.000,00.' })
    .nullish() // Campo opcional
})

export default Car