
import { GoogleGenAI } from "@google/genai";
import { UserRole, TopicImage } from "../types";
import { Language } from "../contexts/LanguageContext";

// Fix: Always use the API key directly from process.env.API_KEY per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLessonContent = async (
  topicName: string,
  topicContent: string | undefined,
  topicImages: TopicImage[] | undefined,
  role: UserRole,
  gradeName: string,
  actionKey: string,
  language: Language
): Promise<string> => {
  try {
    // Using gemini-3-pro-preview for complex educational tasks
    const model = 'gemini-3-pro-preview';
    const langName = language === 'tj' ? "Tajik (Cyrillic)" : "Russian";
    
    // Strict system instructions to prevent repetitive greetings and ensure grade-appropriate content
    let contextInstruction = `You are Maktab AI, an expert educational assistant.
    CRITICAL RULES:
    1. DO NOT use any greetings (Hello, Hi, Welcome, etc.).
    2. DO NOT introduce yourself or your purpose.
    3. DO NOT use repetitive filler phrases like "I am here to help" or "Feel free to ask".
    4. Provide ONLY the direct, concise answer to the request.
    5. TARGET AUDIENCE: This content is for a ${role === UserRole.TEACHER ? "Teacher" : "Student"} of ${gradeName}.
    6. COMPLEXITY LEVEL: Adjust your explanation style, vocabulary, and depth specifically for ${gradeName}.
    7. LANGUAGE: Respond strictly in ${langName}.
    8. MATH: Use LaTeX for all mathematical expressions: $x^2$, $$E=mc^2$$.`;

    if (topicContent) {
      contextInstruction += `\n\n[TEXT CONTEXT FROM TEXTBOOK]: ${topicContent}`;
    }

    if (topicImages && topicImages.length > 0) {
      contextInstruction += `\n\n[IMAGE CONTEXT]: There are ${topicImages.length} images provided from a textbook (ordered sequentially). Use them as your primary source of information for this topic.`;
    }

    // Build parts for the message
    const promptParts: any[] = [];

    // Add Images if they exist, sorted by order
    if (topicImages && topicImages.length > 0) {
      const sortedImages = [...topicImages].sort((a, b) => a.order - b.order);
      sortedImages.forEach((img) => {
        promptParts.push({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType
          }
        });
      });
    }

    // Determine the text prompt
    let userPrompt = "";
    if (language === 'tj') {
        if (role === UserRole.TEACHER) {
            if (actionKey === 'act_lesson_plan') userPrompt = `Нақшаи дарс барои мавзӯи "${topicName}" барои ${gradeName}.`;
            else if (actionKey === 'act_quiz') userPrompt = `Тест аз 3 савол барои мавзӯи "${topicName}" барои ${gradeName}.`;
            else userPrompt = actionKey;
        } else {
            if (actionKey === 'act_explain') userPrompt = `Мавзӯи "${topicName}"-ро барои хонандаи ${gradeName} шарҳ деҳ.`;
            else if (actionKey === 'act_examples') userPrompt = `Мисолҳои мувофиқи ${gradeName} барои мавзӯи "${topicName}".`;
            else if (actionKey === 'act_summary') userPrompt = `Хулосаи мавзӯи "${topicName}" барои ${gradeName}.`;
            else userPrompt = actionKey;
        }
    } else {
        if (role === UserRole.TEACHER) {
            if (actionKey === 'act_lesson_plan') userPrompt = `План урока по теме "${topicName}" для ${gradeName}.`;
            else if (actionKey === 'act_quiz') userPrompt = `Тест из 3 вопросов по теме "${topicName}" для ${gradeName}.`;
            else userPrompt = actionKey;
        } else {
            if (actionKey === 'act_explain') userPrompt = `Объясни тему "${topicName}" для ученика ${gradeName}.`;
            else if (actionKey === 'act_examples') userPrompt = `Примеры по теме "${topicName}" для ${gradeName}.`;
            else if (actionKey === 'act_summary') userPrompt = `Итог темы "${topicName}" для ${gradeName}.`;
            else userPrompt = actionKey;
        }
    }

    promptParts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: promptParts },
      config: {
        systemInstruction: contextInstruction,
        temperature: 0.7, // Balanced for educational accuracy and clarity
      }
    });

    return response.text || "No response";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'tj' ? "Хатогӣ ҳангоми пайвастшавӣ." : "Ошибка соединения.";
  }
};
