import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import Rating from './Rating'
import { useSelector } from 'react-redux'

const Product = ({ product }) => {

  const contractList = useSelector((state) => state.contractList)
  const { ethValue } = contractList

  return (
    <Card className='my-3 p-3 rounded product-card'>
      <Link to={`/product/${product._id}`}>
        <Card.Img src={product.image} variant='top' className='product-card-image' />
      </Link>

      <Card.Body>
        <Link to={`/product/${product._id}`}>
          <Card.Title as='div'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as='div'>
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </Card.Text>

        <Card.Text as='h3'>₹{product.price}</Card.Text>
        <Card.Text as='small'><i className="fa fa-ethereum"></i>{product.price / ethValue} Eth</Card.Text>
      </Card.Body>
    </Card>
  )
}

export default Product
