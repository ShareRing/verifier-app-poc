// import { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import './App.scss';
import Footer from './components/Footer';
// import { connect } from './components/Ipfs/ipfsSlice';
import Soulbound from './components/Soulbound';
import Wallet from './components/Wallet';
// import { useAppDispatch } from './hooks';

function App() {
  // const dispatch = useAppDispatch();
  // useEffect(() => {
  //   dispatch(connect());
  // }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Container className="p-4 min-vh-100 d-flex flex-column justify-content-between">
      <Row>
        <Col>
          <Row className="py-3 mb-3">
            <Col>
              <Wallet />
            </Col>
          </Row>
          <Row>
            <Col>
              <Soulbound />
            </Col>
          </Row>
        </Col>
      </Row>
      <Footer />
    </Container>
  );
}

export default App;
