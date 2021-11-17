import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useContext } from 'react';
import { Col, Nav, Navbar, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import {
  BrowserRouter as Router,
  HashRouter,
  NavLink, Route, Switch
} from "react-router-dom";
import './App.css';
import { Details } from './components/Details';
import { Home } from './components/Home';
import { Operator } from './components/Operator';
import { Symfoni, SymfoniContext } from "./hardhat/SymfoniContext";
import './Logo.scss';
import './Operator.css';

function App() {

  function OperatorPage() {
    return(
      <Symfoni autoInit={true}  loadingComponent={<b style={{color: '#77bb44'}}>Connect/Log in to your Ethereum wallet to view tokens.</b>}>
      <Operator></Operator>
      </Symfoni>
    );
  }

  function DetailsPage() {
    return ( 
      <Details></Details>
  );
  }

  const HomePage =()=> {
    return (
      <Container>

<Row>
<div style={{marginTop:'7em'}}>
            <h1>Dark Bits </h1>
            <p style={{color: 'white'}}>
                  Emergent elements and organisms that can be used to augment your worlds in the metaverse.<br></br>
                  100,000 mint cap. 2 Matic Token mint fee + gas fee. Mint and create! <br></br> <br></br>
                  <b>50%</b> of fees go toward <a style={{textDecoration: 'none'}} href="#/whatAreDarkBits#rewards"><b>Mint Rewards</b></a> which are accessible to participants.
            </p>
            <Symfoni autoInit={true} loadingComponent={<b style={{color: '#77bb44'}}>Connect/Log in to your Ethereum wallet to mint/claim rewards.</b>}> 
            <Home></Home>
            </Symfoni> 
          <h3> ---------- </h3>
          <Button variant="outline-primary" size="lg" onClick={(e) =>  window.open ('https://polygonscan.com/address/0x3b2dd685b96639a9995c8bcbfe6fa4ed5e62ed2d#writeContract', "_blank")}>Contract</Button>
          <div style={{marginBottom: '1.5em'}}></div>
        </div>

</Row>
<Row>
  <Col>
        <div style={{display: 'flex', justifyContent: 'center'}}>
        <svg xmlns="http://www.w3.org/2000/svg" style={{color: '#77bb44'}} width="36" height="36" fill="currentColor" className="bi bi-discord" viewBox="0 0 16 16">
          <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/>
          </svg>
         <p style={{color: 'white', margin: '0.5em'}}> DM @ domo#5370 </p> 
        </div>
  </Col>
  <Col>
        <div style={{display: 'flex', justifyContent: 'center'}}>
        <svg xmlns="http://www.w3.org/2000/svg" style={{color: '#77bb44'}} width="36" height="36" fill="currentColor" className="bi bi-card-checklist" viewBox="0 0 16 16">
          <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
          <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
          </svg>
          <p style={{color: 'white', margin: '0.5em', textDecoration: 'none'}}>
          <a 
          style={{color: 'white', textDecoration: 'none'}}
          href="https://vigorous-vegetarian-12f.notion.site/636c57d084804414b99da0e23a86871a?v=f246acc5c7154e929c89c709b417d096"  target="_blank" rel="noopener noreferrer">
          Choose what happens next
         </a>
         </p> 
        </div>
  </Col>
</Row>
</Container>
    );
  
  }

  return (
    <div className="App">
<HashRouter
>          <div>
          <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Container>
            <Navbar.Brand href="/">Dark Bits</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto">
              </Nav>
                <NavLink className="custom-nav" activeStyle={{ color:'#77bb44' }} to="/viewTokens">View Tokens</NavLink>
                <NavLink className="custom-nav" activeStyle={{ color:'#77bb44' }} to="/whatAreDarkBits">What are Dark Bits ?</NavLink>
            </Navbar.Collapse>
            </Container>
          </Navbar>
          <Switch>
          <Route path="/viewTokens">
            <OperatorPage />
          </Route>
          <Route path="/whatAreDarkBits">
            <DetailsPage />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>
          </div>
          </HashRouter>
    </div>
  );
}

export default App;
