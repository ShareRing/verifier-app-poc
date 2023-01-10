import classNames from 'classnames';
import { FormEvent, SetStateAction, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Modal, Placeholder, Row } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import ButtonTooltip from '../ButtonTooltip';
import {
  addToken,
  fetchTokenMetadata,
  loadTokens,
  persistTokens,
  removeToken,
  Token,
  verifyToken
} from './soulboundSlice';

function SoulboundItem({
  token,
  setAlert
}: {
  token: Token;
  setAlert: React.Dispatch<
    SetStateAction<{ variant: 'danger' | 'warn' | 'info' | 'success'; message: string } | undefined>
  >;
}) {
  const dispatch = useAppDispatch();

  const { address } = useAppSelector((state) => state.wallet);

  const [removeState, setRemoveState] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [localToken, setLocalToken] = useState(token);
  const [isQualified, setIsQualified] = useState('');

  const handleRemove = () => {
    if (removeState > 0) {
      dispatch(removeToken(localToken.address));
      setRemoveState(0);
      return;
    }
    setRemoveState(removeState + 1);
  };

  useEffect(() => {
    if (removeState === 1) {
      setTimeout(() => {
        setRemoveState(0);
      }, 5000);
    }
  }, [removeState]);

  useEffect(() => {
    if (!localToken.metadata) {
      setIsLoading(true);
      dispatch(fetchTokenMetadata(localToken))
        .unwrap()
        .then((value) => setLocalToken(value))
        .then(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
    setIsQualified(localToken.qualified[address]);
  }, []);

  const handleFetchMetadata = () => {
    setIsLoading(true);
    dispatch(fetchTokenMetadata(localToken))
      .unwrap()
      .then((value) => setLocalToken(value))
      .then(() => setIsLoading(false));
  };

  const handleVerifyToken = () => {
    if (!address) {
      return setAlert({ variant: 'danger', message: 'Please connect your wallet first.' });
    }
    setIsVerifying(true);
    dispatch(verifyToken({ address, token: localToken }))
      .unwrap()
      .then((value) => {
        setLocalToken(value);
        setIsQualified(value.qualified[address]);
      })
      .then(() => setIsVerifying(false));
  };

  return (
    <Card className={classNames('mb-3', !!isQualified && 'border-success')}>
      <Card.Body>
        {isLoading && (
          <Placeholder as={Card.Title} animation="glow">
            <Placeholder xs={3} />
          </Placeholder>
        )}
        {!isLoading && <Card.Title>{localToken.name}</Card.Title>}
        {isLoading && (
          <Placeholder as={Card.Text} animation="glow">
            <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
            <Placeholder xs={6} />
          </Placeholder>
        )}
        {!isLoading && (
          <Card.Text as="div">
            <p>{localToken.description ?? localToken.name}</p>
            <h6>Attributes</h6>
            <ul className="list-unstyled">
              {localToken.metadata?.attributes?.map((attr: any) => (
                <li key={attr.trait_type}>
                  {attr.trait_type}: {attr.value}
                </li>
              ))}
            </ul>
          </Card.Text>
        )}
      </Card.Body>
      <Card.Footer className={classNames(!!isQualified && 'bg-success bg-opacity-25 text-white')}>
        <Row>
          <Col>
            <ButtonTooltip
              onClick={() => handleVerifyToken()}
              disabled={isLoading || isVerifying}
              variant="primary"
              size="sm"
              tooltip="Verify"
            >
              {isVerifying ? 'Verifying...' : <Icon.PatchCheck />}
            </ButtonTooltip>{' '}
            <ButtonTooltip
              disabled={isLoading}
              onClick={() => handleFetchMetadata()}
              variant="info"
              size="sm"
              tooltip="Fetch metadata"
            >
              <Icon.Search />
            </ButtonTooltip>{' '}
            <ButtonTooltip
              disabled={isLoading}
              variant="danger"
              size="sm"
              tooltip="Remove"
              onClick={() => handleRemove()}
            >
              {removeState > 0 ? (
                <>
                  <Icon.Trash3Fill /> Confirm?
                </>
              ) : (
                <Icon.Trash3 />
              )}
            </ButtonTooltip>
          </Col>
          <Col className="text-end">
            {!!isQualified && (
              <span className="text-success">Soulbound checked! Token id: {isQualified}</span>
            )}
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
}

function Soulbound() {
  const dispatch = useAppDispatch();
  // const { isConnected } = useAppSelector((state) => state.wallet);
  const { tokens, synced } = useAppSelector((state) => state.soulbound);

  const [modalShow, setModalShow] = useState(false);
  const [form, setForm] = useState<{ [prop: string]: any }>({ address: '' }); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [formErrors, setFormErrors] = useState<{ [prop: string]: string | null }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<
    { variant: 'danger' | 'warn' | 'info' | 'success'; message: string } | undefined
  >();

  // useDeepEffect(() => {
  //   dispatch(persistTokens());
  // }, [tokens]);

  useEffect(() => {
    if (!synced) {
      dispatch(persistTokens());
    }
  }, [synced]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    !tokens.length && dispatch(loadTokens());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect(() => {
  //   if (!isConnected) {
  //     setAlert({ variant: 'danger', message: 'Please connect your wallet first.' });
  //   }
  // }, [isConnected]);

  const handleModalClose = () => {
    setModalShow(false);
    setField('address', '');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const errs = validate();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      setIsLoading(false);
      return false;
    }
    // add
    // TODO validate address
    dispatch(addToken(form.address))
      .unwrap()
      .then(() => {
        setModalShow(false);
        setField('address', '');
        dispatch(persistTokens());
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => {
        errs.address = err;
        setFormErrors(errs);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setField = (field: string, value: any) => {
    setForm({
      ...form,
      [field]: value
    });
    if (!!formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null
      });
    }
  };

  const validate = () => {
    const { address } = form;
    const errs: { [prop: string]: string | null } = {};
    if (!address || address === '') {
      errs.address = 'Token address cannot be blank!';
    }
    return errs;
  };

  // if (!isConnected) {
  //   return <></>;
  // }

  return (
    <>
      {!!alert && (
        <Alert variant={alert.variant} onClose={() => setAlert(undefined)} dismissible>
          {alert.message}
        </Alert>
      )}
      <h3>Soulbounds</h3>
      <p>
        <Button variant="primary" onClick={() => setModalShow(true)}>
          Add token
        </Button>
      </p>
      {tokens.map((token) => (
        <SoulboundItem key={token.address} token={token} setAlert={setAlert} />
      ))}
      <Modal show={modalShow} onHide={handleModalClose} centered>
        <Form onSubmit={handleSubmit} noValidate className="needs-validation">
          <Modal.Header closeButton>
            <Modal.Title>Add new token</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* {!!Object.values(errors).length && (
              <Alert variant="danger">
                {Object.values(errors).map((err, idx) => (
                  <p key={idx}>{err}</p>
                ))}
              </Alert>
            )} */}
            <Form.Group className="has-validation">
              <Form.Label>Token address</Form.Label>
              <Form.Control
                type="text"
                placeholder="shareledger..."
                autoFocus
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                isInvalid={!!formErrors.address}
              />
              <div className="invalid-feedback">{formErrors.address}</div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit" variant="primary">
              {isLoading ? 'Please wait...' : 'Add'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default Soulbound;
