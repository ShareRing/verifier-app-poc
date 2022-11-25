import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ShareledgerSigningClient } from 'shr-client-ts';
import { AppDispatch, RootState } from '../../store';

// Define a type for the slice state
interface ShareledgerState {
  client?: ShareledgerSigningClient;
  readonly chainId: string;
  readonly rpcEndpoint: string;
  readonly restEndpoint: string;
  readonly explorerEndpoint: string;
}

// Define the initial state using that type
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const initialState: ShareledgerState = {
  client: undefined,
  chainId: process.env.REACT_APP_CHAIN_ID!,
  rpcEndpoint: process.env.REACT_APP_RPC_ENDPOINT!,
  restEndpoint: process.env.REACT_APP_REST_ENDPOINT!,
  explorerEndpoint: process.env.REACT_APP_EXPLORER_ENDPOINT!
};
/* eslint-enable @typescript-eslint/no-non-null-assertion */

export const shareledgerSlice = createSlice({
  name: 'shareledger',
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
  ShareledgerSigningClient,
  void,
  { state: RootState; dispatch: AppDispatch }
>('shareledger/connect', async () => {
  const rpcEndpoint =
    process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_RPC_ENDPOINT!
      : `http${process.env.HTTPS ? 's' : ''}://${process.env.HOST || 'localhost'}:${
          process.env.PORT || '3000'
        }/rpc/`;
  return ShareledgerSigningClient.connect(rpcEndpoint);
});

export default shareledgerSlice.reducer;
