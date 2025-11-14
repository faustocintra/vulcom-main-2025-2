import { z } from 'zod'

// Cores permitidas
const colors = [
  'AMARELO', 'AZUL', 'BRANCO', 'CINZA', 'DOURADO', 'LARANJA', 'MARROM',
  'PRATA', 'PRETO', 'ROSA', 'ROXO', 'VERDE', 'VERMELHO'
]

// Ano corrente para validação
const currentYear = new Date().getFullYear()

// Data de abertura da loja (20/03/2020)
const storeOpeningDate = new Date(2020, 2, 20) // Mês é 0-based (2 = março)

const Car = z.object({
  brand: z.string()
    .trim()
    .min(1, { message: 'A marca deve ter pelo menos 1 caractere.' })
    .max(25, { message: 'A marca deve ter no máximo 25 caracteres.' }),

  model: z.string()
    .trim()
    .min(1, { message: 'O modelo deve ter pelo menos 1 caractere.' })
    .max(25, { message: 'O modelo deve ter no máximo 25 caracteres.' }),

  color: z.enum(colors, {
    message: 'Cor inválida. Deve ser uma das cores pré-definidas.'
  }),

  year_manufacture: z.number()
    .int({ message: 'O ano de fabricação deve ser um número inteiro.' })
    .min(1960, { message: 'O ano de fabricação não pode ser anterior a 1960.' })
    .max(currentYear, { message: `O ano de fabricação não pode ser posterior a ${currentYear}.` }),

  imported: z.boolean({
    message: 'O campo importado deve ser um valor booleano (true ou false).'
  }),

  plates: z.string()
    .trim()
    .length(8, { message: 'A placa deve ter exatamente 8 caracteres.' })
    .refine(val => val === val.toUpperCase(), {
      message: 'A placa deve conter apenas letras maiúsculas.'
    })
    .refine(val => /^[A-Z]{3}-\d[A-Z0-9]\d{2}$/.test(val), {
      message: 'Formato de placa inválido. Use o formato: ABC-1D23'
    }),

  selling_date: z.coerce.date()
    .min(storeOpeningDate, { 
      message: 'A data de venda não pode ser anterior à abertura da loja (20/03/2020).' 
    })
    .max(new Date(), { 
      message: 'A data de venda não pode ser posterior à data atual.' 
    })
    .nullish(), // Campo opcional

  selling_price: z.number()
    .min(5000, { message: 'O preço de venda deve ser no mínimo R$ 5.000,00.' })
    .max(5000000, { message: 'O preço de venda deve ser no máximo R$ 5.000.000,00.' })
    .nullish(), // Campo opcional
})

export default Car