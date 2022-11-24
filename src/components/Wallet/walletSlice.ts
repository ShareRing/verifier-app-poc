import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../../store';

// Define a type for the slice state
interface WalletState {
  isWalletInstalled: boolean;
  isConnected: boolean;
  address?: string;
  readonly chainId: string;
  readonly rpcEndpoint: string;
  readonly restEndpoint: string;
  readonly explorerEndpoint: string;
}

// Define the initial state using that type
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const initialState: WalletState = {
  chainId: process.env.REACT_APP_CHAIN_ID!,
  rpcEndpoint: process.env.REACT_APP_RPC_ENDPOINT!,
  restEndpoint: process.env.REACT_APP_REST_ENDPOINT!,
  explorerEndpoint: process.env.REACT_APP_EXPLORER_ENDPOINT!,
  isWalletInstalled: false,
  isConnected: false
};
/* eslint-enable @typescript-eslint/no-non-null-assertion */

export const walletSlice = createSlice({
  name: 'wallet',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setWalletInstalled: (state, action: PayloadAction<boolean>) => {
      state.isWalletInstalled = action.payload;
    },
    setWallet: (state, action: PayloadAction<{ isConnected: boolean; address?: string }>) => {
      state.isConnected = action.payload.isConnected;
      state.address = action.payload.address;
    }
  }
});

export const { setWalletInstalled, setWallet } = walletSlice.actions;

export const loadWallet = (): AppThunk => (dispatch, getState) => {
  const { isWalletInstalled, isConnected, address }: WalletState = JSON.parse(
    window.localStorage.getItem('wallet') ?? '{}'
  );
  isWalletInstalled && dispatch(setWalletInstalled(isWalletInstalled));
  isConnected && dispatch(setWallet({ isConnected, address }));
};

export const persistWallet = (): AppThunk => (dispatch, getState) => {
  window.localStorage.setItem('wallet', JSON.stringify(getState().wallet));
};

export default walletSlice.reducer;
