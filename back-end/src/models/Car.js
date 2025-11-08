import { z } from 'zod'

// Data de hoje (máxima para venda)
const today = new Date()
today.setHours(0, 0, 0, 0) // Zera o horário para comparação

// Data de abertura da loja (mínima para venda): 20/03/2020
// Mês é 0-indexed (0=Jan, 1=Feb, 2=Mar), então 2 é Março
const minSellingDate = new Date(2020, 2, 20)
minSellingDate.setHours(0, 0, 0, 0)

const Car = z.object({
    brand: z.string()
        .trim()
        .min(1, { message: 'A marca do carro deve ter, no mínimo, 1 caractere.' })
        .max(25, { message: 'A marca do carro deve ter, no máximo, 25 caracteres.' }),

    model: z.string()
        .trim()
        .min(1, { message: 'O modelo do carro deve ter, no mínimo, 1 caractere.' })
        .max(25, { message: 'O modelo do carro deve ter, no máximo, 25 caracteres.' }),

    color: z.enum([
        'AMARELO', 'AZUL', 'BRANCO', 'CINZA', 'DOURADO', 'LARANJA',
        'MARROM', 'PRATA', 'PRETO', 'ROSA', 'ROXO', 'VERDE', 'VERMELHO'
    ], {
        message: 'A cor deve ser uma das opções válidas.'
    }),

    year_manufacture: z.coerce.number({
        invalid_type_error: 'O ano de fabricação deve ser um número inteiro.'
    })
        .int({ message: 'O ano de fabricação deve ser um número inteiro.' })
        .min(1960, { message: 'O ano de fabricação não pode ser inferior a 1960.' })
        .max(new Date().getFullYear(), { message: `O ano de fabricação não pode ser posterior ao ano corrente (${new Date().getFullYear()}).` }),
    
    imported: z.boolean({
        invalid_type_error: 'O campo "Importado" deve ser um valor booleano (true ou false).'
    }),

    plates: z.string()
        .trim()
        // A máscara 'AAA-9$99' resulta em 8 caracteres (incluindo o hífen).
        .length(8, { message: 'A placa deve ter exatamente 8 caracteres (Ex: AAA-1234).' }),
    
    selling_date: z.coerce.date({
        invalid_type_error: 'Formato de data inválido.'
    })
        .min(minSellingDate, {
            message: `A data de venda não pode ser anterior a ${minSellingDate.toLocaleDateString('pt-BR')}.`
        })
        .max(today, {
            message: `A data de venda não pode ser posterior a hoje (${today.toLocaleDateString('pt-BR')}).`
        })
        .nullish(), // O campo é opcional
        
    selling_price: z.coerce.number({
        invalid_type_error: 'O preço de venda deve ser um número.'
    })
        .min(5000, { message: 'O preço de venda deve ser de, no mínimo, R$ 5.000,00.' })
        .max(5000000, { message: 'O preço de venda deve ser de, no máximo, R$ 5.000.000,00.' })
        .nullish(), // O campo é opcional

    // customer_id é opcional (carro não vendido)
    customer_id: z.coerce.number({
        invalid_type_error: 'O ID do cliente deve ser um número inteiro.'
    })
        .int({ message: 'O ID do cliente deve ser um número inteiro.' })
        .positive({ message: 'O ID do cliente deve ser um número positivo.' })
        .nullish(), // O campo é opcional
})

export default Car