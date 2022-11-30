/// <reference types="react-scripts" />
import { Window as KeplrWindow } from '@keplr-wallet/types';
import type { IPFS } from 'ipfs-core';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {}
  interface Window {
    ipfs?: IPFS;
  }
}
