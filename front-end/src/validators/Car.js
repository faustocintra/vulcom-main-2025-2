import { z } from 'zod'

// Ano atual calculado 
const anoAtual = new Date().getFullYear()

// Data inicial da loja (20/03/2020)
const dataInicioLoja = new Date(2020, 2, 20) // Março = índice 2
const dataHoje = new Date()

// Lista de cores permitidas
const listaCoresPermitidas = [
  'AMARELO', 'AZUL', 'BRANCO', 'CINZA', 'DOURADO', 'LARANJA',
  'MARROM', 'PRATA', 'PRETO', 'ROSA', 'ROXO', 'VERDE', 'VERMELHO'
]

// Esquema de validação do carro
const Car = z.object({

  brand: z.string()
    .trim()
    .min(1, { message: 'Informe ao menos 1 caractere para a marca.' })
    .max(25, { message: 'A marca não pode exceder 25 caracteres.' }),

  model: z.string()
    .trim()
    .min(1, { message: 'Informe ao menos 1 caractere para o modelo.' })
    .max(25, { message: 'O modelo não pode exceder 25 caracteres.' }),

  color: z.enum(listaCoresPermitidas, {
    message: 'Cor não reconhecida. Escolha uma cor válida.'
  }),

  year_manufacture: z.number({
      invalid_type_error: 'O ano de fabricação precisa ser numérico.'
    })
    .int({ message: 'O ano de fabricação deve ser inteiro.' })
    .min(1960, { message: 'O ano de fabricação não pode ser menor que 1960.' })
    .max(anoAtual, { message: `O ano de fabricação não pode ultrapassar ${anoAtual}.` }),

  imported: z.boolean({
    invalid_type_error: 'O campo "importado" deve ser verdadeiro ou falso.'
  }),

  plates: z.string()
    .trim()
    .refine(v => v.length === 8, {
      message: 'A placa deve conter exatamente 8 caracteres.'
    }),

  selling_date: z.coerce.date()
    .min(dataInicioLoja, {
      message: 'A data de venda não pode ser anterior ao início das operações da loja (20/03/2020).'
    })
    .max(dataHoje, {
      message: 'A data de venda não pode ser posterior à data atual.'
    })
    .nullish(),

  selling_price: z.coerce.number()
    .min(5000, { message: 'O valor mínimo de venda é R$ 5.000,00.' })
    .max(5000000, { message: 'O valor máximo de venda é R$ 5.000.000,00.' })
    .nullish()
})

export default Car
