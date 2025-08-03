import React from 'react';
import { useParams } from 'react-router-dom';

const Quiz = () => {
  const { topicId } = useParams();

  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz</h1>
      <p className="text-gray-600">Quiz functionality for topic {topicId} will be implemented here.</p>
      <p className="text-gray-500 mt-4">This will include:</p>
      <ul className="list-disc list-inside text-gray-500 mt-2 space-y-1">
        <li>Multiple choice questions</li>
        <li>Real-time scoring</li>
        <li>Progress tracking</li>
        <li>Detailed explanations</li>
      </ul>
    </div>
  );
};

export default Quiz; 