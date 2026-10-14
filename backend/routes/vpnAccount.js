const express = require('express')
const router = express.Router();

const {
    myVpnAccounts,
    getSingleVpnAccount,
    simulateConnect,
    simulateDisconnect,
    connectionHistory,
    allVpnAccounts
} = require('../controllers/vpnAccount')
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.get('/vpn/me', isAuthenticatedUser, myVpnAccounts);
router.get('/vpn/:id', isAuthenticatedUser, getSingleVpnAccount);
router.get('/vpn/:id/history', isAuthenticatedUser, connectionHistory);
router.post('/vpn/:id/simulate-connect', isAuthenticatedUser, simulateConnect);
router.post('/vpn/:id/simulate-disconnect', isAuthenticatedUser, simulateDisconnect);

router.get('/admin/vpn-accounts', isAuthenticatedUser, authorizeRoles('admin'), allVpnAccounts);

module.exports = router;
