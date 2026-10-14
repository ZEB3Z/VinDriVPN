// One-time setup script for VinDri VPN.
//
// Creates:
//   1. A handful of VPN server locations (for Basic auto-assignment and the
//      Premium server picker to have something to work with).
//   2. An admin user, so you can log into /admin without registering one by
//      hand and manually flipping its role in the database.
//   3. The two sellable products (Basic / Premium) that the Plans page reads.
//
// Usage (from the backend/ folder, after your .env is set up):
//   node seeds/seed.js
//
// Safe to re-run: it skips anything that already exists instead of
// duplicating it.

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '..', 'config', '.env') });

const Server = require('../models/server');
const Product = require('../models/product');
const User = require('../models/user');

const SERVERS = [
    { label: 'Manila-1', country: 'Philippines', city: 'Manila', simulatedIp: '10.10.1.1', capacity: 50, tier: 'both', status: 'active' },
    { label: 'Singapore-1', country: 'Singapore', city: 'Singapore', simulatedIp: '10.10.2.1', capacity: 50, tier: 'both', status: 'active' },
    { label: 'Tokyo-1', country: 'Japan', city: 'Tokyo', simulatedIp: '10.10.3.1', capacity: 30, tier: 'premium', status: 'active' },
    { label: 'Frankfurt-1', country: 'Germany', city: 'Frankfurt', simulatedIp: '10.10.4.1', capacity: 30, tier: 'premium', status: 'active' },
    { label: 'US-East-1', country: 'United States', city: 'New York', simulatedIp: '10.10.5.1', capacity: 40, tier: 'both', status: 'active' },
];

async function run() {
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB for seeding...');

    // --- Servers ---
    for (const s of SERVERS) {
        const exists = await Server.findOne({ label: s.label });
        if (exists) {
            console.log(`Server "${s.label}" already exists, skipping.`);
        } else {
            await Server.create(s);
            console.log(`Created server "${s.label}".`);
        }
    }

    // --- Admin user ---
    const adminEmail = 'admin@vindri.local';
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
        console.log('Admin user already exists, skipping.');
    } else {
        admin = await User.create({
            name: 'VinDri Admin',
            email: adminEmail,
            password: 'admin1234',
            role: 'admin',
            avatar: {
                public_id: 'avatars/seed-admin',
                url: '/uploads/avatars/placeholder.png'
            }
        });
        console.log(`Created admin user: ${adminEmail} / admin1234 (please change this password).`);
    }

    // --- VPN products ---
    const basicExists = await Product.findOne({ serviceType: 'vpn_basic' });
    if (basicExists) {
        console.log('Basic VPN product already exists, skipping.');
    } else {
        await Product.create({
            name: 'VinDri Basic',
            price: 2.99,
            description: 'Automatic server assignment, 1 device, capped bandwidth. A simulated VPN access product for this project — no real tunnel is created.',
            ratings: 0,
            images: [{ public_id: 'products/seed-basic', url: '/uploads/products/placeholder.png' }],
            category: 'VPN Service',
            serviceType: 'vpn_basic',
            seller: 'VinDri',
            stock: 999999,
            numOfReviews: 0,
            user: admin._id
        });
        console.log('Created "VinDri Basic" product.');
    }

    const premiumExists = await Product.findOne({ serviceType: 'vpn_premium' });
    if (premiumExists) {
        console.log('Premium VPN product already exists, skipping.');
    } else {
        await Product.create({
            name: 'VinDri Premium',
            price: 7.99,
            description: 'Manual server selection, up to 5 devices, unlimited bandwidth, usage history, kill-switch and dedicated IP add-ons. A simulated VPN access product for this project — no real tunnel is created.',
            ratings: 0,
            images: [{ public_id: 'products/seed-premium', url: '/uploads/products/placeholder.png' }],
            category: 'VPN Service',
            serviceType: 'vpn_premium',
            seller: 'VinDri',
            stock: 999999,
            numOfReviews: 0,
            user: admin._id
        });
        console.log('Created "VinDri Premium" product.');
    }

    console.log('\nSeeding complete.');
    await mongoose.disconnect();
    process.exit(0);
}

run().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
