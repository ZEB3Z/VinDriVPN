import React, { useEffect, useState } from 'react'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { getToken } from '../../Utils/helpers';
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, } from '@mui/x-data-grid'

const VpnAccountsList = () => {
    const [accounts, setAccounts] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    const getAllVpnAccounts = async () => {
        try {
            const config = { headers: { 'Authorization': `Bearer ${getToken()}` } }
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/vpn-accounts`, config)
            setAccounts(data.accounts)
            setLoading(false)
        } catch (error) {
            setError(error.response.data.message)
        }
    }

    useEffect(() => {
        getAllVpnAccounts()
        if (error) {
            toast.error(error, { position: 'bottom-right' });
        }
    }, [error])

    const columns = [
        { field: 'id', headerName: 'Account ID', flex: 1, renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span> },
        { field: 'owner', headerName: 'Owner', width: 160 },
        { field: 'tier', headerName: 'Tier', width: 100 },
        { field: 'server', headerName: 'Server', width: 160 },
        { field: 'credentialUsername', headerName: 'Credential', width: 150 },
        { field: 'status', headerName: 'Status', width: 110 },
    ];

    const rows = accounts.map(acc => ({
        id: acc._id,
        owner: acc.user ? `${acc.user.name} (${acc.user.email})` : 'Unknown',
        tier: acc.tier,
        server: acc.server ? `${acc.server.label}` : 'Unassigned',
        credentialUsername: acc.credentialUsername,
        status: acc.status,
    }));

    return (
        <>
            <MetaData title={'VPN Accounts'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <h1 className="my-5">All VPN Accounts</h1>
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
                </div>
            </div>
        </>
    )
}

export default VpnAccountsList
