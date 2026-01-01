
import { UserRole, TopicImage } from "../types";
import { Language } from "../contexts/LanguageContext";

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
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            topicName,
            topicContent,
            topicImages,
            role,
            gradeName,
            actionKey,
            language
        })
    });

    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.text || "No response";

  } catch (error) {
    console.error("Chat Error:", error);
    return language === 'tj' ? "Хатогӣ ҳангоми пайвастшавӣ." : "Ошибка соединения.";
  }
};
