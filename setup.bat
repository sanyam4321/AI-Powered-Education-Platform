@echo off
echo ========================================
echo AI E-Learning Platform Setup Script
echo ========================================
echo.

echo Setting up backend...
cd backend
echo Installing Python dependencies...
pip install -r requirements.txt
echo.

echo Creating .env file for backend...
echo OPENAI_API_KEY=your_openai_api_key_here > .env
echo SECRET_KEY=your-secret-key-change-this-in-production >> .env
echo JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production >> .env
echo.

echo Backend setup complete!
echo.
echo Setting up frontend...
cd ..\frontend
echo Installing Node.js dependencies...
npm install
echo.

echo Creating .env file for frontend...
echo REACT_APP_API_URL=http://localhost:5000 > .env
echo.

echo Frontend setup complete!
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo 1. Start the backend: cd backend && python app.py
echo 2. Start the frontend: cd frontend && npm start
echo.
echo Don't forget to:
echo - Add your OpenAI API key to backend/.env
echo - Change the secret keys in production
echo.
pause 