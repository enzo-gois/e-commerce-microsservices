import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('O preço deve ser maior que zero'),
  stock: z
    .number()
    .int()
    .nonnegative('O estoque não pode ser negativo')
    .default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const idParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});
