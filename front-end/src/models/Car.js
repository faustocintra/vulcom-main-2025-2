import { z } from 'zod'

const Car = z.object({
  brand: z.string()
    .min(1, { message: 'A marca do veículo é obrigatória.' })
    .max(30, { message: 'A marca pode ter, no máximo, 30 caracteres.' }),

  model: z.string()
    .min(1, { message: 'O modelo do veículo é obrigatório.' })
    .max(50, { message: 'O modelo pode ter, no máximo, 50 caracteres.' }),

  color: z.string()
    .min(1, { message: 'A cor do veículo é obrigatória.' })
    .max(30, { message: 'A cor pode ter, no máximo, 30 caracteres.' }),

  year_manufacture: z.coerce.number()
    .int({ message: 'O ano de fabricação deve ser um número inteiro.' })
    .min(1900, { message: 'O ano de fabricação deve ser maior que 1900.' })
    .max(new Date().getFullYear(), { message: 'O ano de fabricação não pode ser no futuro.' }),

  imported: z.boolean()
    .default(false),

  plates: z.string()
    .min(1, { message: 'As placas do veículo são obrigatórias.' })
    .max(10, { message: 'As placas podem ter, no máximo, 10 caracteres.' })
    .regex(/^[A-Z]{3}-?\d{1,4}$/, { message: 'A placa deve ter exatamente 8 caracteres (Ex: AAA-1234).' })
})

export default Car
