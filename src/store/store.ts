import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import mockDataReducer from './mockDataSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    mockData: mockDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;