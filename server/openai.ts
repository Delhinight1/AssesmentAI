import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface GeneratedQuestion {
  questionText: string;
  originalTemplate: string;
  context: string;
  points: number;
}

export async function generateUniqueQuestion(
  templateText: string,
  context: string,
  studentId: string,
  questionIndex: number = 0
): Promise<string> {
  try {
    // Create a unique seed based on student ID and question index for consistent uniqueness
    const uniqueSeed = `${studentId}-${questionIndex}-${templateText.slice(0, 20)}`;
    
    const prompt = `You are an advanced academic question generator specialized in creating unique, equivalent questions for assessment integrity.

TEMPLATE: "${templateText}"
CONTEXT: "${context}"
UNIQUE_SEED: "${uniqueSeed}"

REQUIREMENTS:
1. Generate a completely unique question that tests the same concepts and difficulty level
2. If the template contains placeholders in [brackets], replace them with different but appropriate values
3. Vary the scenario, numbers, units, or context while maintaining educational objectives
4. Ensure the question requires the same type of thinking and knowledge to solve
5. Use the unique seed to ensure this student gets a different question than others
6. Keep the same complexity and point value equivalence

EXAMPLES OF GOOD VARIATIONS:
- If template asks about "force on a 10kg object", vary to "acceleration of a 15kg mass"
- If template uses "triangle with sides 3,4,5", vary to "triangle with sides 5,12,13"
- If template mentions "velocity of 20 m/s", vary to "speed of 15 m/s" or different units

Generate ONLY the unique question text, no explanations:`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.8, // Higher temperature for more variation
    });

    const generatedQuestion = response.choices[0].message.content?.trim();
    
    // Ensure we got a valid response
    if (!generatedQuestion || generatedQuestion.length < 10) {
      console.warn("AI generated invalid question, using template");
      return templateText;
    }

    return generatedQuestion;
  } catch (error) {
    console.error("Failed to generate question with AI:", error);
    // Fallback to template if AI fails
    return templateText;
  }
}

export async function generateAllQuestionsForStudent(
  templates: Array<{ templateText: string; context: string; points: number; orderIndex: number }>,
  studentId: string
): Promise<GeneratedQuestion[]> {
  console.log(`Generating unique questions for student: ${studentId}`);
  
  const generatedQuestions: GeneratedQuestion[] = [];

  // Process templates in order to maintain question numbering
  const sortedTemplates = templates.sort((a, b) => a.orderIndex - b.orderIndex);

  for (let i = 0; i < sortedTemplates.length; i++) {
    const template = sortedTemplates[i];
    try {
      console.log(`Generating question ${i + 1} for student ${studentId}: ${template.templateText.slice(0, 50)}...`);
      
      const questionText = await generateUniqueQuestion(
        template.templateText,
        template.context,
        studentId,
        i
      );

      // Verify the question is actually different from the template
      const isDifferent = questionText.toLowerCase() !== template.templateText.toLowerCase();
      
      generatedQuestions.push({
        questionText,
        originalTemplate: template.templateText,
        context: template.context,
        points: template.points,
      });

      console.log(`Question ${i + 1} generated successfully. Unique: ${isDifferent}`);
      
      // Small delay between requests to avoid rate limiting
      if (i < sortedTemplates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`Failed to generate question ${i + 1} for template: ${template.templateText}`, error);
      // Use template as fallback
      generatedQuestions.push({
        questionText: template.templateText,
        originalTemplate: template.templateText,
        context: template.context,
        points: template.points,
      });
    }
  }

  console.log(`Generated ${generatedQuestions.length} questions for student ${studentId}`);
  return generatedQuestions;
}
