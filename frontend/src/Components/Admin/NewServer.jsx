import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import { getToken } from '../../Utils/helpers';
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewServer = () => {

    const [label, setLabel] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [simulatedIp, setSimulatedIp] = useState('10.0.0.1');
    const [capacity, setCapacity] = useState(50);
    const [tier, setTier] = useState('both');
    const [status, setStatus] = useState('active');
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    let navigate = useNavigate()

    const submitHandler = (e) => {
        e.preventDefault();

        const serverData = { label, country, city, simulatedIp, capacity: Number(capacity), tier, status };

        newServer(serverData)
    }

    const newServer = async (serverData) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.post(`${import.meta.env.VITE_API}/admin/server/new`, serverData, config)
            setSuccess(data.success)
        } catch (error) {
            setError(error.response.data.message)
        }
    }

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
            setError('')
        }

        if (success) {
            navigate('/admin/servers');
            toast.success('Server created successfully', {
                position: 'bottom-right'
            })
        }

    }, [error, success,])


    return (
        <>
            <MetaData title={'New VPN Server'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <>
                        <div className="wrapper my-5">
                            <form className="shadow-lg" onSubmit={submitHandler}>
                                <h1 className="mb-4">New VPN Server</h1>

                                <div className="form-group">
                                    <label htmlFor="label_field">Label</label>
                                    <input
                                        type="text"
                                        id="label_field"
                                        className="form-control"
                                        placeholder="e.g. Singapore-1"
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="country_field">Country</label>
                                    <input
                                        type="text"
                                        id="country_field"
                                        className="form-control"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="city_field">City</label>
                                    <input
                                        type="text"
                                        id="city_field"
                                        className="form-control"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="ip_field">Simulated IP</label>
                                    <input
                                        type="text"
                                        id="ip_field"
                                        className="form-control"
                                        value={simulatedIp}
                                        onChange={(e) => setSimulatedIp(e.target.value)}
                                    />
                                    <small className="form-text text-muted">
                                        Display-only. No real server is provisioned.
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="capacity_field">Capacity (max simultaneous slots)</label>
                                    <input
                                        type="number"
                                        id="capacity_field"
                                        className="form-control"
                                        value={capacity}
                                        onChange={(e) => setCapacity(e.target.value)}
                                    />
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

                                <button
                                    id="new_server_button"
                                    type="submit"
                                    className="btn btn-block py-3"
                                >
                                    CREATE
                                </button>

                            </form>
                        </div>
                    </>
                </div>
            </div>

        </>
    )
}
export default NewServer
