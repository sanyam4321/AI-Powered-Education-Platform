import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { gsap } from 'gsap';

const LoadingSpinner = () => {
  const spinnerRef = useRef(null);
  const { loading, creating, submitting } = useSelector((state) => ({
    loading: state.topics.loading || state.progress.loading,
    creating: state.topics.creating,
    submitting: state.progress.submitting,
  }));

  const isLoading = loading || creating || submitting;

  useEffect(() => {
    if (isLoading && spinnerRef.current) {
      gsap.fromTo(spinnerRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={spinnerRef}
        className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4"
      >
        <div className="loading-spinner"></div>
        <p className="text-gray-600 font-medium">
          {creating ? 'Creating your learning content...' : 
           submitting ? 'Submitting quiz...' : 
           'Loading...'}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 