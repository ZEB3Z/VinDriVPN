import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { getToken } from '../../Utils/helpers'

// Basic tier purchase flow. No shipping step: VinDri products are digital,
// and Basic auto-assigns a server, so there is nothing for the customer to
// configure before paying. This is the fully functional path for the first
// version of VinDri (Premium checkout is UI-only for now — see
// PremiumServerPicker.jsx).
const VpnCheckout = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [placingOrder, setPlacingOrder] = useState(false)

    const getProduct = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
            setProduct(data.product)
        } catch (error) {
            toast.error('Could not load this plan', { position: 'bottom-right' })
        }
        setLoading(false)
    }

    useEffect(() => {
        getProduct()
    }, [id])

    const placeOrder = async () => {
        setPlacingOrder(true)
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const order = {
                orderItems: [{
                    name: product.name,
                    quantity: 1,
                    image: product.images[0] ? product.images[0].url : '',
                    price: product.price,
                    product: product._id
                }],
                itemsPrice: product.price,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: product.price,
                paymentInfo: {
                    id: 'mock_' + Date.now(),
                    status: 'succeeded'
                }
                // no shippingInfo — this is a digital VPN product
            }

            const { data } = await axios.post(`${import.meta.env.VITE_API}/order/new`, order, config)

            if (data.provisioningErrors && data.provisioningErrors.length > 0) {
                toast.error(data.provisioningErrors[0].message, { position: 'bottom-right' })
            } else {
                toast.success('VPN account provisioned', { position: 'bottom-right' })
            }

            navigate('/vpn/dashboard')
        } catch (error) {
            toast.error(
                (error.response && error.response.data && error.response.data.message) || 'Could not place order',
                { position: 'bottom-right' }
            )
        }
        setPlacingOrder(false)
    }

    if (loading) return <Loader />
    if (!product) return <div className="container mt-5"><p>Plan not found.</p></div>

    return (
        <>
            <MetaData title={'Checkout'} />
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-6">
                        <div className="card p-4 shadow-sm">
                            <h2>{product.name}</h2>
                            <p className="text-muted">{product.description}</p>
                            <h3 className="my-3">${product.price}</h3>

                            <div className="alert alert-info">
                                A server will be assigned automatically from any available slot.
                                This is a mock payment step — no real card is charged.
                            </div>

                            <button
                                className="btn btn-primary btn-block py-3"
                                onClick={placeOrder}
                                disabled={placingOrder}
                            >
                                {placingOrder ? 'Processing...' : `Pay $${product.price} & Activate`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default VpnCheckout
