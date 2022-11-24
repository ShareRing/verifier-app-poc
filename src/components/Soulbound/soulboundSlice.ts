import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, AppThunk, RootState } from '../../store';

export interface Token {
  address: string;
  name: string;
  symbol: string;
  description?: string;
  uri?: string;
  uriHash?: string;
  // other information TBD
  // a token is qualified when the connected address has one of its tokens
  qualified: string[];
}

// Define a type for the slice state
interface SoulboundState {
  tokens: Token[];
  synced: boolean;
}

// Define the initial state using that type
const initialState: SoulboundState = {
  tokens: [],
  synced: true
};

export const soulboundSlice = createSlice({
  name: 'soulbound',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setSynced: (state, payload: PayloadAction<boolean>) => {
      state.synced = payload.payload;
    },
    setTokens: (state, payload: PayloadAction<Token[]>) => {
      state.tokens = [...payload.payload];
    },
    removeToken: (state, payload: PayloadAction<string | Token>) => {
      const addr = typeof payload.payload === 'string' ? payload.payload : payload.payload.address;
      state.tokens = state.tokens.filter((t) => t.address !== addr);
      state.synced = false;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTokenInfo.pending, (state, action) => {})
      .addCase(fetchTokenInfo.fulfilled, (state, action) => {
        state.synced = false;
      })
      .addCase(fetchTokenInfo.rejected, (state, action) => {})
      .addCase(addToken.pending, (state, action) => {})
      .addCase(addToken.fulfilled, (state, action) => {
        state.synced = false;
        state.tokens.push(action.payload);
      })
      .addCase(addToken.rejected, (state, action) => {})
      .addCase(verifyToken.pending, (state, action) => {})
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.synced = false;
      })
      .addCase(verifyToken.rejected, (state, action) => {});
  }
});

export const { setSynced, setTokens, removeToken } = soulboundSlice.actions;

export const loadTokens = (): AppThunk => (dispatch, getState) => {
  const { tokens }: SoulboundState = JSON.parse(window.localStorage.getItem('soulbound') ?? '{}');
  tokens && tokens.length && dispatch(setTokens(tokens));
};

export const persistTokens = (): AppThunk => (dispatch, getState) => {
  window.localStorage.setItem('soulbound', JSON.stringify(getState().soulbound));
  dispatch(setSynced(true));
};

export const fetchTokenInfo = createAsyncThunk<Token, string>(
  'soulbound/fetchTokenInfo',
  async () => {
    return {} as Token;
  }
);

export const addToken = createAsyncThunk<
  Token,
  string,
  { state: RootState; dispatch: AppDispatch; rejectValue: string; serializedErrorType: string }
>('soulbound/addToken', async (address, { getState, rejectWithValue }) => {
  const tokens = getState().soulbound.tokens;
  if (tokens.find((t) => t.address === address)) {
    return rejectWithValue('Token address exists.');
  }
  const token: Token = {
    address,
    name: 'Test',
    symbol: 'Test',
    qualified: []
  };
  return token;
});

export const verifyToken = createAsyncThunk<Token, string>(
  'soulbound/verifyToken',
  async (address) => {
    return {} as Token;
  }
);

export default soulboundSlice.reducer;
