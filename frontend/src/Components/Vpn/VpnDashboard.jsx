import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { getToken } from '../../Utils/helpers'

const VpnDashboard = () => {
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [historyByAccount, setHistoryByAccount] = useState({})

    const getAccounts = async () => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${getToken()}` } }
            const { data } = await axios.get(`${import.meta.env.VITE_API}/vpn/me`, config)
            setAccounts(data.accounts)
        } catch (error) {
            toast.error('Could not load your VPN accounts', { position: 'bottom-right' })
        }
        setLoading(false)
    }

    useEffect(() => {
        getAccounts()
    }, [])

    const loadHistory = async (accountId) => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${getToken()}` } }
            const { data } = await axios.get(`${import.meta.env.VITE_API}/vpn/${accountId}/history`, config)
            setHistoryByAccount(prev => ({ ...prev, [accountId]: data.logs }))
        } catch (error) {
            toast.error('Could not load connection history', { position: 'bottom-right' })
        }
    }

    const simulateConnect = async (accountId) => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${getToken()}` } }
            await axios.post(`${import.meta.env.VITE_API}/vpn/${accountId}/simulate-connect`, {}, config)
            toast.success('Simulated connection logged', { position: 'bottom-right' })
            getAccounts()
            loadHistory(accountId)
        } catch (error) {
            toast.error(
                (error.response && error.response.data && error.response.data.message) || 'Could not simulate connect',
                { position: 'bottom-right' }
            )
        }
    }

    const simulateDisconnect = async (accountId) => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${getToken()}` } }
            await axios.post(`${import.meta.env.VITE_API}/vpn/${accountId}/simulate-disconnect`, {}, config)
            toast.success('Simulated disconnect logged', { position: 'bottom-right' })
            getAccounts()
            loadHistory(accountId)
        } catch (error) {
            toast.error('Could not simulate disconnect', { position: 'bottom-right' })
        }
    }

    if (loading) return <Loader />

    return (
        <>
            <MetaData title={'My VPN Accounts'} />
            <div className="container mt-5">
                <h1 className="mb-4">My VPN Accounts</h1>

                {accounts.length === 0 && (
                    <div className="text-center">
                        <p>You don't have a VinDri VPN account yet.</p>
                        <Link to="/plans" className="btn btn-primary">View Plans</Link>
                    </div>
                )}

                {accounts.map(account => (
                    <div className="card p-4 shadow-sm mb-4" key={account._id}>
                        <div className="row">
                            <div className="col-12 col-md-6">
                                <h4 className="text-capitalize">{account.tier} Plan</h4>
                                <p className="mb-1"><b>Status:</b> {account.status}</p>
                                <p className="mb-1">
                                    <b>Assigned server:</b> {account.server ? `${account.server.label} (${account.server.city}, ${account.server.country})` : 'Unassigned'}
                                </p>
                                <p className="mb-1"><b>Simulated IP:</b> {account.server ? account.server.simulatedIp : '—'}</p>
                                <p className="mb-1"><b>Credential username:</b> {account.credentialUsername}</p>
                                <p className="mb-1 text-break"><b>Credential token:</b> {account.credentialToken}</p>
                                <small className="text-muted">
                                    These credentials are simulated for this project and do not connect to a real VPN.
                                </small>
                            </div>

                            <div className="col-12 col-md-6">
                                <p className="mb-1"><b>Device slots:</b> {account.devicesConnected} / {account.deviceSlotLimit} connected</p>
                                <p className="mb-1"><b>Bandwidth:</b> {account.bandwidthTier}</p>
                                <p className="mb-1"><b>Kill-switch:</b> {account.killSwitchEnabled ? 'Enabled' : 'Disabled'}</p>
                                <p className="mb-1"><b>Dedicated IP:</b> {account.dedicatedIp || 'None'}</p>

                                {account.tier === 'premium' ? (
                                    <div className="mt-3">
                                        <button
                                            className="btn btn-success btn-sm mr-2"
                                            onClick={() => simulateConnect(account._id)}
                                            disabled={account.devicesConnected >= account.deviceSlotLimit}
                                        >
                                            Simulate Connect
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary btn-sm mr-2"
                                            onClick={() => simulateDisconnect(account._id)}
                                            disabled={account.devicesConnected <= 0}
                                        >
                                            Simulate Disconnect
                                        </button>
                                        <button
                                            className="btn btn-link btn-sm"
                                            onClick={() => loadHistory(account._id)}
                                        >
                                            View history
                                        </button>
                                    </div>
                                ) : (
                                    <small className="text-muted d-block mt-3">
                                        Connection history and manual device control are Premium features.
                                    </small>
                                )}
                            </div>
                        </div>

                        {historyByAccount[account._id] && (
                            <div className="mt-3">
                                <hr />
                                <h6>Connection History</h6>
                                {historyByAccount[account._id].length === 0 ? (
                                    <p className="text-muted">No simulated connections logged yet.</p>
                                ) : (
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Device</th>
                                                <th>Connected At</th>
                                                <th>Disconnected At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyByAccount[account._id].map(log => (
                                                <tr key={log._id}>
                                                    <td>{log.simulatedDeviceLabel}</td>
                                                    <td>{new Date(log.connectedAt).toLocaleString()}</td>
                                                    <td>{log.disconnectedAt ? new Date(log.disconnectedAt).toLocaleString() : 'Still connected'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    )
}

export default VpnDashboard
