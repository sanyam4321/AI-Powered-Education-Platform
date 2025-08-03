import React from 'react';

const Recommendations = () => {
  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Learning Recommendations</h1>
      <p className="text-gray-600">AI-powered learning recommendations will be implemented here.</p>
      <p className="text-gray-500 mt-4">This will include:</p>
      <ul className="list-disc list-inside text-gray-500 mt-2 space-y-1">
        <li>Personalized topic suggestions</li>
        <li>Difficulty-based recommendations</li>
        <li>Learning path suggestions</li>
        <li>Performance-based adaptations</li>
      </ul>
    </div>
  );
};

export default Recommendations; 