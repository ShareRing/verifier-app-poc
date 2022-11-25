import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, AppThunk, RootState } from '../../store';
import { assert } from '../../utils';
import type { Account, Coin } from 'shr-client-ts';

// Define a type for the slice state
interface WalletState {
  isWalletInstalled: boolean;
  isConnected: boolean;
  address?: string;
  accountNumber?: number;
  sequence?: number;
  balance?: Coin[];
  synced: boolean;
}

// Define the initial state using that type
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const initialState: WalletState = {
  isWalletInstalled: false,
  isConnected: false,
  synced: true
};
/* eslint-enable @typescript-eslint/no-non-null-assertion */

export const walletSlice = createSlice({
  name: 'wallet',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setSynced: (state, payload: PayloadAction<boolean>) => {
      state.synced = payload.payload;
    },
    setWalletInstalled: (state, action: PayloadAction<boolean>) => {
      state.isWalletInstalled = action.payload;
    },
    setWallet: (state, action: PayloadAction<{ isConnected: boolean; address?: string }>) => {
      state.isConnected = action.payload.isConnected;
      state.address = action.payload.address;
      state.synced = false;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchAccInfo.fulfilled, (state, action) => {
        state.accountNumber = action.payload?.accountNumber;
        state.sequence = action.payload?.sequence;
        state.synced = false;
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
        state.synced = false;
      });
  }
});

export const { setWalletInstalled, setWallet, setSynced } = walletSlice.actions;

export const loadWallet = (): AppThunk => (dispatch, getState) => {
  const { isWalletInstalled, isConnected, address }: WalletState = JSON.parse(
    window.localStorage.getItem('wallet') ?? '{}'
  );
  isWalletInstalled && dispatch(setWalletInstalled(isWalletInstalled));
  isConnected && dispatch(setWallet({ isConnected, address }));
};

export const persistWallet = (): AppThunk => (dispatch, getState) => {
  window.localStorage.setItem('wallet', JSON.stringify(getState().wallet));
  dispatch(setSynced(true));
};

export const fetchAccInfo = createAsyncThunk<
  Account | null,
  void,
  { state: RootState; dispatch: AppDispatch }
>('wallet/fetchAccInfo', async (_, { getState, dispatch }) => {
  const { address } = getState().wallet;
  const { client } = getState().shareledger;
  assert(address);
  assert(client);
  const info = await client.getAccount(address);
  dispatch(fetchBalance());
  return info;
});

export const fetchBalance = createAsyncThunk<Coin[], void, { state: RootState }>(
  'wallet/fetchBalance',
  async (_, { getState }) => {
    const { address } = getState().wallet;
    const { client } = getState().shareledger;
    assert(address);
    assert(client);
    return client.bank.allBalances(address);
  }
);

export default walletSlice.reducer;
