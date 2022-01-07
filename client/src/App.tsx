import React, { useState } from 'react';
import {
  Button, Container, Form, Navbar, Nav
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import axios from 'axios';
import { Ok, Err, Result } from 'ts-results';

import { isDriver, isRider } from './services/AuthService';
import SignUp from './components/SignUp';
import LogIn from './components/LogIn';
import Driver from './components/Driver';
import Rider from './components/Rider';

type Errors = "CANNOT_AUTHORIZE";

function App() {
  const [isLoggedIn, setLoggedIn] = useState(() => {
    return window.localStorage.getItem('taxi.auth') !== null;
  });

  const logIn = async (username: string, password: string): Promise<Result<object, Errors>> => {
    const url = `${process.env.REACT_APP_BASE_URL}/api/log_in/`;
    try {
      const response = await axios.post(url, { username, password });
      window.localStorage.setItem(
        'taxi.auth', JSON.stringify(response.data)
      );
      setLoggedIn(true);
      return Ok({ response });
    }
    catch (error) {
      console.error(error);
      return Err("CANNOT_AUTHORIZE");
    }
  };

  const logOut = () => {
    window.localStorage.removeItem('taxi.auth');
    setLoggedIn(false);
  };

  return (
    <div className="login-content">
      <Navbar bg='light' expand='lg' variant='light'>
        <LinkContainer to='/'>
          <Navbar.Brand >Taxi</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle />
        <Navbar.Collapse>
          {
            isRider() && (
              <Nav className='mr-auto'>
                <LinkContainer to='/rider/request'>
                  <Nav.Link>Request a trip</Nav.Link>
                </LinkContainer>
              </Nav>
            )
          }
          {
            isLoggedIn && (
              <Form inline className='ml-auto'>
                <Button
                  type='button'
                  onClick={() => logOut()}
                >Log out</Button>
              </Form>
            )
          }
        </Navbar.Collapse>
      </Navbar>
      <div className="d-flex max-width flex-column justify-content-center align-items-center px-2">
        <Switch>
          <Route exact path='/' render={() => (
            <div className='middle-center'>
              <h1 className='landing logo'>Taxi</h1>
              {
                !isLoggedIn && (
                  <>
                    <Link
                      id='signUp'
                      className='btn btn-primary'
                      to='/sign-up'
                    >Sign up</Link>
                    <Link
                      id='logIn'
                      className='btn btn-primary'
                      to='/log-in'
                    >Log in</Link>
                  </>
                )
              }
              {
                isRider() && (
                  <Link
                    className='btn btn-primary'
                    to='/rider'
                  >Dashboard</Link>
                )
              }
              {
                isDriver() && (
                  <Link
                    className='btn btn-primary'
                    to='/driver'
                  >Dashboard</Link>
                )
              }
            </div>
          )} />
          <Route path='/sign-up' render={() => (
            isLoggedIn ? (
              <Redirect to='/' />
            ) : (
              <SignUp />
            )
          )} />
          <Route path='/log-in' render={() => (
            isLoggedIn ? (
              <Redirect to='/' />
            ) : (
              <LogIn logIn={logIn} />
            )
          )} />
          <Route path='/driver' render={() => (
            <Driver />
          )} />
          <Route path='/rider' render={() => (
            <Rider />
          )} />
        </Switch>
      </div>
    </div>
  );
}

export default App;