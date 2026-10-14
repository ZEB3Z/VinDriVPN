import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { getUser } from '../../Utils/helpers'

// VinDri's storefront: two VPN service tiers instead of a generic product
// catalog. Products with serviceType vpn_basic/vpn_premium are expected to
// already exist in the database (created by an admin via /admin/product,
// category "VPN Service").
const Plans = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const getPlans = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/products?keyword=&price[gte]=0&price[lte]=999999`)
            setProducts(data.products || [])
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        getPlans()
    }, [])

    const basicPlan = products.find(p => p.serviceType === 'vpn_basic')
    const premiumPlan = products.find(p => p.serviceType === 'vpn_premium')

    const choosePlan = (product, tier) => {
        if (!getUser()) {
            navigate('/login')
            return
        }
        if (tier === 'basic') {
            navigate(`/vpn/checkout/${product._id}`)
        } else {
            navigate(`/vpn/premium-setup/${product._id}`)
        }
    }

    return (
        <>
            <MetaData title={'Plans'} />
            <div className="container mt-5">
                <h1 className="text-center mb-2">Choose Your VinDri Plan</h1>
                <p className="text-center text-muted mb-5">
                    This is a school-project mockup. No real VPN tunnel is created — server assignment and
                    credentials are simulated at the database layer.
                </p>

                {loading ? <Loader /> : (
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-5 mb-4">
                            <div className="card p-4 shadow-sm h-100">
                                <h3>Basic</h3>
                                <h2 className="my-3">{basicPlan ? `$${basicPlan.price}` : '—'}</h2>
                                <ul className="list-unstyled">
                                    <li>✓ Automatic server assignment</li>
                                    <li>✓ 1 device slot</li>
                                    <li>✓ Capped bandwidth (simulated)</li>
                                    <li className="text-muted">✗ No usage history log</li>
                                    <li className="text-muted">✗ No kill-switch / dedicated IP</li>
                                </ul>
                                <button
                                    className="btn btn-primary btn-block mt-auto"
                                    disabled={!basicPlan}
                                    onClick={() => choosePlan(basicPlan, 'basic')}
                                >
                                    {basicPlan ? 'Get Basic' : 'Not yet available'}
                                </button>
                            </div>
                        </div>

                        <div className="col-12 col-md-5 mb-4">
                            <div className="card p-4 shadow-sm h-100 border-primary">
                                <h3>Premium</h3>
                                <h2 className="my-3">{premiumPlan ? `$${premiumPlan.price}` : '—'}</h2>
                                <ul className="list-unstyled">
                                    <li>✓ Manual server selection</li>
                                    <li>✓ Up to 5 device slots</li>
                                    <li>✓ Unlimited bandwidth (simulated)</li>
                                    <li>✓ Usage history log</li>
                                    <li>✓ Kill-switch / dedicated IP add-ons</li>
                                </ul>
                                <button
                                    className="btn btn-outline-primary btn-block mt-auto"
                                    disabled={!premiumPlan}
                                    onClick={() => choosePlan(premiumPlan, 'premium')}
                                >
                                    {premiumPlan ? 'Configure Premium' : 'Not yet available'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && !basicPlan && !premiumPlan && (
                    <p className="text-center text-muted mt-4">
                        No VPN plans found yet. An admin needs to create products with category
                        "VPN Service" and the matching service type (vpn_basic / vpn_premium).
                    </p>
                )}
            </div>
        </>
    )
}

export default Plans
