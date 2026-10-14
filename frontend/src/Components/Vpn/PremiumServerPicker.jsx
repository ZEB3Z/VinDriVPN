import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { getToken } from '../../Utils/helpers'

// Premium tier configuration screen. The backend fully supports Premium
// purchases (POST /order/new with a premiumOptions payload — see
// backend/utils/vpnProvisioning.js), but per this version's scope, the
// purchase action here is intentionally left as a UI-only mockup: the
// server list, device-slot selector, and add-on toggles are all live and
// backed by real data, but clicking "Activate Premium" does not place an
// order yet.
const PremiumServerPicker = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [servers, setServers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedServer, setSelectedServer] = useState('')
    const [deviceSlotLimit, setDeviceSlotLimit] = useState(5)
    const [killSwitchEnabled, setKillSwitchEnabled] = useState(false)
    const [dedicatedIpRequested, setDedicatedIpRequested] = useState(false)

    const loadData = async () => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${getToken()}` } }
            const [productRes, serversRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API}/product/${id}`),
                axios.get(`${import.meta.env.VITE_API}/servers?tier=premium&availableOnly=true`, config)
            ])
            setProduct(productRes.data.product)
            setServers(serversRes.data.servers)
        } catch (error) {
            toast.error('Could not load Premium setup', { position: 'bottom-right' })
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [id])

    const handleActivate = (e) => {
        e.preventDefault()
        if (!selectedServer) {
            toast.error('Please select a server', { position: 'bottom-right' })
            return
        }
        toast.info('Premium checkout is coming in a future version of VinDri.', { position: 'bottom-right' })
    }

    if (loading) return <Loader />

    return (
        <>
            <MetaData title={'Configure Premium'} />
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-7">
                        <div className="card p-4 shadow-sm">
                            <h2>Configure Premium{product ? ` — ${product.name}` : ''}</h2>
                            <p className="text-muted mb-4">
                                Pick a server and the add-ons you want. Purchasing Premium isn't enabled yet in
                                this version — this screen shows what the finished flow will look like.
                            </p>

                            <form onSubmit={handleActivate}>
                                <div className="form-group">
                                    <label htmlFor="server_field">Server location</label>
                                    <select
                                        id="server_field"
                                        className="form-control"
                                        value={selectedServer}
                                        onChange={(e) => setSelectedServer(e.target.value)}
                                    >
                                        <option value="">— Select a server —</option>
                                        {servers.map(server => (
                                            <option key={server._id} value={server._id}>
                                                {server.label} ({server.city}, {server.country}) — {server.capacity - server.activeConnections} slot(s) open
                                            </option>
                                        ))}
                                    </select>
                                    {servers.length === 0 && (
                                        <small className="form-text text-muted">
                                            No Premium-eligible servers with open slots right now. An admin can add
                                            one from the Servers admin page.
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="devices_field">Device slots (up to 5)</label>
                                    <input
                                        type="number"
                                        id="devices_field"
                                        className="form-control"
                                        min="1"
                                        max="5"
                                        value={deviceSlotLimit}
                                        onChange={(e) => setDeviceSlotLimit(Number(e.target.value))}
                                    />
                                </div>

                                <div className="form-check mb-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="killswitch_field"
                                        checked={killSwitchEnabled}
                                        onChange={(e) => setKillSwitchEnabled(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="killswitch_field">
                                        Enable kill-switch (simulated)
                                    </label>
                                </div>

                                <div className="form-check mb-4">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="dedicated_ip_field"
                                        checked={dedicatedIpRequested}
                                        onChange={(e) => setDedicatedIpRequested(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="dedicated_ip_field">
                                        Request a dedicated IP (simulated)
                                    </label>
                                </div>

                                <button type="submit" className="btn btn-outline-primary btn-block py-3">
                                    Activate Premium (coming soon)
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PremiumServerPicker
