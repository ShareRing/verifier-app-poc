import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { assert } from '../../utils';
import { setWalletInstalled, setWallet, persistWallet } from './walletSlice';

function Wallet() {
  const {
    isWalletInstalled,
    isConnected,
    chainId,
    rpcEndpoint,
    restEndpoint,
    explorerEndpoint,
    address
  } = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();

  const [show, setShow] = useState(false);

  const handleClose = () => {
    // dispatch(setWalletInstalled(!!window.keplr));
    // setShow(!isWalletInstalled);
    window.location.reload();
  };

  const suggestChain = async () => {
    assert(window.keplr);
    await window.keplr.experimentalSuggestChain({
      chainId: chainId,
      chainName: chainId,
      rpc: rpcEndpoint,
      rest: restEndpoint,
      bip44: {
        coinType: 118
      },
      bech32Config: {
        bech32PrefixAccAddr: 'shareledger',
        bech32PrefixAccPub: 'shareledgerpub',
        bech32PrefixValAddr: 'shareledgervaloper',
        bech32PrefixValPub: 'shareledgervaloperpub',
        bech32PrefixConsAddr: 'shareledgervalcons',
        bech32PrefixConsPub: 'shareledgervalconspub'
      },
      currencies: [
        {
          coinDenom: 'SHR',
          coinMinimalDenom: 'nshr',
          coinDecimals: 9,
          coinGeckoId: 'sharetoken'
        }
      ],
      feeCurrencies: [
        {
          coinDenom: 'SHR',
          coinMinimalDenom: 'nshr',
          coinDecimals: 9,
          coinGeckoId: 'sharetoken',
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04
          }
        }
      ],
      stakeCurrency: {
        coinDenom: 'SHR',
        coinMinimalDenom: 'nshr',
        coinDecimals: 9,
        coinGeckoId: 'sharetoken'
      }
    });
  };

  const handleKeystoreChange = () => {
    dispatch(setWallet({ isConnected: false, address: undefined }));
    if (!window.keplr) {
      dispatch(setWalletInstalled(false));
    }
  };

  useEffect(() => {
    //dispatch(loadWallet());
    dispatch(setWalletInstalled(!!window.keplr));
    return () => {
      window.removeEventListener('keplr_keystorechange', handleKeystoreChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setShow(!isWalletInstalled);
    if (isWalletInstalled) {
      suggestChain();
      window.addEventListener('keplr_keystorechange', handleKeystoreChange);
    }
  }, [isWalletInstalled]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnectWallet = async () => {
    assert(window.keplr);
    await window.keplr.enable(chainId).catch((err) => {
      if (err?.message?.indexOf('There is no chain info') >= 0) {
        return suggestChain();
      }
      throw err;
    });
    const offlineSigner = window.keplr.getOfflineSigner(chainId);
    const [account] = await offlineSigner.getAccounts();
    if (account && account.address) {
      dispatch(setWallet({ isConnected: true, address: account.address }));
    }
  };

  useEffect(() => {
    dispatch(persistWallet());
  }, [address, isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDisconnectWallet = () => {
    dispatch(setWallet({ isConnected: false, address: undefined }));
  };

  return (
    <>
      {!isConnected && (
        <Button variant="primary" onClick={handleConnectWallet}>
          Connect wallet
        </Button>
      )}
      {isConnected && (
        <>
          <Button variant="danger" onClick={handleDisconnectWallet}>
            Disconnect
          </Button>
          <Button
            variant="link"
            className="text-decoration-none"
            href={`${explorerEndpoint}/accounts/${address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Connected to: {address}
          </Button>
        </>
      )}
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Wallet extension required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This dApp requires installing{' '}
          <a href="https://www.keplr.app" target="_blank" rel="noopener noreferrer">
            Keplr Wallet
          </a>{' '}
          to work. Please install and continue.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            I have installed and enabled Keplr
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Wallet;
