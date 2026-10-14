import React, { useState, useEffect } from 'react'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'

import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';
import { getToken } from '../../Utils/helpers';

const UpdateServer = () => {
    const [label, setLabel] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [simulatedIp, setSimulatedIp] = useState('');
    const [capacity, setCapacity] = useState(0);
    const [activeConnections, setActiveConnections] = useState(0);
    const [tier, setTier] = useState('both');
    const [status, setStatus] = useState('active');
    const [error, setError] = useState('')
    const [updateError, setUpdateError] = useState('')
    const [isUpdated, setIsUpdated] = useState(false)

    const navigate = useNavigate()
    const params = useParams();

    const getServerDetails = async (id) => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${getToken()}` } }
            const { data } = await axios.get(`${import.meta.env.VITE_API}/server/${id}`, config)
            const server = data.server;
            setLabel(server.label)
            setCountry(server.country)
            setCity(server.city)
            setSimulatedIp(server.simulatedIp)
            setCapacity(server.capacity)
            setActiveConnections(server.activeConnections)
            setTier(server.tier)
            setStatus(server.status)
        } catch (error) {
            setError(error.response.data.message)
        }
    }

    useEffect(() => {
        getServerDetails(params.id)
    }, [params.id])

    const submitHandler = (e) => {
        e.preventDefault();
        const serverData = { label, country, city, simulatedIp, capacity: Number(capacity), tier, status };
        updateServer(params.id, serverData)
    }

    const updateServer = async (id, serverData) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }
            const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/server/${id}`, serverData, config)
            setIsUpdated(data.success)
        } catch (error) {
            setUpdateError(error.response.data.message)
        }
    }

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' });
            setError('')
        }
        if (updateError) {
            toast.error(updateError, { position: 'bottom-right' });
            setUpdateError('')
        }
        if (isUpdated) {
            navigate('/admin/servers');
            toast.success('Server updated successfully', { position: 'bottom-right' })
        }
    }, [error, updateError, isUpdated])

    return (
        <>
            <MetaData title={'Update VPN Server'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <div className="wrapper my-5">
                        <form className="shadow-lg" onSubmit={submitHandler}>
                            <h1 className="mb-4">Update VPN Server</h1>

                            <div className="form-group">
                                <label htmlFor="label_field">Label</label>
                                <input type="text" id="label_field" className="form-control" value={label} onChange={(e) => setLabel(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="country_field">Country</label>
                                <input type="text" id="country_field" className="form-control" value={country} onChange={(e) => setCountry(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="city_field">City</label>
                                <input type="text" id="city_field" className="form-control" value={city} onChange={(e) => setCity(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="ip_field">Simulated IP</label>
                                <input type="text" id="ip_field" className="form-control" value={simulatedIp} onChange={(e) => setSimulatedIp(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="capacity_field">Capacity</label>
                                <input type="number" id="capacity_field" className="form-control" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                                <small className="form-text text-muted">
                                    Currently used: {activeConnections} slot(s). Lowering capacity below this will not disconnect existing accounts.
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="tier_field">Tier</label>
                                <select className="form-control" id="tier_field" value={tier} onChange={(e) => setTier(e.target.value)}>
                                    <option value="both">Both (Basic + Premium)</option>
                                    <option value="basic">Basic only</option>
                                    <option value="premium">Premium only</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="status_field">Status</label>
                                <select className="form-control" id="status_field" value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="active">Active</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>

                            <button id="update_server_button" type="submit" className="btn btn-block py-3">
                                UPDATE
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
export default UpdateServer
