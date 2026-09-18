import { z } from 'zod';

export const RecipeCategorySchema = z.enum([
  'Sobremesas',
  'Massas',
  'Carnes',
  'Outros',
]);

export type RecipeCategory = z.infer<typeof RecipeCategorySchema>;

export const RECIPE_CATEGORIES: ReadonlyArray<RecipeCategory> = [
  'Sobremesas',
  'Massas',
  'Carnes',
  'Outros',
];

export const FILTER_CATEGORIES = ['Todas', ...RECIPE_CATEGORIES] as const;
export type FilterCategory = (typeof FILTER_CATEGORIES)[number];

export const RecipeSchema = z.object({
  _id: z.string(),
  bookId: z.string(),
  userId: z.string().optional(),
  title: z.string().min(1, 'O nome da receita é obrigatório'),
  category: RecipeCategorySchema,
  ingredients: z.array(z.string()),
  preparation: z.array(z.string()),
  imageUrl: z.string().optional().default(''),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

export type Recipe = Readonly<z.infer<typeof RecipeSchema>>;

export const RecipeInputSchema = z.object({
  title: z.string().min(1, 'O nome da receita é obrigatório'),
  category: RecipeCategorySchema,
  ingredients: z
    .array(z.string())
    .min(1, 'Informe ao menos um ingrediente para a receita'),
  preparation: z
    .array(z.string())
    .min(1, 'Informe ao menos um passo de modo de preparo'),
  imageUrl: z.string().optional().default(''),
});

export type RecipeInput = Readonly<z.infer<typeof RecipeInputSchema>>;

export const JarvisImportResponseSchema = z.object({
  titulo: z.string(),
  categoria: RecipeCategorySchema.catch('Outros'),
  ingredientes: z.array(z.string()),
  modo_preparo: z.array(z.string()),
});

export type JarvisImportResponse = Readonly<
  z.infer<typeof JarvisImportResponseSchema>
>;
