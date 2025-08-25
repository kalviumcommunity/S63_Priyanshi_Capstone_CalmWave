const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { analyzeMood } = require('../services/aiMoodAnalysis');

/**
 * POST /api/ai/analyze-mood
 * Analyze mood from journal text using AI
 */
router.post('/analyze-mood', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Journal text is required and must be a non-empty string'
      });
    }

    // Limit text length to prevent abuse
    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Journal text is too long. Maximum 5000 characters allowed.'
      });
    }

    console.log(`🔍 Analyzing mood for user ${req.user.id}...`);

    // Analyze mood using AI service
    const analysis = await analyzeMood(text.trim());

    res.json({
      success: true,
      data: {
        detectedMood: analysis.mood,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in mood analysis route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze mood. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/ai/mood-categories
 * Get available mood categories
 */
router.get('/mood-categories', (req, res) => {
  const categories = [
    { value: 'Happy', label: 'Happy', emoji: '😊', color: '#FFD700' },
    { value: 'Sad', label: 'Sad', emoji: '😢', color: '#4682B4' },
    { value: 'Angry', label: 'Angry', emoji: '😠', color: '#DC143C' },
    { value: 'Neutral', label: 'Neutral', emoji: '😐', color: '#808080' },
    { value: 'Anxious', label: 'Anxious', emoji: '😰', color: '#FF6347' },
    { value: 'Excited', label: 'Excited', emoji: '🤩', color: '#FF69B4' },
    { value: 'Frustrated', label: 'Frustrated', emoji: '😤', color: '#FF4500' },
    { value: 'Calm', label: 'Calm', emoji: '😌', color: '#98FB98' }
  ];

  res.json({
    success: true,
    data: categories
  });
});

module.exports = router;