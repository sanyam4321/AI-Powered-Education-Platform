from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    learning_level = db.Column(db.String(20), default='beginner')  # beginner, intermediate, advanced
    
    # Relationships
    topics = db.relationship('Topic', backref='user', lazy=True)
    progress_records = db.relationship('ProgressRecord', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Topic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    content = db.Column(db.Text)  # AI-generated content
    difficulty_level = db.Column(db.String(20), default='beginner')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    quizzes = db.relationship('Quiz', backref='topic', lazy=True)
    progress_records = db.relationship('ProgressRecord', backref='topic', lazy=True)

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.String(500), nullable=False)
    options = db.Column(db.Text)  # JSON string of answer options
    explanation = db.Column(db.Text)
    difficulty = db.Column(db.String(20), default='medium')
    topic_id = db.Column(db.Integer, db.ForeignKey('topic.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ProgressRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey('topic.id'), nullable=False)
    quiz_score = db.Column(db.Float, default=0.0)
    completion_percentage = db.Column(db.Float, default=0.0)
    time_spent = db.Column(db.Integer, default=0)  # in minutes
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def update_progress(self, quiz_score=None, completion_percentage=None, time_spent=None):
        if quiz_score is not None:
            self.quiz_score = quiz_score
        if completion_percentage is not None:
            self.completion_percentage = completion_percentage
        if time_spent is not None:
            self.time_spent += time_spent
        self.last_accessed = datetime.utcnow()

class LearningSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey('topic.id'), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    duration = db.Column(db.Integer)  # in minutes
    activities_completed = db.Column(db.Integer, default=0)
    
    def end_session(self):
        self.end_time = datetime.utcnow()
        self.duration = int((self.end_time - self.start_time).total_seconds() / 60) 