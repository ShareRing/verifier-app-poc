import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { create, IPFS, Options } from 'ipfs-core';
import { AppDispatch, RootState } from '../../store';

// Define a type for the slice state
interface IpfsState {
  client: IPFS;
  options?: Options;
}

// Define the initial state using that type
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const initialState: IpfsState = {
  client: undefined!,
  options: { offline: true }
};
/* eslint-enable @typescript-eslint/no-non-null-assertion */

export const ipfsSlice = createSlice({
  name: 'ipfs',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(connect.fulfilled, (state, action) => {
      state.client = action.payload;
    });
  }
});

export const connect = createAsyncThunk<
  IPFS,
  void,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('ipfs/connect', async (_, { getState, rejectWithValue }) => {
  try {
    const { options } = getState().ipfs;
    return create(options);
  } catch (err) {
    return rejectWithValue(JSON.stringify(err));
  }
});

export const disconnect = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('ipfs/disconnect', async (_, { getState, rejectWithValue }) => {
  const { client } = getState().ipfs;
  client.stop().catch((err) => rejectWithValue(JSON.stringify(err)));
});

export default ipfsSlice.reducer;
