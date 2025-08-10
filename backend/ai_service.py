import json
import os
from typing import Dict, List, Any
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain.schema import HumanMessage, SystemMessage
from pydantic import BaseModel, Field
from typing import List as TypeList

# Pydantic models for structured output
class QuizQuestion(BaseModel):
    question: str = Field(description="The quiz question")
    options: TypeList[str] = Field(description="List of answer options")
    correct_answer: str = Field(description="The correct answer")
    explanation: str = Field(description="Explanation of why this answer is correct")

class TopicContent(BaseModel):
    summary: str = Field(description="Detailed explanation of the topic")
    key_concepts: TypeList[str] = Field(description="List of key concepts")
    learning_objectives: TypeList[str] = Field(description="List of learning objectives")
    quizzes: TypeList[QuizQuestion] = Field(description="List of quiz questions")
    next_topics: TypeList[str] = Field(description="Suggested next topics")
    estimated_duration: str = Field(description="Estimated time in minutes")

class AdaptiveQuiz(BaseModel):
    questions: TypeList[QuizQuestion] = Field(description="List of quiz questions")
    estimated_time: str = Field(description="Estimated time in minutes")

class AIService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7,
            api_key=os.getenv('OPENAI_API_KEY')
        )
        self.parser = PydanticOutputParser(pydantic_object=TopicContent)
    
    def generate_topic_content(self, topic: str, difficulty_level: str = 'beginner') -> Dict[str, Any]:
        """Generate comprehensive learning content for a topic"""
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", "You are an expert educational content creator. Provide clear, engaging, and accurate learning materials."),
            ("human", """
            Create comprehensive learning content for the topic: "{topic}" at {difficulty_level} level.
            
            Please provide:
            1. A detailed summary/explanation (500-800 words)
            2. 5 multiple choice questions with explanations
            3. Key concepts and definitions
            4. Learning objectives
            5. Suggested next topics for progression
            
            {format_instructions}
            """)
        ])
        
        try:
            chain = prompt_template | self.llm | self.parser
            result = chain.invoke({
                "topic": topic,
                "difficulty_level": difficulty_level,
                "format_instructions": self.parser.get_format_instructions()
            })
            
            # Convert Pydantic model to dict
            return result.model_dump()
            
        except Exception as e:
            print(f"Error generating content: {e}")
            return self._get_fallback_content(topic, difficulty_level)
    
    def generate_adaptive_quiz(self, topic: str, user_level: str, previous_performance: float) -> Dict[str, Any]:
        """Generate adaptive quiz based on user performance"""
        
        difficulty_adjustment = self._calculate_difficulty_adjustment(previous_performance)
        
        # Create parser for adaptive quiz
        adaptive_parser = PydanticOutputParser(pydantic_object=AdaptiveQuiz)
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", "You are an expert quiz creator. Create engaging and educational questions."),
            ("human", """
            Create a {difficulty_adjustment} difficulty quiz for the topic: "{topic}" 
            User's current level: {user_level}
            Previous performance: {previous_performance}%
            
            Generate 3 questions that are appropriate for this level and performance.
            Make sure the questions are challenging but achievable.
            
            {format_instructions}
            """)
        ])
        
        try:
            chain = prompt_template | self.llm | adaptive_parser
            result = chain.invoke({
                "topic": topic,
                "user_level": user_level,
                "previous_performance": previous_performance,
                "difficulty_adjustment": difficulty_adjustment,
                "format_instructions": adaptive_parser.get_format_instructions()
            })
            
            return result.model_dump()
            
        except Exception as e:
            print(f"Error generating quiz: {e}")
            return self._get_fallback_quiz(topic)
    
    def generate_learning_recommendations(self, user_topics: List[str], user_performance: Dict[str, float]) -> List[str]:
        """Generate personalized learning recommendations"""
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", "You are an expert learning advisor. Provide personalized recommendations."),
            ("human", """
            Based on the user's learning history and performance, suggest 5 new topics to learn.
            
            User's previous topics: {user_topics}
            Performance summary: {user_performance}
            
            Consider:
            1. Topics that build upon their existing knowledge
            2. Areas where they might need improvement
            3. Related subjects that would be interesting
            4. Progressive difficulty levels
            
            Return as a JSON array of topic names.
            """)
        ])
        
        try:
            chain = prompt_template | self.llm
            result = chain.invoke({
                "user_topics": ', '.join(user_topics),
                "user_performance": json.dumps(user_performance)
            })
            
            # Parse the response to extract the JSON array
            content = result.content
            # Extract JSON array from the response
            import re
            json_match = re.search(r'\[.*\]', content)
            if json_match:
                return json.loads(json_match.group())
            else:
                # Fallback: split by commas and clean up
                topics = [topic.strip().strip('"[]') for topic in content.split(',')]
                return topics[:5]  # Return first 5 topics
            
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            return self._get_fallback_recommendations()
    
    def _calculate_difficulty_adjustment(self, performance: float) -> str:
        """Calculate appropriate difficulty based on performance"""
        if performance >= 80:
            return "hard"
        elif performance >= 60:
            return "medium"
        else:
            return "easy"
    
    def _get_fallback_content(self, topic: str, difficulty_level: str) -> Dict[str, Any]:
        """Fallback content when AI generation fails"""
        return {
            "summary": f"Here's a comprehensive overview of {topic}. This topic covers fundamental concepts and principles that are essential for understanding the subject matter.",
            "key_concepts": [f"Concept 1 related to {topic}", f"Concept 2 related to {topic}", f"Concept 3 related to {topic}"],
            "learning_objectives": [f"Understand the basics of {topic}", f"Apply {topic} concepts", f"Analyze {topic} principles"],
            "quizzes": [
                {
                    "question": f"What is the main concept of {topic}?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": "Option A",
                    "explanation": "This is the correct answer because..."
                }
            ],
            "next_topics": [f"Advanced {topic}", f"{topic} applications", f"Related topic"],
            "estimated_duration": "30"
        }
    
    def _get_fallback_quiz(self, topic: str) -> Dict[str, Any]:
        """Fallback quiz when AI generation fails"""
        return {
            "questions": [
                {
                    "question": f"Basic question about {topic}?",
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": "A",
                    "explanation": "This is correct because...",
                    "difficulty": "medium"
                }
            ],
            "estimated_time": "10"
        }
    
    def _get_fallback_recommendations(self) -> List[str]:
        """Fallback recommendations when AI generation fails"""
        return [
            "Machine Learning Basics",
            "Data Science Fundamentals",
            "Web Development",
            "Python Programming",
            "Artificial Intelligence"
        ] 
