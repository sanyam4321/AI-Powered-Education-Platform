import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { topicAPI } from '../../utils/api';

// Async thunks
export const createTopic = createAsyncThunk(
  'topics/createTopic',
  async (topicData, { rejectWithValue }) => {
    try {
      const response = await topicAPI.createTopic(topicData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create topic');
    }
  }
);

export const fetchUserTopics = createAsyncThunk(
  'topics/fetchUserTopics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await topicAPI.getUserTopics();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch topics');
    }
  }
);

export const fetchTopic = createAsyncThunk(
  'topics/fetchTopic',
  async (topicId, { rejectWithValue }) => {
    try {
      const response = await topicAPI.getTopic(topicId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch topic');
    }
  }
);

const initialState = {
  topics: [],
  currentTopic: null,
  loading: false,
  creating: false,
  error: null,
};

const topicSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTopic: (state) => {
      state.currentTopic = null;
    },
    updateTopicProgress: (state, action) => {
      const { topicId, progress } = action.payload;
      const topic = state.topics.find(t => t.id === topicId);
      if (topic) {
        topic.progress = progress;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Topic
      .addCase(createTopic.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.creating = false;
        state.topics.unshift(action.payload.topic);
        state.currentTopic = action.payload.topic;
      })
      .addCase(createTopic.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      // Fetch User Topics
      .addCase(fetchUserTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload.topics;
      })
      .addCase(fetchUserTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Topic
      .addCase(fetchTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTopic = action.payload.topic;
      })
      .addCase(fetchTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentTopic, updateTopicProgress } = topicSlice.actions;
export default topicSlice.reducer; 