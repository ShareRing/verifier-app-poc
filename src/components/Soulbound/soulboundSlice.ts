import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, AppThunk, RootState } from '../../store';
import { assert, blobToBase64 } from '../../utils';

export interface Token {
  address: string;
  name?: string;
  symbol?: string;
  description?: string;
  uri?: string;
  uriHash?: string;
  // other information TBD
  // a token is qualified when the connected address has one of its tokens
  qualified: {
    [prop: string]: string;
  };
  contractInfo?: {
    label: string;
    codeId: string;
    admin: string;
    creator: string;
  };
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  image?: string;
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
      .addCase(fetchTokenMetadata.pending, (state, action) => {})
      .addCase(fetchTokenMetadata.fulfilled, (state, action) => {
        state.synced = false;
        const index = state.tokens.findIndex((t) => t.address === action.payload.address);
        state.tokens[index] = { ...action.payload };
      })
      .addCase(fetchTokenMetadata.rejected, (state, action) => {})
      .addCase(addToken.pending, (state, action) => {})
      .addCase(addToken.fulfilled, (state, action) => {
        state.synced = false;
        state.tokens.push(action.payload);
      })
      .addCase(addToken.rejected, (state, action) => {})
      .addCase(verifyToken.pending, (state, action) => {})
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.synced = false;
        const index = state.tokens.findIndex((t) => t.address === action.payload.address);
        state.tokens[index] = { ...action.payload };
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

export const fetchTokenMetadata = createAsyncThunk<
  Token,
  Token,
  {
    state: RootState;
    dispatch: AppDispatch;
    rejectValue: any;
    serializedErrorType: Error | string;
  }
>('soulbound/fetchTokenMetadata', async (token, { getState, rejectWithValue }) => {
  // const { client } = getState().ipfs;
  try {
    // // get token metadata from uri
    // const chunks = [];
    // only ipfs:// at the moment
    const path = token.uri?.split('://').pop();
    assert(path);
    const metadata = await fetch(`https://sharering.mypinata.cloud/ipfs/${path}`).then((res) =>
      res.json()
    );
    if (metadata) {
      // let imageData = '';
      // if (metadata.image) {
      //   const imagePath = metadata.image.split('://').pop();
      //   imageData = await fetch(`https://sharering.mypinata.cloud/ipfs/${imagePath}`)
      //     .then((res) => res.blob())
      //     .then((blob) => blobToBase64(blob))
      //     .then((base64) => {
      //       if (base64 === null) {
      //         return '';
      //       }
      //       if (typeof base64 === 'string') {
      //         return base64;
      //       }
      //       return Buffer.from(base64).toString('base64');
      //     });
      // }
      return {
        ...token,
        description: metadata?.description,
        metadata
        // image: !!imageData ? imageData : undefined
      };
    }
    return token;
    // for await (const chunk of client.cat(path, { timeout: 360000 })) {
    //   chunks.push(chunk);
    // }
    // let metadata: any = {};
    // if (chunks.length) {
    //   metadata = JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}');
    //   console.log(metadata);
    // }
  } catch (err) {
    return rejectWithValue(err?.toString() || JSON.stringify(err));
  }
});

export const addToken = createAsyncThunk<
  Token,
  string,
  {
    state: RootState;
    dispatch: AppDispatch;
    rejectValue: any;
    serializedErrorType: Error | string;
  }
>('soulbound/addToken', async (address, { getState, rejectWithValue }) => {
  const { tokens } = getState().soulbound;
  const { client, chainId } = getState().shareledger;
  if (tokens.find((t) => t.address === address)) {
    return rejectWithValue('Token address exists.');
  }

  try {
    const contractInfo = await client.wasm.contractInfo(address);
    if (!contractInfo) {
      return rejectWithValue(`Contract address not found on network ${chainId}`);
    }

    const { token_uri } = await client.wasm.smartContractState(address, { get_token_uri: {} });
    // shareledger16s0dq5llcxlafw80pph6kcky3mxjkv49q8qu5syw5l8kw567s4qqv3kzr3
    // shareledger1g5qk7649262j0dedq57gmcu5x3n23y50qy70x3yhwpa4w0w50q3sntygkq
    // shareledger1ygrugz3vqffclrlazm36sjcukwheqtk7pap8eydpxpn5hsxhjufq2v9507
    // shareledger1zryt0eameks779et8npp5h3vwam6sqceevf2nzyf8m7p4k25pa4qyshs6s
    // shareledger1f6dk5csplyvyqvk7uvtsf8yll82lxzmquzctw7wvwajn2a7emmeq4cghem
    const token: Token = {
      address,
      name: contractInfo.contractInfo?.label,
      contractInfo: contractInfo.contractInfo
        ? {
            codeId: contractInfo.contractInfo.codeId.toString(),
            label: contractInfo.contractInfo.label,
            admin: contractInfo.contractInfo.admin,
            creator: contractInfo.contractInfo.creator
          }
        : undefined,
      //symbol: 'Test',
      uri: token_uri,
      qualified: {}
    };
    return token;
  } catch (err) {
    return rejectWithValue(err?.toString() || JSON.stringify(err));
  }
});

export const verifyToken = createAsyncThunk<
  Token,
  { address: string; token: Token },
  {
    state: RootState;
    dispatch: AppDispatch;
    rejectValue: any;
    serializedErrorType: Error | string;
  }
>('soulbound/verifyToken', async ({ address, token }, { getState, rejectWithValue }) => {
  const { client } = getState().shareledger;
  const qualified = { ...token.qualified };
  try {
    const res = await client.wasm.smartContractState(token.address, {
      get_soul_bound_token: { soul: address }
    });
    if (res) {
      qualified[address] = res.token_id;
    } else {
      delete qualified[address];
    }
  } catch (err) {
    //return rejectWithValue(err?.toString() || JSON.stringify(err));
    if ((err?.toString() || JSON.stringify(err)).indexOf('not found')) {
      delete qualified[address];
    }
  }
  return {
    ...token,
    qualified: {
      ...qualified
    }
  };
});

export default soulboundSlice.reducer;
