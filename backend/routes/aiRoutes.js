const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const { authenticateToken } = require("../middleware/authMiddleware");

/**
 * Initialize OpenAI with API key if available
 * 
 * IMPORTANT: Never commit your actual API key to the repository!
 * Instead, use environment variables:
 * 1. Create a .env file (it's already in .gitignore)
 * 2. Add your OpenAI API key: OPENAI_API_KEY=your_actual_key_here
 * 3. The application will use mock responses if no valid key is provided
 */
let openai;
try {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.warn('WARNING: OpenAI API key not set or using default value. AI features will use mock responses.');
    openai = null;
  } else {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('OpenAI client initialized successfully');
  }
} catch (error) {
  console.error('Error initializing OpenAI:', error);
  openai = null;
}

/**
 * @route   POST /api/ai/autocomplete
 * @desc    Get AI-powered text completion suggestions
 * @access  Private
 */
router.post("/autocomplete", authenticateToken, async (req, res) => {
  try {
    const { prompt, maxTokens = 50 } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    let suggestion;

    // If OpenAI is not available, use mock responses
    if (!openai) {
      console.log('Using mock AI response for prompt:', prompt);
      
      // Generate a mock response based on the prompt
      const mockResponses = [
        " and I'm feeling much better after practicing deep breathing.",
        " which has helped me recognize my anxiety triggers more clearly.",
        " and I'm grateful for these moments of calm reflection.",
        " although I still need to work on being kinder to myself.",
        " and I'm looking forward to continuing this mindfulness practice.",
      ];
      
      // Select a random mock response
      const randomIndex = Math.floor(Math.random() * mockResponses.length);
      suggestion = mockResponses[randomIndex];
    } else {
      // Call OpenAI API for text completion
      const completion = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct", // Using the instruct model for completions
        prompt: `Complete the following mood journal entry in a helpful, empathetic way: "${prompt}"`,
        max_tokens: maxTokens,
        temperature: 0.7,
        n: 1,
        stop: null,
      });

      // Extract the generated text
      suggestion = completion.choices[0].text.trim();
    }

    res.json({ suggestion });
  } catch (error) {
    console.error("AI Autocomplete Error:", error);
    res.status(500).json({ 
      message: "Error generating suggestions", 
      error: error.message 
    });
  }
});

module.exports = router;