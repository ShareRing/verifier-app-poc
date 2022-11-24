import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import './App.scss';
import { ReactComponent as Logoi } from './assets/images/logoi.svg';
import Footer from './components/Footer';
import Soulbound from './components/Soulbound';
import Wallet from './components/Wallet';

function App() {
  const [hasError, setHasError] = useState(true);

  return (
    <Container className="p-4 min-vh-100 d-flex flex-column justify-content-between">
      <Row>
        <Col>
          <Row className="py-3 mb-3 bg-light round-3">
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
