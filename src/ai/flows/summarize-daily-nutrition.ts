// src/ai/flows/summarize-daily-nutrition.ts
'use server';

/**
 * @fileOverview A flow to summarize the user's daily nutritional intake and provide insights.
 *
 * - summarizeDailyNutrition - A function that summarizes the daily nutritional intake.
 * - SummarizeDailyNutritionInput - The input type for the summarizeDailyNutrition function.
 * - SummarizeDailyNutritionOutput - The return type for the summarizeDailyNutrition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDailyNutritionInputSchema = z.object({
  foodItems: z.array(
    z.object({
      name: z.string().describe('The name of the food item.'),
      calories: z.number().describe('The number of calories in the food item.'),
      protein: z.number().describe('The amount of protein in grams.'),
      fat: z.number().describe('The amount of fat in grams.'),
      carbohydrates: z.number().describe('The amount of carbohydrates in grams.'),
      vitamin_c: z.number().optional().describe('The amount of vitamin C in milligrams, if available.'),
    })
  ).describe('An array of food items consumed during the day with their nutritional information.'),
});
export type SummarizeDailyNutritionInput = z.infer<typeof SummarizeDailyNutritionInputSchema>;

const SummarizeDailyNutritionOutputSchema = z.object({
  summary: z.string().describe('A summary of the daily nutritional intake, highlighting potential imbalances or areas for improvement.'),
});
export type SummarizeDailyNutritionOutput = z.infer<typeof SummarizeDailyNutritionOutputSchema>;

export async function summarizeDailyNutrition(input: SummarizeDailyNutritionInput): Promise<SummarizeDailyNutritionOutput> {
  return summarizeDailyNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDailyNutritionPrompt',
  input: {schema: SummarizeDailyNutritionInputSchema},
  output: {schema: SummarizeDailyNutritionOutputSchema},
  prompt: `You are a nutrition expert. Summarize the following daily nutritional intake and highlight potential imbalances or areas for improvement.

Food Items:
{{#each foodItems}}
- {{name}}: Calories: {{calories}}, Protein: {{protein}}g, Fat: {{fat}}g, Carbs: {{carbohydrates}}g {{#if vitamin_c}}, Vitamin C: {{vitamin_c}}mg{{/if}}
{{/each}}`,
});

const summarizeDailyNutritionFlow = ai.defineFlow(
  {
    name: 'summarizeDailyNutritionFlow',
    inputSchema: SummarizeDailyNutritionInputSchema,
    outputSchema: SummarizeDailyNutritionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
