
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

// Minimal User Schema for seeding
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['student', 'admin', 'super-admin'], default: 'student' },
    preferences: {
        eventCategories: [{ type: String }],
        notifications: { type: Boolean, default: true },
    },
    interests: [{ type: String }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to Database');

        const adminEmail = 'admin@campusflow.com';
        const adminPassword = 'adminpassword123';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists');
        } else {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            await User.create({
                name: 'Campus Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                interests: [],
                preferences: {
                    eventCategories: [],
                    notifications: true
                }
            });
            console.log('Admin user created successfully');
        }

        console.log('Credentials:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from Database');
    }
}

seedAdmin();
