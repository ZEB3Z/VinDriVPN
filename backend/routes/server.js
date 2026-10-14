const express = require('express')
const router = express.Router();

const {
    getServers,
    getSingleServer,
    getAdminServers,
    newServer,
    updateServer,
    deleteServer
} = require('../controllers/server')
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

// Public-ish (still requires login, matching the rest of this app's pattern):
// used by the Premium server-picker at checkout.
router.get('/servers', isAuthenticatedUser, getServers);
router.get('/server/:id', isAuthenticatedUser, getSingleServer);

// Admin CRUD for VPN server locations.
router.get('/admin/servers', isAuthenticatedUser, authorizeRoles('admin'), getAdminServers);
router.post('/admin/server/new', isAuthenticatedUser, authorizeRoles('admin'), newServer);
router.route('/admin/server/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateServer)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteServer);

module.exports = router;
