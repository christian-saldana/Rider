import React, { useState } from 'react';
import {
  Button, Container, Form, Navbar
} from 'react-bootstrap'; 
import { LinkContainer } from 'react-router-bootstrap';
import { Link, Route, Switch } from 'react-router-dom';

import Signup from './components/Signup';
import Login from './components/Login';

import './App.css';

function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);

  const logIn = () => setLoggedIn(true);

  return (
    <div>
      <Navbar bg='light' expand='lg' variant='light'>
        <LinkContainer to='/'>
          <Navbar.Brand className='logo'>Taxi</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle />
        <Navbar.Collapse>
          {
            isLoggedIn &&
            <Form inline className='ml-auto'>
              <Button type='button'>Log out</Button>
            </Form>
          }
        </Navbar.Collapse>
      </Navbar>
      <Container className='pt-3'>
        <Switch>
          <Route exact path='/' render={() => (
            <div className='middle-center'>
              <h1 className='landing logo'>Taxi</h1>
              <Link className='btn btn-primary' to='/sign-up'>Sign up</Link>
              <Link className='btn btn-primary' to='/log-in'>Log in</Link>
            </div>
          )} />
          <Route path='/sign-up' component={Signup} />
          {/* changed */}
          <Route path='/log-in' render={() => (
            <Login logIn={logIn} />
          )} />
        </Switch>
      </Container>
    </div>
  );
}

export default App;