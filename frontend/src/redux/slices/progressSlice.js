import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { progressAPI, quizAPI } from '../../utils/api';

// Async thunks
export const submitQuiz = createAsyncThunk(
  'progress/submitQuiz',
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await quizAPI.submitQuiz(quizData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to submit quiz');
    }
  }
);

export const fetchUserProgress = createAsyncThunk(
  'progress/fetchUserProgress',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await progressAPI.getUserProgress(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch progress');
    }
  }
);

export const updateProgress = createAsyncThunk(
  'progress/updateProgress',
  async (progressData, { rejectWithValue }) => {
    try {
      const response = await progressAPI.updateProgress(progressData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update progress');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'progress/fetchRecommendations',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await progressAPI.getRecommendations(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch recommendations');
    }
  }
);

const initialState = {
  progress: [],
  recommendations: [],
  quizResults: null,
  loading: false,
  submitting: false,
  error: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearQuizResults: (state) => {
      state.quizResults = null;
    },
    setQuizResults: (state, action) => {
      state.quizResults = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Quiz
      .addCase(submitQuiz.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.submitting = false;
        state.quizResults = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      // Fetch User Progress
      .addCase(fetchUserProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.progress = action.payload.progress;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Progress
      .addCase(updateProgress.fulfilled, (state, action) => {
        // Update progress in the list
        const index = state.progress.findIndex(p => p.topic_id === action.payload.topic_id);
        if (index !== -1) {
          state.progress[index] = { ...state.progress[index], ...action.payload };
        }
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch Recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload.recommendations;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearQuizResults, setQuizResults } = progressSlice.actions;
export default progressSlice.reducer; 