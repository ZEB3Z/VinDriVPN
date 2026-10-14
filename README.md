# VinDri VPN

A tiered VPN access storefront built on the ITCP318 MERN e-commerce template
(MongoDB, Express, React, Node.js). This is a school-project mockup made for
the course **Integrative Programming and Technology (ITCP318)**: it
simulates VPN account provisioning and server-slot assignment entirely at
the database layer. **No real VPN tunnel, encryption, or network connection
is created anywhere in this project.**

## Authors

- Vincent Barliso
- Ericksson Brutas

Course: Integrative Programming and Technology (ITCP318)

## Quick start

Requires Node.js and a local MongoDB instance.

```bash
# Backend
cd backend
cp config/.env.example config/.env   # then fill in your own values
npm install
node seeds/seed.js                    # starter servers, products, admin user
npm start                             # http://localhost:4001

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

The seed script creates an admin user (`admin@vindri.local`). Change its
password after first login.

## What's in this version

- **Basic plan** — fully functional end to end: sign up, buy the Basic plan,
  get auto-assigned a server, and view it on your dashboard.
- **Premium plan** — the configuration screen (server picker, device slots,
  kill-switch/dedicated-IP toggles) is live and reads real data, but the
  purchase action is intentionally left as a "coming soon" mockup for this
  first version. The backend already fully supports Premium purchases
  (see `backend/utils/vpnProvisioning.js`); only the checkout button is
  disabled on the frontend.
- **Admin panel** — extended with VPN Servers (CRUD) and a read-only VPN
  Accounts list, alongside the base template's existing product/order/user
  management.
- **Simulated connection logging** — Premium accounts can trigger a
  "Simulate Connect / Disconnect" action that logs a timestamped entry,
  shown as usage history on the dashboard.

## Stack

| Layer     | Technology                                   |
|-----------|-----------------------------------------------|
| Frontend  | React 19 + Vite, MUI, React-Bootstrap         |
| Backend   | Node.js + Express 5                           |
| Database  | MongoDB + Mongoose                            |
| Auth      | JWT (bearer token, stored in sessionStorage)  |
| Images    | Local disk storage (see note below)           |

**Note on images:** the original ITCP318 template used Cloudinary for image
hosting. This version replaces that with local disk storage
(`backend/uploads/`) so you don't need to create a third-party account to
run the project. See `backend/utils/localStorage.js`.

## Folder structure

```
vindri/
├── backend/
│   ├── config/         # .env.example, database.js
│   ├── controllers/    # route handlers, incl. server.js + vpnAccount.js
│   ├── middlewares/     
│   ├── models/         # incl. server.js, vpnAccount.js, connectionLog.js
│   ├── routes/         # incl. server.js, vpnAccount.js
│   ├── seeds/           # seed.js — starter servers, admin user, products
│   ├── uploads/         # locally-stored images (products/, avatars/)
│   ├── utils/           # incl. vpnProvisioning.js (the core fulfillment logic)
│   ├── app.js
│   └── server.js
└── frontend/
    └── src/
        ├── Components/
        │   ├── Vpn/      # Plans, VpnCheckout, PremiumServerPicker, VpnDashboard
        │   └── Admin/    # incl. ServersList, NewServer, UpdateServer, VpnAccountsList
        └── App.jsx
```

## Core fulfillment logic

The part of this project that isn't just "the base template with a new
coat of paint" is `backend/utils/vpnProvisioning.js` and its hook into
`backend/controllers/order.js`. When an order is placed:

1. The backend checks each order item's product for a `serviceType` of
   `vpn_basic` or `vpn_premium`.
2. For **Basic**, it atomically finds any active server with an open slot
   (`Server.findOneAndUpdate` with a capacity check baked into the query,
   so two concurrent purchases can't both land on the same last-open slot).
3. For **Premium**, it re-validates and claims the specific server the
   customer chose, in case its availability changed since the picker was
   rendered.
4. A `VpnAccount` document is created — this is the simulated "generated
   credential" — with a system-generated username/token, the assigned
   server, and tier-specific feature flags (device limit, bandwidth tier,
   kill-switch, dedicated IP).

This happens immediately when the order is placed, not when an admin later
marks it "Delivered" — appropriate for a digital good versus the base
template's physical-shipping assumption.
