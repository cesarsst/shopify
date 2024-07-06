import React from 'react';
import { Route } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Overlay } from 'react-bootstrap';

import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import Tooltip from 'react-bootstrap/Tooltip';
import SearchBox from './SearchBox';
import { logout } from '../actions/userActions';
import { walletLogin } from '../actions/storeAction';
import checkNetwork from '../utils/checkNetwork ';

const Header = () => {
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const userWalletConnect = useSelector((state) => state.userWalletConnect);
  const { walletInfo } = userWalletConnect;
  const [show, setShow] = useState(false);
  const target = useRef(null);

  useEffect(() => {
    checkNetwork();
  }, []);

  const logoutHandler = () => {
    dispatch(logout());
  };

  const connectWallet = async () => {
    checkNetwork();
    dispatch(walletLogin());
  };

  return (
    <header>
      <Navbar bg='primary' variant='dark' expand='lg' collapseOnSelect>
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand>Shoppify</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Route render={({ history }) => <SearchBox history={history} />} />
            <Nav className='ml-auto'>
              <LinkContainer to='/cart'>
                <Nav.Link>
                  <i className='fas fa-shopping-cart'></i> Cart
                </Nav.Link>
              </LinkContainer>
              {userInfo ? (
                <NavDropdown title={userInfo.name} id='username'>
                  <LinkContainer to='/profile'>
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to='/login'>
                  <Nav.Link>
                    <i className='fas fa-user'></i> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown title='Admin' id='adminmenu'>
                  <LinkContainer to='/admin/userlist'>
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/productlist'>
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/orderlist'>
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
              <Button ref={target} className='wallet-connect-button' onClick={connectWallet} variant="light" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
                {walletInfo ? `${walletInfo.address}` : "Connect Wallet"}

                {walletInfo && (
                  <Overlay target={target.current} show={show} placement="right">
                    {(props) => (
                      <Tooltip id="overlay-example" {...props}>
                        {walletInfo.address}
                      </Tooltip>
                    )}
                  </Overlay>
                )}

              </Button>{' '}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
