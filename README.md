# AI-Powered E-Learning Platform

A modern, intelligent e-learning platform that uses AI to generate personalized learning content and track user progress in real-time.

## 🚀 Features

- **AI-Powered Content Generation**: Automatically generate quizzes, summaries, and learning modules from any topic
- **Personalized Learning**: Content adapts based on user progress and understanding
- **Interactive UI**: Modern interface with GSAP animations and smooth transitions
- **Real-time Progress Tracking**: Monitor learning progress with detailed analytics
- **Adaptive Learning**: Content difficulty adjusts based on performance
- **Topic Flexibility**: Learn any subject by simply entering a topic name

## 🛠️ Tech Stack

### Backend
- **Flask**: Python web framework for API
- **OpenAI API**: AI content generation
- **MySQL**: Database for user data and progress
- **JWT**: Authentication and session management

### Frontend
- **React**: Modern UI framework
- **Redux**: State management
- **GSAP**: Smooth animations and transitions
- **Tailwind CSS**: Modern styling
- **Chart.js**: Progress visualization

## 📁 Project Structure

```
ai-elearning-platform/
├── backend/                 # Flask API server
│   ├── app.py              # Main Flask application
│   ├── models.py           # Database models
│   ├── routes.py           # API endpoints
│   ├── ai_service.py       # AI content generation
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── redux/          # Redux store and actions
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API key

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables
Create a `.env` file in the backend directory:
```
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_secret_key_here
```

## 🎯 How It Works

1. **Topic Input**: Users enter any topic they want to learn
2. **AI Generation**: The system uses OpenAI to generate:
   - Learning summaries
   - Interactive quizzes
   - Practice exercises
   - Progress assessments
3. **Personalization**: Content adapts based on:
   - User performance on quizzes
   - Learning pace
   - Topic complexity preferences
4. **Progress Tracking**: Real-time analytics show:
   - Completion rates
   - Performance metrics
   - Learning recommendations

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface
- **Smooth Animations**: GSAP-powered transitions
- **Responsive Layout**: Works on all devices
- **Dark/Light Mode**: User preference support
- **Progress Visualization**: Charts and graphs for learning analytics

## 🔧 API Endpoints

- `POST /api/topics` - Generate learning content for a topic
- `GET /api/progress/:user_id` - Get user progress
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/recommendations/:user_id` - Get personalized recommendations

