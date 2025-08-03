from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import app, db
from models import User, Topic, Quiz, ProgressRecord, LearningSession
from ai_service import AIService
import json
from datetime import datetime, timedelta

ai_service = AIService()

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        learning_level=data.get('learning_level', 'beginner')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'User created successfully',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'learning_level': user.learning_level
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'learning_level': user.learning_level
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

# Topic routes
@app.route('/api/topics', methods=['POST'])
@jwt_required()
def create_topic():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': 'Topic title is required'}), 400
    
    # Generate AI content for the topic
    try:
        ai_content = ai_service.generate_topic_content(
            topic=data['title'],
            difficulty_level=data.get('difficulty_level', 'beginner')
        )
        
        # Create topic
        topic = Topic(
            title=data['title'],
            description=data.get('description', ''),
            content=json.dumps(ai_content),
            difficulty_level=data.get('difficulty_level', 'beginner'),
            user_id=current_user_id
        )
        
        db.session.add(topic)
        db.session.commit()
        
        # Create quizzes from AI content
        for quiz_data in ai_content.get('quizzes', []):
            quiz = Quiz(
                question=quiz_data['question'],
                correct_answer=quiz_data['correct_answer'],
                options=json.dumps(quiz_data['options']),
                explanation=quiz_data['explanation'],
                topic_id=topic.id
            )
            db.session.add(quiz)
        
        # Create initial progress record
        progress = ProgressRecord(
            user_id=current_user_id,
            topic_id=topic.id
        )
        db.session.add(progress)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Topic created successfully',
            'topic': {
                'id': topic.id,
                'title': topic.title,
                'content': ai_content,
                'difficulty_level': topic.difficulty_level,
                'created_at': topic.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Error creating topic: {str(e)}'}), 500

@app.route('/api/topics', methods=['GET'])
@jwt_required()
def get_user_topics():
    current_user_id = get_jwt_identity()
    
    topics = Topic.query.filter_by(user_id=current_user_id).all()
    
    topics_data = []
    for topic in topics:
        progress = ProgressRecord.query.filter_by(
            user_id=current_user_id,
            topic_id=topic.id
        ).first()
        
        topics_data.append({
            'id': topic.id,
            'title': topic.title,
            'description': topic.description,
            'difficulty_level': topic.difficulty_level,
            'created_at': topic.created_at.isoformat(),
            'progress': {
                'completion_percentage': progress.completion_percentage if progress else 0,
                'quiz_score': progress.quiz_score if progress else 0,
                'time_spent': progress.time_spent if progress else 0
            } if progress else None
        })
    
    return jsonify({'topics': topics_data}), 200

@app.route('/api/topics/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_topic(topic_id):
    current_user_id = get_jwt_identity()
    
    topic = Topic.query.filter_by(id=topic_id, user_id=current_user_id).first()
    
    if not topic:
        return jsonify({'error': 'Topic not found'}), 404
    
    # Parse AI-generated content
    content = json.loads(topic.content) if topic.content else {}
    
    # Get quizzes
    quizzes = Quiz.query.filter_by(topic_id=topic.id).all()
    quiz_data = []
    for quiz in quizzes:
        quiz_data.append({
            'id': quiz.id,
            'question': quiz.question,
            'options': json.loads(quiz.options) if quiz.options else [],
            'correct_answer': quiz.correct_answer,
            'explanation': quiz.explanation,
            'difficulty': quiz.difficulty
        })
    
    return jsonify({
        'topic': {
            'id': topic.id,
            'title': topic.title,
            'description': topic.description,
            'content': content,
            'quizzes': quiz_data,
            'difficulty_level': topic.difficulty_level,
            'created_at': topic.created_at.isoformat()
        }
    }), 200

# Quiz routes
@app.route('/api/quiz/submit', methods=['POST'])
@jwt_required()
def submit_quiz():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('topic_id') or not data.get('answers'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    topic_id = data['topic_id']
    answers = data['answers']
    
    # Get topic and quizzes
    topic = Topic.query.filter_by(id=topic_id, user_id=current_user_id).first()
    if not topic:
        return jsonify({'error': 'Topic not found'}), 404
    
    quizzes = Quiz.query.filter_by(topic_id=topic_id).all()
    
    # Calculate score
    correct_answers = 0
    total_questions = len(quizzes)
    results = []
    
    for quiz in quizzes:
        user_answer = answers.get(str(quiz.id))
        is_correct = user_answer == quiz.correct_answer
        
        if is_correct:
            correct_answers += 1
        
        results.append({
            'question_id': quiz.id,
            'question': quiz.question,
            'user_answer': user_answer,
            'correct_answer': quiz.correct_answer,
            'is_correct': is_correct,
            'explanation': quiz.explanation
        })
    
    score_percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    
    # Update progress
    progress = ProgressRecord.query.filter_by(
        user_id=current_user_id,
        topic_id=topic_id
    ).first()
    
    if progress:
        progress.update_progress(quiz_score=score_percentage)
    else:
        progress = ProgressRecord(
            user_id=current_user_id,
            topic_id=topic_id,
            quiz_score=score_percentage
        )
        db.session.add(progress)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Quiz submitted successfully',
        'score': score_percentage,
        'correct_answers': correct_answers,
        'total_questions': total_questions,
        'results': results
    }), 200

# Progress routes
@app.route('/api/progress/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_progress(user_id):
    current_user_id = get_jwt_identity()
    
    # Users can only view their own progress
    if current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    progress_records = ProgressRecord.query.filter_by(user_id=user_id).all()
    
    progress_data = []
    for record in progress_records:
        topic = Topic.query.get(record.topic_id)
        if topic:
            progress_data.append({
                'topic_id': record.topic_id,
                'topic_title': topic.title,
                'completion_percentage': record.completion_percentage,
                'quiz_score': record.quiz_score,
                'time_spent': record.time_spent,
                'last_accessed': record.last_accessed.isoformat()
            })
    
    return jsonify({'progress': progress_data}), 200

@app.route('/api/progress/update', methods=['POST'])
@jwt_required()
def update_progress():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('topic_id'):
        return jsonify({'error': 'Topic ID is required'}), 400
    
    progress = ProgressRecord.query.filter_by(
        user_id=current_user_id,
        topic_id=data['topic_id']
    ).first()
    
    if not progress:
        return jsonify({'error': 'Progress record not found'}), 404
    
    # Update progress fields
    if 'completion_percentage' in data:
        progress.completion_percentage = data['completion_percentage']
    if 'time_spent' in data:
        progress.time_spent += data['time_spent']
    
    progress.last_accessed = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Progress updated successfully'}), 200

# Recommendations route
@app.route('/api/recommendations/<int:user_id>', methods=['GET'])
@jwt_required()
def get_recommendations(user_id):
    current_user_id = get_jwt_identity()
    
    if current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get user's topics and performance
    user_topics = []
    user_performance = {}
    
    topics = Topic.query.filter_by(user_id=user_id).all()
    for topic in topics:
        user_topics.append(topic.title)
        progress = ProgressRecord.query.filter_by(
            user_id=user_id,
            topic_id=topic.id
        ).first()
        
        if progress:
            user_performance[topic.title] = progress.quiz_score
    
    # Generate recommendations
    try:
        recommendations = ai_service.generate_learning_recommendations(
            user_topics=user_topics,
            user_performance=user_performance
        )
        
        return jsonify({
            'recommendations': recommendations,
            'user_topics': user_topics,
            'performance_summary': user_performance
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error generating recommendations: {str(e)}'}), 500

# Session management
@app.route('/api/session/start', methods=['POST'])
@jwt_required()
def start_session():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('topic_id'):
        return jsonify({'error': 'Topic ID is required'}), 400
    
    session = LearningSession(
        user_id=current_user_id,
        topic_id=data['topic_id']
    )
    
    db.session.add(session)
    db.session.commit()
    
    return jsonify({
        'message': 'Session started',
        'session_id': session.id,
        'start_time': session.start_time.isoformat()
    }), 201

@app.route('/api/session/end', methods=['POST'])
@jwt_required()
def end_session():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('session_id'):
        return jsonify({'error': 'Session ID is required'}), 400
    
    session = LearningSession.query.filter_by(
        id=data['session_id'],
        user_id=current_user_id
    ).first()
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    session.end_session()
    session.activities_completed = data.get('activities_completed', 0)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Session ended',
        'duration': session.duration,
        'activities_completed': session.activities_completed
    }), 200

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'AI E-Learning Platform API is running'}), 200 