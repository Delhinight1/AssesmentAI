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
  studentId: string
): Promise<string> {
  try {
    const prompt = `You are an academic question generator. Based on the following template and context, create a new, unique question of equivalent difficulty. Only change the specific values or the phrasing slightly, but keep the core problem the same. 

Template: '${templateText}'
Context: '${context}'
Student ID: '${studentId}' (use this to ensure uniqueness)

Generate a unique variation that maintains the same educational objectives and difficulty level. Return only the generated question text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || templateText;
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
  const generatedQuestions: GeneratedQuestion[] = [];

  for (const template of templates) {
    try {
      const questionText = await generateUniqueQuestion(
        template.templateText,
        template.context,
        studentId
      );

      generatedQuestions.push({
        questionText,
        originalTemplate: template.templateText,
        context: template.context,
        points: template.points,
      });
    } catch (error) {
      console.error(`Failed to generate question for template: ${template.templateText}`, error);
      // Use template as fallback
      generatedQuestions.push({
        questionText: template.templateText,
        originalTemplate: template.templateText,
        context: template.context,
        points: template.points,
      });
    }
  }

  return generatedQuestions;
}
