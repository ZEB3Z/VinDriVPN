import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { getToken } from '../../Utils/helpers';
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, } from '@mui/x-data-grid'

const ServersList = () => {
    const [servers, setServers] = useState([])
    const [error, setError] = useState('')
    const [deleteError, setDeleteError] = useState('')

    const [loading, setLoading] = useState(true)
    const [isDeleted, setIsDeleted] = useState(false)

    let navigate = useNavigate()
    const getAdminServers = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/servers`, config)
            setServers(data.servers)
            setLoading(false)
        } catch (error) {
            setError(error.response.data.message)
        }
    }
    useEffect(() => {
        getAdminServers()

        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
        }

        if (deleteError) {
            toast.error(deleteError, {
                position: 'bottom-right'
            });
        }

        if (isDeleted) {
            toast.success('Server deleted successfully', {
                position: 'bottom-right'
            })
            navigate('/admin/servers');
        }

    }, [error, deleteError, isDeleted,])

    const deleteServer = async (id) => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            }
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/server/${id}`, config)

            setIsDeleted(data.success)
            setLoading(false)
        } catch (error) {
            setDeleteError(error.response.data.message)
        }
    }
    const deleteServerHandler = (id) => {
        deleteServer(id)
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Server ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'label',
            headerName: 'Label',
            width: 140,
        },
        {
            field: 'location',
            headerName: 'Location',
            width: 150,
        },
        {
            field: 'tier',
            headerName: 'Tier',
            width: 100,
        },
        {
            field: 'slots',
            headerName: 'Slots Used',
            width: 130,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 110,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <Link to={`/admin/server/${params.id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-pencil"></i>
                    </Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteServerHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];

    const rows = servers.map(server => ({
        id: server._id,
        label: server.label,
        location: `${server.city}, ${server.country}`,
        tier: server.tier,
        slots: `${server.activeConnections} / ${server.capacity}`,
        status: server.status,
    }));

    return (
        <>
            <MetaData title={'VPN Servers'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <>
                        <div className="d-flex justify-content-between align-items-center my-5">
                            <h1 className="mb-0">VPN Servers</h1>
                            <Link to="/admin/server" className="btn btn-primary">
                                <i className="fa fa-plus"></i> New Server
                            </Link>
                        </div>

                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    disableSelectionOnClick
                                    getRowId={(row) => row.id}
                                    showToolbar
                                />
                            </div>
                        )}
                    </>
                </div>
            </div>
        </>
    )
}

export default ServersList
