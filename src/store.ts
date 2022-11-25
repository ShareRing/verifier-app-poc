import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import walletReducer from './components/Wallet/walletSlice';
import soulboundReducer from './components/Soulbound/soulboundSlice';
import shareledgerReducer from './components/Shareledger/shareledgerSlice';

const store = configureStore({
  reducer: {
    wallet: walletReducer,
    soulbound: soulboundReducer,
    shareledger: shareledgerReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['shareledger/connect/fulfilled'],
        ignoredPaths: ['shareledger.client']
      }
    })
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
