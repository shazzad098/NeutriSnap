
'use server';
/**
 * @fileOverview An AI agent that analyzes a photo of food and provides nutritional information.
 *
 * - analyzeFoodPhoto - A function that handles the food photo analysis process.
 * - AnalyzeFoodPhotoInput - The input type for the analyzeFoodPhoto function.
 * - AnalyzeFoodPhotoOutput - The return type for the analyzeFoodPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFoodPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of food, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeFoodPhotoInput = z.infer<typeof AnalyzeFoodPhotoInputSchema>;

const AnalyzeFoodPhotoOutputSchema = z.object({
  foodName: z.string().describe('The identified name of the food item (e.g., in English or its common name).'),
  nutritionInformation: z.string().describe('Detailed nutritional information for the food item, in Bangla language.'),
});
export type AnalyzeFoodPhotoOutput = z.infer<typeof AnalyzeFoodPhotoOutputSchema>;

export async function analyzeFoodPhoto(input: AnalyzeFoodPhotoInput): Promise<AnalyzeFoodPhotoOutput> {
  return analyzeFoodPhotoFlow(input);
}

const nutritionAnalysisPrompt = ai.definePrompt({
  name: 'nutritionAnalysisPrompt',
  input: {schema: AnalyzeFoodPhotoInputSchema},
  output: {schema: AnalyzeFoodPhotoOutputSchema},
  prompt: `You are a nutritional expert. Analyze the provided food photo.

  Photo: {{media url=photoDataUri}}
  
  Respond with the food name (in the language it is most commonly known, or English if unsure) and its detailed nutritional information IN BANGLA.
  Ensure the nutritional information is comprehensive and clearly formatted.
  `,
});

const analyzeFoodPhotoFlow = ai.defineFlow(
  {
    name: 'analyzeFoodPhotoFlow',
    inputSchema: AnalyzeFoodPhotoInputSchema,
    outputSchema: AnalyzeFoodPhotoOutputSchema,
  },
  async input => {
    const {output} = await nutritionAnalysisPrompt(input);
    return output!;
  }
);
