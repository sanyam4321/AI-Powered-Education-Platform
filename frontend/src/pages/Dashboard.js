import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { createTopic, fetchUserTopics } from '../redux/slices/topicSlice';
import { fetchUserProgress } from '../redux/slices/progressSlice';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const { topics, creating } = useSelector((state) => state.topics);
  const { progress } = useSelector((state) => state.progress);

  const [newTopic, setNewTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');

  useEffect(() => {
    dispatch(fetchUserTopics());
    if (user?.id) {
      dispatch(fetchUserProgress(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (dashboardRef.current) {
      gsap.fromTo(dashboardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, []);

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) {
      toast.error('Please enter a topic name');
      return;
    }

    try {
      await dispatch(createTopic({
        title: newTopic.trim(),
        difficulty_level: difficulty,
      })).unwrap();
      
      setNewTopic('');
      toast.success('Topic created successfully!');
    } catch (error) {
      toast.error(error || 'Failed to create topic');
    }
  };

  const getProgressStats = () => {
    if (!progress || progress.length === 0) {
      return { totalTopics: 0, averageScore: 0, totalTime: 0 };
    }

    const totalTopics = progress.length;
    const averageScore = progress.reduce((sum, p) => sum + p.quiz_score, 0) / totalTopics;
    const totalTime = progress.reduce((sum, p) => sum + p.time_spent, 0);

    return { totalTopics, averageScore, totalTime };
  };

  const stats = getProgressStats();

  return (
    <div ref={dashboardRef} className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to continue your learning journey? Create a new topic or explore your existing ones.
          </p>
        </div>
      </div>

      {/* Create New Topic */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Learning Topic</h2>
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                What would you like to learn?
              </label>
              <input
                id="topic"
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="input-field"
                placeholder="e.g., Python decorators, World War II, Machine Learning basics..."
                disabled={creating}
              />
            </div>
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input-field"
                disabled={creating}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={creating || !newTopic.trim()}
            className="btn-primary flex items-center justify-center"
          >
            {creating ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Creating your learning content...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Topic
              </>
            )}
          </button>
        </form>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">{stats.totalTopics}</div>
          <div className="text-gray-600">Topics Started</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.averageScore.toFixed(1)}%
          </div>
          <div className="text-gray-600">Average Score</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalTime}</div>
          <div className="text-gray-600">Minutes Learned</div>
        </div>
      </div>

      {/* Recent Topics */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Learning Topics</h2>
        {topics.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-500">No topics yet. Create your first learning topic above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.slice(0, 6).map((topic) => (
              <div
                key={topic.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/topic/${topic.id}`)}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span className="capitalize">{topic.difficulty_level}</span>
                  <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                </div>
                {topic.progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{topic.progress.completion_percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${topic.progress.completion_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {topics.length > 6 && (
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/progress')}
              className="btn-secondary"
            >
              View All Topics
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 