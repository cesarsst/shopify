import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { PayPalButton } from 'react-paypal-button-v2'
import { Link } from 'react-router-dom'
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
} from '../actions/orderActions'
import {
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from '../constants/orderConstants'

const OrderScreen = ({ match, history }) => {
  const orderId = match.params.id

  const [sdkReady, setSdkReady] = useState(false)

  const dispatch = useDispatch()

  const orderDetails = useSelector((state) => state.orderDetails)
  const { order, loading, error } = orderDetails

  const contractList = useSelector((state) => state.contractList)
  const { ethValue, storeContract } = contractList

  const userWalletConnect = useSelector((state) => state.userWalletConnect);
  const { walletInfo } = userWalletConnect;

  const orderPay = useSelector((state) => state.orderPay)
  const { loading: loadingPay, success: successPay } = orderPay

  const orderDeliver = useSelector((state) => state.orderDeliver)
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  if (!loading) {
    //   Calculate prices
    const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2)
    }

    order.itemsPrice = addDecimals(
      order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    )
  }

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    }

    const addPayPalScript = async () => {
      const { data: clientId } = await axios.get('/api/config/paypal')
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`
      script.async = true
      script.onload = () => {
        setSdkReady(true)
      }
      document.body.appendChild(script)
    }

    if (!order || successPay || successDeliver || order._id !== orderId) {
      dispatch({ type: ORDER_PAY_RESET })
      dispatch({ type: ORDER_DELIVER_RESET })
      dispatch(getOrderDetails(orderId))
    } else if (!order.isPaid) {
      if (!window.paypal) {
        addPayPalScript()
      } else {
        setSdkReady(true)
      }
    }
  }, [dispatch, orderId, successPay, successDeliver, order])

  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(orderId, paymentResult))
  }

  const payOrderWithCryptoHandler = async () => {
    try {

      if (!walletInfo) alert("Please connect your wallet");
      const id_list = order.orderItems.map(item => item.contractId)
      console.log("🚀 ~ payOrderWithCryptoHandler ~ id_list:", id_list)
      const qty_list = order.orderItems.map(item => item.qty)
      console.log("🚀 ~ payOrderWithCryptoHandler ~ qty_list:", qty_list)

      console.log(walletInfo.address)
      await storeContract.methods.purchaseProducts(id_list, qty_list).send({
        from: walletInfo.address,
        value: convertPriceToEth(order.totalPrice) * 10 ** 18
      })

      dispatch(payOrder(orderId, {
        id: orderId,
        status: 'PAID',
        update_time: new Date().toISOString(),
        email_address: userInfo.email
      }))
    } catch (e) {
      console.log(e);
    }

  }

  const deliverHandler = () => {
    dispatch(deliverOrder(order))
  }

  const convertPriceToEth = (price) => {
    return price / ethValue
  }

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant='success'>
                  Delivered on {order.deliveredAt}
                </Message>
              ) : (
                <Message variant='danger'>Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant='success'>Paid on {order.paidAt}</Message>
              ) : (
                <Message variant='danger'>Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        {
                          order.paymentMethod !== 'Crypto' ? (
                            <Col md={4}>
                              {item.qty} x ₹{item.price} = ₹{item.qty * item.price}
                            </Col>
                          ) : (
                            <Col md={4}>
                              {item.qty} x {convertPriceToEth(item.price)} eth = {convertPriceToEth(item.qty * item.price)} eth
                            </Col>
                          )
                        }
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  {
                    order.paymentMethod !== 'Crypto' ? (
                      <Col>₹{order.itemsPrice}</Col>
                    ) : (
                      <Col>{convertPriceToEth(order.itemsPrice)} eth</Col>
                    )
                  }
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  {
                    order.paymentMethod !== 'Crypto' ? (
                      <Col>₹{order.shippingPrice}</Col>
                    ) : (
                      <Col>{convertPriceToEth(order.shippingPrice)} eth</Col>
                    )
                  }
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  {
                    order.paymentMethod !== 'Crypto' ? (
                      <Col>₹{order.taxPrice}</Col>
                    ) : (
                      <Col>{convertPriceToEth(order.taxPrice)} eth</Col>
                    )
                  }
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  {
                    order.paymentMethod !== 'Crypto' ? (
                      <Col>₹{order.totalPrice}</Col>
                    ) : (
                      <Col>{convertPriceToEth(order.totalPrice)} eth</Col>
                    )
                  }
                </Row>
              </ListGroup.Item>
              {!order.isPaid && (
                order.paymentMethod === 'Crypto' ? (
                  <ListGroup.Item>
                    <Button
                      type='button'
                      className='btn btn-block'
                      onClick={payOrderWithCryptoHandler}
                    >
                      Pay with Crypto
                    </Button>
                  </ListGroup.Item>
                ) : (
                  <ListGroup.Item>
                    {loadingPay && <Loader />}
                    {!sdkReady ? (
                      <Loader />
                    ) : (
                      <PayPalButton
                        amount={order.totalPrice}
                        onSuccess={successPaymentHandler}
                      />
                    )}
                  </ListGroup.Item>
                )
              )}
              {loadingDeliver && <Loader />}
              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type='button'
                      className='btn btn-block'
                      onClick={deliverHandler}
                    >
                      Mark As Delivered
                    </Button>
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default OrderScreen
