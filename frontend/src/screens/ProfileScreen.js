import React, { useState, useEffect } from 'react'
import { Table, Form, Button, Row, Col } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getUserDetails, updateUserProfile } from '../actions/userActions'
import { listMyOrders } from '../actions/orderActions'
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants'
import { Alert } from 'react-bootstrap'
import { initializeStoreContract } from '../actions/storeAction'

const ProfileScreen = ({ location, history }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [newEthValue, setNewEthValue] = useState(1)
  const [updatedEthValue, setUpdatedEthValue] = useState(false)

  const dispatch = useDispatch()

  const userDetails = useSelector((state) => state.userDetails)
  const { loading, error, user } = userDetails

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const userUpdateProfile = useSelector((state) => state.userUpdateProfile)
  const { success } = userUpdateProfile

  const orderListMy = useSelector((state) => state.orderListMy)
  const { loading: loadingOrders, error: errorOrders, orders } = orderListMy

  const contractList = useSelector((state) => state.contractList)
  const { storeContract, owner, ethValue, valueInContract } = contractList

  const userWalletConnect = useSelector((state) => state.userWalletConnect);
  const { walletInfo } = userWalletConnect;

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    } else {
      if (!user || !user.name || success) {
        dispatch({ type: USER_UPDATE_PROFILE_RESET })
        dispatch(getUserDetails('profile'))
        dispatch(initializeStoreContract());
        dispatch(listMyOrders())
      } else {
        setName(user.name)
        setEmail(user.email)
      }
    }
  }, [dispatch, history, userInfo, user, success])

  const submitHandler = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
    } else {
      dispatch(updateUserProfile({ id: user._id, name, email, password }))
    }
  }

  const updateEthValue = async () => {
    try {
      if (window.ethereum) {
        if (!walletInfo) {
          alert('Please connect your wallet!');
          return;
        }

        if (newEthValue <= 0) {
          alert('Please enter a valid (positive integer) eth value!');
          return;
        }

        const contractInstance = storeContract;
        await contractInstance.methods.updateEthValue(newEthValue).send({ from: walletInfo.address });
        setUpdatedEthValue(true);
        dispatch(initializeStoreContract());

        setTimeout(() => {
          setUpdatedEthValue(false);
        }, 5000);
      } else {
        console.log('Please install MetaMask!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const withdrawContract = async () => {
    try {
      if (window.ethereum) {
        if (!walletInfo) {
          alert('Please connect your wallet!');
          return;
        }
        const contractInstance = storeContract;
        await contractInstance.methods.withdrawFunds().send({ from: walletInfo.address });
        dispatch(initializeStoreContract());
      } else {
        console.log('Please install MetaMask!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Row>
      <Col md={3}>
        <h2>User Profile</h2>
        {message && <Message variant='danger'>{message}</Message>}
        { }
        {success && <Message variant='success'>Profile Updated</Message>}
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='name'
                placeholder='Enter name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='email'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='confirmPassword'>
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Confirm password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button type='submit' variant='primary'>
              Update
            </Button>
          </Form>
        )}
      </Col>
      <Col md={9}>

        {user.isAdmin && <Row>
          <Col>
            <h2>Contract Store</h2>
            <p>
              <strong>Owner:</strong> {owner}
            </p>
            <p>
              {storeContract && <span> <strong>Contract Address:</strong> {storeContract.options.address}</span>}
            </p>
            <p>
              <strong>ETH Value:</strong> {ethValue}
            </p>
            <Row className='mb-3 align-items-md-center'>
              <Col md={9}>
                {updatedEthValue && <Alert key={'success '} variant={'success'}>
                  ETH value updated successfully!
                </Alert>}
                <Form.Label htmlFor="ethValue">NEW ETH VALUE</Form.Label>
                <Form.Control
                  type="number"
                  id="ethValue"
                  aria-describedby="ethValueDescribe"
                  placeholder="Enter new eth value"
                  value={newEthValue}
                  onChange={(e) => setNewEthValue(e.target.value)}
                />
                <Form.Text id="ethValue" muted >
                  <p className='important-msg'>This will update the ETH value in the contract. Be careful!</p>
                </Form.Text>
              </Col>
              <Col md={3} className=''>
                <Button onClick={updateEthValue}>
                  Update
                </Button>
              </Col>
            </Row>

            <Alert key={'warning '} variant={'warning'}>
              Some funds ({valueInContract} ETH) in the contract are available for recovery.
              <Alert.Link onClick={withdrawContract}> Click here to withdraw!</Alert.Link>
            </Alert>

          </Col>
        </Row>}

        <h2>My Orders</h2>
        {loadingOrders ? (
          <Loader />
        ) : errorOrders ? (
          <Message variant='danger'>{errorOrders}</Message>
        ) : (
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>{order.totalPrice}</td>
                  <td>
                    {order.isPaid ? (
                      order.paidAt.substring(0, 10)
                    ) : (
                      <i className='fas fa-times' style={{ color: 'red' }}></i>
                    )}
                  </td>
                  <td>
                    {order.isDelivered ? (
                      order.deliveredAt.substring(0, 10)
                    ) : (
                      <i className='fas fa-times' style={{ color: 'red' }}></i>
                    )}
                  </td>
                  <td>
                    <LinkContainer to={`/order/${order._id}`}>
                      <Button className='btn-sm' variant='light'>
                        Details
                      </Button>
                    </LinkContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  )
}

export default ProfileScreen
