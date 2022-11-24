import { FormEvent, useEffect, useState } from 'react';
import { Button, Card, Form, Modal } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { addToken, removeToken, persistTokens, Token, loadTokens } from './soulboundSlice';
import * as Icon from 'react-bootstrap-icons';
import ButtonTooltip from '../ButtonTooltip';

function SoulboundItem({ token }: { token: Token }) {
  const dispatch = useAppDispatch();
  const [removeState, setRemoveState] = useState(0);

  const handleRemove = (address: string) => {
    if (removeState > 0) {
      dispatch(removeToken(address));
      setRemoveState(0);
      return;
    }
    setRemoveState(removeState + 1);
  };

  return (
    <Card border="success" className="mb-3">
      <Card.Body>
        <Card.Title>Special title treatment</Card.Title>
        <Card.Text>
          With supporting text below as a natural lead-in to additional content.
        </Card.Text>
      </Card.Body>
      <Card.Footer>
        <ButtonTooltip variant="primary" size="sm" tooltip="Verify">
          <Icon.PatchCheck />
        </ButtonTooltip>{' '}
        <ButtonTooltip variant="info" size="sm" tooltip="Fetch information">
          <Icon.Search />
        </ButtonTooltip>{' '}
        <ButtonTooltip
          variant="danger"
          size="sm"
          tooltip="Remove"
          onClick={() => handleRemove(token.address)}
        >
          {removeState > 0 ? (
            <>
              <Icon.Trash3Fill /> Confirm?
            </>
          ) : (
            <Icon.Trash3 />
          )}
        </ButtonTooltip>
      </Card.Footer>
    </Card>
  );
}

function Soulbound() {
  const dispatch = useAppDispatch();
  const { isConnected } = useAppSelector((state) => state.wallet);
  const { tokens, synced } = useAppSelector((state) => state.soulbound);

  const [modalShow, setModalShow] = useState(false);
  const [form, setForm] = useState<{ [prop: string]: any }>({ address: '' }); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [errors, setErrors] = useState<{ [prop: string]: string | null }>({});

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

  const handleModalClose = () => {
    setModalShow(false);
    setField('address', '');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
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
      .catch((err) => {
        errs.address = err;
        setErrors(errs);
      });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setField = (field: string, value: any) => {
    setForm({
      ...form,
      [field]: value
    });
    if (!!errors[field]) {
      setErrors({
        ...errors,
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

  if (!isConnected) {
    return <></>;
  }

  return (
    <>
      <h3>Soulbounds</h3>
      <p>
        <Button variant="primary" onClick={() => setModalShow(true)}>
          Add token
        </Button>
      </p>
      {tokens.map((token) => (
        <SoulboundItem key={token.address} token={token} />
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
                isInvalid={!!errors.address}
              />
              <div className="invalid-feedback">{errors.address}</div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default Soulbound;
