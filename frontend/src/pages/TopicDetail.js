import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { gsap } from 'gsap';
import { fetchTopic } from '../redux/slices/topicSlice';

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const topicRef = useRef(null);
  const { currentTopic, loading } = useSelector((state) => state.topics);

  useEffect(() => {
    if (id) {
      dispatch(fetchTopic(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (topicRef.current && currentTopic) {
      gsap.fromTo(topicRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, [currentTopic]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!currentTopic) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Topic not found</p>
      </div>
    );
  }

  const content = currentTopic.content || {};

  return (
    <div ref={topicRef} className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentTopic.title}</h1>
            <p className="text-gray-600">Difficulty: {currentTopic.difficulty_level}</p>
          </div>
          <button
            onClick={() => navigate(`/quiz/${currentTopic.id}`)}
            className="btn-primary"
          >
            Take Quiz
          </button>
        </div>
      </div>

      {/* Summary */}
      {content.summary && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{content.summary}</p>
          </div>
        </div>
      )}

      {/* Key Concepts */}
      {content.key_concepts && content.key_concepts.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Concepts</h2>
          <ul className="space-y-2">
            {content.key_concepts.map((concept, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                <span className="text-gray-700">{concept}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Learning Objectives */}
      {content.learning_objectives && content.learning_objectives.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Objectives</h2>
          <ul className="space-y-2">
            {content.learning_objectives.map((objective, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Topics */}
      {content.next_topics && content.next_topics.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Suggested Next Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {content.next_topics.map((topic, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Duration */}
      {content.estimated_duration && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Estimated Learning Time</h2>
              <p className="text-gray-600">{content.estimated_duration} minutes</p>
            </div>
            <button
              onClick={() => navigate(`/quiz/${currentTopic.id}`)}
              className="btn-primary"
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicDetail; 