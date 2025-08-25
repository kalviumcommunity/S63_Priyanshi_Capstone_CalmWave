# 🤖 AI Mood Analysis Feature - CalmWave

## Overview
This feature adds AI-powered mood analysis to the CalmWave therapy journal web app. When users write journal entries, the system automatically analyzes the emotional tone using OpenAI's GPT-3.5-turbo model and displays the detected mood alongside the user's self-reported mood.

## 🚀 Features

### Backend Features
- **AI Mood Analysis Service**: Analyzes journal text using OpenAI API
- **Fallback System**: Mock analysis when API is unavailable or no API key is provided
- **Enhanced Mood Log Model**: Stores both user-reported and AI-detected moods
- **Dedicated AI Routes**: Separate endpoints for mood analysis
- **Security**: API keys stored in environment variables

### Frontend Features
- **Interactive Journal Page**: Clean, modern interface for writing journal entries
- **Mood Selection**: Visual mood picker with emojis and colors
- **AI Mood Display**: Shows both user-selected and AI-detected moods
- **Real-time Analysis**: AI analyzes text as users write
- **Responsive Design**: Works on desktop and mobile devices

## 📁 File Structure

### Backend Files
```
backend/
├── services/
│   └── aiMoodAnalysis.js          # AI mood analysis service
├── routes/
│   ├── aiMoodRoutes.js            # AI-specific API routes
│   └── moodLogRoutes.js           # Enhanced mood log routes
├── models/
│   └── moodLog.js                 # Updated model with AI fields
├── .env                           # Environment variables (API keys)
└── .env.example                   # Template for environment variables
```

### Frontend Files
```
frontend/
├── src/
│   ├── pages/
│   │   └── JournalPage.jsx        # Main journal interface
│   ├── styles/
│   │   └── JournalPage.css        # Journal page styles
│   ├── components/
│   │   └── Navbar.jsx             # Updated with journal link
│   └── AppContent.jsx             # Updated with journal route
```

## 🔧 Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install openai
```

#### Environment Variables
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your OpenAI API key to `.env`:
```env
OPENAI_API_KEY=sk-your_actual_openai_api_key_here
```

#### Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key to your `.env` file

### 2. Frontend Setup
No additional dependencies needed - uses existing axios for API calls.

### 3. Start the Application
```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

## 🔒 Security Best Practices

### API Key Protection
- ✅ API keys stored in `.env` file
- ✅ `.env` file in `.gitignore`
- ✅ `.env.example` provided for setup reference
- ✅ Fallback system when no API key is provided

### GitHub Safety
```bash
# Check what's being tracked
git status

# Make sure .env is not tracked
git ls-files | grep .env

# If .env is tracked, remove it
git rm --cached .env
git commit -m "Remove .env from tracking"
```

## 📊 API Endpoints

### AI Mood Analysis
```http
POST /api/ai/analyze-mood
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "I had a wonderful day today! Everything went perfectly."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "detectedMood": "Happy",
    "confidence": 0.85,
    "reasoning": "Positive language and expressions of satisfaction",
    "analyzedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Mood Categories
```http
GET /api/ai/mood-categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": "Happy",
      "label": "Happy",
      "emoji": "😊",
      "color": "#FFD700"
    }
  ]
}
```

### Enhanced Mood Log Creation
```http
POST /api/moodlogs
Authorization: Bearer <token>
Content-Type: application/json

{
  "mood": "Happy",
  "note": "Had a great day at work!",
  "date": "2024-01-15"
}
```

**Response:**
```json
{
  "message": "Mood log saved with AI analysis",
  "moodLog": {
    "_id": "...",
    "userId": "...",
    "mood": "Happy",
    "note": "Had a great day at work!",
    "aiDetectedMood": "Happy",
    "aiConfidence": 0.92,
    "date": "2024-01-15T00:00:00.000Z"
  },
  "aiAnalysis": {
    "detectedMood": "Happy",
    "confidence": 0.92,
    "hasAiAnalysis": true
  }
}
```

## 🎨 UI Components

### Mood Selection
- Visual mood picker with 8 mood categories
- Each mood has emoji, color, and label
- Hover effects and selection states

### AI Analysis Display
- Shows both user-selected and AI-detected moods
- Confidence percentage for AI predictions
- Different styling for AI vs user moods

### Journal Entry Form
- Date picker
- Mood selector
- Text area for journal content
- Real-time AI analysis preview

## 🧪 Testing

### Mock Analysis (Development)
When no OpenAI API key is provided, the system uses keyword-based analysis:

```javascript
// Example mock analysis
const mockKeywords = {
  'Happy': ['happy', 'joy', 'great', 'wonderful', 'amazing'],
  'Sad': ['sad', 'depressed', 'down', 'upset', 'crying'],
  // ... more categories
};
```

### Test the Feature
1. Start the application without an API key
2. Create a journal entry with emotional text
3. Verify mock analysis works
4. Add API key and test real AI analysis

## 🚨 Error Handling

### Backend Error Handling
- API key validation
- OpenAI API error handling
- Fallback to mock analysis
- Input validation and sanitization

### Frontend Error Handling
- Network error handling
- Loading states during analysis
- User-friendly error messages
- Graceful degradation

## 🔄 Development vs Production

### Development Mode
- Uses mock analysis when no API key
- Detailed error logging
- Development-friendly error messages

### Production Mode
- Requires valid OpenAI API key
- Minimal error exposure
- Performance optimizations

## 📈 Future Enhancements

### Potential Improvements
1. **Multiple AI Providers**: Support for Hugging Face, Azure Cognitive Services
2. **Mood Trends**: Visualize mood patterns over time
3. **Personalized Analysis**: Learn from user feedback
4. **Batch Analysis**: Analyze multiple entries at once
5. **Mood Recommendations**: Suggest activities based on detected mood

### Advanced Features
1. **Sentiment Scoring**: More granular emotion detection
2. **Keyword Extraction**: Identify key themes in entries
3. **Mood Prediction**: Predict future mood based on patterns
4. **Integration**: Connect with therapy sessions and quiz results

## 🤝 Contributing

### Adding New Mood Categories
1. Update the mood enum in `backend/models/moodLog.js`
2. Add the new mood to `frontend/src/pages/JournalPage.jsx`
3. Update the AI analysis service keywords
4. Add appropriate emoji and color

### Improving AI Analysis
1. Enhance the prompt in `backend/services/aiMoodAnalysis.js`
2. Add more sophisticated fallback logic
3. Implement confidence thresholds
4. Add support for multiple languages

## 📝 License & Usage

This feature is part of the CalmWave therapy journal application. The AI analysis uses OpenAI's API and requires compliance with their usage policies.

### OpenAI Usage Guidelines
- Respect rate limits
- Follow content policy
- Monitor usage costs
- Implement proper error handling

---

## 🎯 Quick Start Checklist

- [ ] Install OpenAI package: `npm install openai`
- [ ] Copy `.env.example` to `.env`
- [ ] Add OpenAI API key to `.env`
- [ ] Verify `.env` is in `.gitignore`
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Navigate to `/journal`
- [ ] Create a test journal entry
- [ ] Verify AI mood analysis works

**🎉 You're ready to use AI-powered mood analysis in CalmWave!**