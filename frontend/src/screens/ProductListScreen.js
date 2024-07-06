import React, { useEffect, useState } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import Paginate from '../components/Paginate'
import {
  listProducts,
  deleteProduct,
  createProduct,
} from '../actions/productActions'
import { PRODUCT_CREATE_RESET } from '../constants/productConstants'


const ProductListScreen = ({ history, match }) => {
  const pageNumber = match.params.pageNumber || 1

  const dispatch = useDispatch()

  const [message, setMessage] = useState(null)

  const productList = useSelector((state) => state.productList)
  const { loading, error, products, page, pages } = productList

  const contractList = useSelector((state) => state.contractList)
  const { storeContract, ethValue } = contractList

  const productDelete = useSelector((state) => state.productDelete)
  const {
    loading: loadingDelete,
    error: errorDelete,
    success: successDelete,
  } = productDelete

  const productCreate = useSelector((state) => state.productCreate)
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
    product: createdProduct,
  } = productCreate

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const userWalletConnect = useSelector((state) => state.userWalletConnect);
  const { walletInfo } = userWalletConnect;

  useEffect(() => {
    dispatch({ type: PRODUCT_CREATE_RESET })

    if (!userInfo || !userInfo.isAdmin) {
      history.push('/login')
    }

    if (successCreate) {
      history.push(`/admin/product/${createdProduct._id}/edit`)
    } else {
      dispatch(listProducts('', pageNumber))
    }
  }, [
    dispatch,
    history,
    userInfo,
    successDelete,
    successCreate,
    createdProduct,
    pageNumber,
  ])

  const alertMessage = (message) => {
    setMessage(message);
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  }


  const deleteHandler = (id) => {
    if (window.confirm('Are you sure')) {
      dispatch(deleteProduct(id))
    }
  }

  const createProductHandler = () => {
    dispatch(createProduct())
  }

  const syncronizeDatabaseAndBlockchain = async () => {
    try {

      if (storeContract && walletInfo) {

        // Serialize the products list
        const serializedProducts = products.map(product => {
          return {
            id: product.contractId,
            name: product.name,
            price: product.price,
            countInStock: product.countInStock
          }
        });

        await storeContract.methods.updateProductsList(serializedProducts).send({ from: walletInfo.address });
        alertMessage("List of products successfully updated");
      }
    } catch (error) {
      console.log(error);
    }

  };

  const syncProduct = async (product) => {
    try {

      await storeContract.methods.updateProduct(product.contractId, product.name, product.price, product.countInStock).send(
        { from: walletInfo.address }
      );

      const productData = await storeContract.methods.products(product.contractId).call();
      const productId = parseInt(productData.id); // Converte para número inteiro
      const productName = productData.name;
      const productPrice = parseInt(productData.price); // Converte para número inteiro
      const countInStock = parseInt(productData.countInStock); // Converte para número inteiro

      console.log(productId, productName, productPrice, countInStock);
      alertMessage(`Product "${productName}" successfully updated at the store contract`);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className='text-right'>
          <Button className='my-3' onClick={createProductHandler}>
            <i className='fas fa-plus mr-2'></i> Create Product
          </Button>
          <Button className='my-3 ml-5' onClick={syncronizeDatabaseAndBlockchain} >
            <i className='fas fa-sync mr-2'></i> Sync Contract Store
          </Button>
        </Col>
      </Row>
      <Row>
        {message && <Message variant='success'>{message}</Message>}
      </Row>
      {loadingDelete && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {loadingCreate && <Loader />}
      {errorCreate && <Message variant='danger'>{errorCreate}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Contract ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>PRICE (ETH)</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th>STOCK</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, indice) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.contractId}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.price / ethValue}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>{product.countInStock}</td>
                  <td>
                    <Button className='btn-sm' onClick={() => syncProduct(product)}>
                      <i className='fas fa-sync'></i>
                    </Button>
                    <LinkContainer to={`/admin/product/${product._id}/edit`}>
                      <Button variant='light' className='btn-sm'>
                        <i className='fas fa-edit'></i>
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      onClick={() => deleteHandler(product._id)}
                    >
                      <i className='fas fa-trash'></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginate pages={pages} page={page} isAdmin={true} />
        </>
      )}
    </>
  )
}

export default ProductListScreen
