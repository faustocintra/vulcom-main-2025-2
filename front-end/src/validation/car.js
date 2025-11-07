import { z } from 'zod'

// Data de abertura da loja: 20/03/2020
const STORE_OPENING_DATE = new Date('2020-03-20')
const CURRENT_YEAR = new Date().getFullYear()
const MIN_YEAR = 1960

// Enum para cores permitidas
const CAR_COLORS = [
  'AMARELO', 'AZUL', 'BRANCO', 'CINZA', 'DOURADO', 
  'LARANJA', 'MARROM', 'PRATA', 'PRETO', 'ROSA', 
  'ROXO', 'VERDE', 'VERMELHO'
]

const carValidationSchema = z.object({
  // Campo brand: no mínimo 1 e no máximo 25 caracteres
  brand: z.string({
    required_error: "A marca é obrigatória",
    invalid_type_error: "A marca deve ser um texto"
  })
  .min(1, "A marca deve ter pelo menos 1 caractere")
  .max(25, "A marca deve ter no máximo 25 caracteres")
  .trim(),

  // Campo model: no mínimo 1 e no máximo 25 caracteres
  model: z.string({
    required_error: "O modelo é obrigatório",
    invalid_type_error: "O modelo deve ser um texto"
  })
  .min(1, "O modelo deve ter pelo menos 1 caractere")
  .max(25, "O modelo deve ter no máximo 25 caracteres")
  .trim(),

  // Campo color: exatamente uma das cores permitidas
  color: z.enum(CAR_COLORS, {
    required_error: "A cor é obrigatória",
    invalid_type_error: "Cor inválida. Selecione uma cor válida da lista"
  }),

  // Campo year_manufacture: número inteiro entre 1960 e ano corrente
  year_manufacture: z.union([
    z.number(),
    z.string().transform((val) => parseInt(val, 10))
  ], {
    required_error: "O ano de fabricação é obrigatório",
    invalid_type_error: "O ano de fabricação deve ser um número"
  })
  .refine((val) => Number.isInteger(val), "O ano de fabricação deve ser um número inteiro")
  .refine((val) => val >= MIN_YEAR, `O ano de fabricação deve ser a partir de ${MIN_YEAR}`)
  .refine((val) => val <= CURRENT_YEAR, `O ano de fabricação não pode ser superior ao ano atual (${CURRENT_YEAR})`),

  // Campo imported: deve ser um valor booleano
  imported: z.boolean({
    required_error: "O campo 'importado' é obrigatório",
    invalid_type_error: "O campo 'importado' deve ser verdadeiro ou falso"
  }),

  // Campo plates: deve ter exatamente 8 caracteres
  plates: z.string({
    required_error: "A placa é obrigatória",
    invalid_type_error: "A placa deve ser um texto"
  })
  .length(8, "A placa deve ter exatamente 8 caracteres")
  .trim()
  .transform((val) => val.toUpperCase()),

  // Campo selling_date: data opcional, mas se informada deve estar entre 20/03/2020 e hoje
  selling_date: z.union([
    z.date(),
    z.string().transform((val) => val ? new Date(val) : null)
  ])
  .refine((val) => !val || val >= STORE_OPENING_DATE, 
    `A data de venda não pode ser anterior à abertura da loja (${STORE_OPENING_DATE.toLocaleDateString('pt-BR')})`)
  .refine((val) => !val || val <= new Date(), 
    "A data de venda não pode ser posterior à data atual")
  .optional()
  .nullable(),

  // Campo selling_price: valor opcional entre R$ 5.000,00 e R$ 5.000.000,00
  selling_price: z.union([
    z.number(),
    z.string().transform((val) => val === '' || val === null ? null : parseFloat(val))
  ])
  .refine((val) => val === null || val === undefined || (val >= 5000 && val <= 5000000), 
    "O preço de venda deve ser entre R$ 5.000,00 e R$ 5.000.000,00")
  .refine((val) => val === null || val === undefined || val > 0, 
    "O preço de venda deve ser um valor positivo")
  .optional()
  .nullable(),

  // Campos adicionais que podem estar presentes na requisição
  customer_id: z.union([
    z.number(),
    z.string().transform((val) => val === '' ? null : parseInt(val, 10))
  ]).optional().nullable()
})

// Schema para criação (todos os campos obrigatórios exceto opcionais)
const carCreateSchema = carValidationSchema

// Schema para atualização (todos os campos opcionais)
const carUpdateSchema = carValidationSchema.partial()

export { carValidationSchema, carCreateSchema, carUpdateSchema, CAR_COLORS }
