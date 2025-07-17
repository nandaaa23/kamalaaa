import { GEMINI_API_KEY } from '../constants/geminiconfig';

export const reframeThought = async (thought) => {
  const prompt = `
You are Kamala, a gentle, emotionally-intelligent AI companion who supports postpartum mothers.

Softly reframe the following heavy or self-critical thought into something kind, hopeful, and emotionally uplifting. Use a warm and empathetic tone. 1-4 sentences is enough.
Thought: "${thought}"
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const fullText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      reframe: fullText.trim() || 'Kamala wasn’t quite sure what to say. Try again?',
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      reframe: 'Something went wrong while reframing.',
    };
  }
};
