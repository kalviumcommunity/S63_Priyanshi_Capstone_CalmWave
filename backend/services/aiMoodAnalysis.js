const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-development'
});

/**
 * Analyze mood from journal text using OpenAI
 * @param {string} journalText - The journal entry text to analyze
 * @returns {Promise<{mood: string, confidence: number}>} - Detected mood and confidence score
 */
async function analyzeMood(journalText) {
  try {
    // If no API key is provided, return a mock response for development
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('⚠️ Using mock AI mood analysis (no OpenAI API key provided)');
      return getMockMoodAnalysis(journalText);
    }

    const prompt = `
Analyze the emotional tone of the following journal entry and classify it into one of these moods: Happy, Sad, Angry, Neutral, Anxious, Excited, Frustrated, Calm.

Journal Entry: "${journalText}"

Please respond with ONLY a JSON object in this exact format:
{
  "mood": "one of the mood categories",
  "confidence": 0.85,
  "reasoning": "brief explanation of why this mood was detected"
}

The confidence should be a number between 0 and 1, where 1 is completely confident.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert emotional intelligence AI that analyzes text for mood and sentiment. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    });

    const response = completion.choices[0].message.content.trim();
    
    try {
      const analysis = JSON.parse(response);
      
      // Validate the response format
      if (!analysis.mood || typeof analysis.confidence !== 'number') {
        throw new Error('Invalid response format from OpenAI');
      }

      // Ensure confidence is between 0 and 1
      const confidence = Math.max(0, Math.min(1, analysis.confidence));

      console.log(`✅ AI Mood Analysis: ${analysis.mood} (${Math.round(confidence * 100)}% confidence)`);
      
      return {
        mood: analysis.mood,
        confidence: confidence,
        reasoning: analysis.reasoning || 'No reasoning provided'
      };

    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', response);
      
      // Fallback to mock analysis if parsing fails
      return getMockMoodAnalysis(journalText);
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    
    // Fallback to mock analysis if API call fails
    return getMockMoodAnalysis(journalText);
  }
}

/**
 * Mock mood analysis for development/fallback
 * @param {string} journalText - The journal entry text
 * @returns {object} - Mock mood analysis result
 */
function getMockMoodAnalysis(journalText) {
  const text = journalText.toLowerCase();
  
  // Simple keyword-based mood detection for fallback
  const moodKeywords = {
    'Happy': ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'fantastic', 'awesome', 'good'],
    'Sad': ['sad', 'depressed', 'down', 'upset', 'crying', 'tears', 'lonely', 'empty', 'hurt', 'disappointed'],
    'Angry': ['angry', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'irritated', 'frustrated', 'pissed'],
    'Anxious': ['anxious', 'worried', 'nervous', 'stress', 'panic', 'fear', 'scared', 'overwhelmed', 'tension'],
    'Excited': ['excited', 'thrilled', 'pumped', 'energetic', 'enthusiastic', 'eager', 'anticipating'],
    'Frustrated': ['frustrated', 'stuck', 'blocked', 'annoying', 'difficult', 'challenging', 'struggling'],
    'Calm': ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'quiet', 'still', 'centered', 'balanced']
  };

  let detectedMood = 'Neutral';
  let maxScore = 0;

  // Count keyword matches for each mood
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    const score = keywords.reduce((count, keyword) => {
      return count + (text.includes(keyword) ? 1 : 0);
    }, 0);

    if (score > maxScore) {
      maxScore = score;
      detectedMood = mood;
    }
  }

  const confidence = maxScore > 0 ? Math.min(0.8, 0.3 + (maxScore * 0.1)) : 0.5;

  console.log(`🤖 Mock AI Analysis: ${detectedMood} (${Math.round(confidence * 100)}% confidence)`);

  return {
    mood: detectedMood,
    confidence: confidence,
    reasoning: `Mock analysis based on keyword detection (${maxScore} keywords matched)`
  };
}

module.exports = {
  analyzeMood
};