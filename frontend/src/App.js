import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { gsap } from 'gsap';
import { toast } from 'react-toastify';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TopicDetail from './pages/TopicDetail';
import Quiz from './pages/Quiz';
import Progress from './pages/Progress';
import Recommendations from './pages/Recommendations';

// Redux actions
import { clearError } from './redux/slices/authSlice';
import { clearError as clearTopicError } from './redux/slices/topicSlice';
import { clearError as clearProgressError } from './redux/slices/progressSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, error: authError } = useSelector((state) => state.auth);
  const { error: topicError } = useSelector((state) => state.topics);
  const { error: progressError } = useSelector((state) => state.progress);
  const { sidebarOpen } = useSelector((state) => state.ui);

  // GSAP animations
  useEffect(() => {
    gsap.fromTo('.app-container', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  // Error handling with toast notifications
  useEffect(() => {
    if (authError) {
      toast.error(authError);
      dispatch(clearError());
    }
    if (topicError) {
      toast.error(topicError);
      dispatch(clearTopicError());
    }
    if (progressError) {
      toast.error(progressError);
      dispatch(clearProgressError());
    }
  }, [authError, topicError, progressError, dispatch]);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <div className="app-container min-h-screen bg-gray-50">
      <LoadingSpinner />
      
      {isAuthenticated && <Navbar />}
      
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        
        <main className={`flex-1 transition-all duration-300 ${
          isAuthenticated && sidebarOpen ? 'ml-64' : 'ml-0'
        }`}>
          <div className="p-6">
            <Routes>
              {/* Public routes */}
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
                } 
              />
              <Route 
                path="/register" 
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
                } 
              />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/topic/:id" 
                element={
                  <ProtectedRoute>
                    <TopicDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz/:topicId" 
                element={
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/progress" 
                element={
                  <ProtectedRoute>
                    <Progress />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recommendations" 
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirect */}
              <Route 
                path="/" 
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App; 