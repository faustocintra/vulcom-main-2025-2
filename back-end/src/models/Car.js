import { z } from 'zod'

const currentYear = new Date().getFullYear()

const colors = [
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

const Car = z.object({
  brand:
    z.string()
    .min(1, { message: 'A marca deve ter, no mínimo, 1 caractere.' })
    .max(25, { message: 'A marca deve ter, no máximo, 25 caracteres.' }),

  model:
    z.string()
    .min(1, { message: 'O modelo deve ter, no mínimo, 1 caractere.' })
    .max(25, { message: 'O modelo deve ter, no máximo, 25 caracteres.' }),

  color:
    z.string()
    .refine(val => colors.includes(val), { message: 'A cor selecionada é inválida.' }),

  year_manufacture:
    z.number()
    .int()
    .min(1960, { message: 'O ano de fabricação não pode ser anterior a 1960.' })
    .max(currentYear, { message: 'O ano de fabricação não pode ser posterior ao ano atual.' }),

  imported:
    z.boolean(),

  plates:
    z.string()
    .length(8, { message: 'A placa deve ter, exatamente, 8 caracteres.' }),

  selling_date:
    z.coerce.date()
    .min(new Date('2020-03-20'), { message: 'A data de venda não pode ser anterior a 20/03/2020.' })
    .max(new Date(), { message: 'A data de venda não pode ser posterior à data atual.' })
    .nullable()
    .optional(),

  selling_price:
    z.number()
    .min(5000, { message: 'O preço de venda deve ser de, no mínimo, R$ 5.000,00.' })
    .max(5000000, { message: 'O preço de venda deve ser de, no máximo, R$ 5.000.000,00.' })
    .nullable()
    .optional(),
});

export default Car