import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../.env' }); // Load from root

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini-lms');
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@lms.com' });
    if (existingAdmin) {
      console.log('Admin already exists!');
      existingAdmin.role = 'admin';
      existingAdmin.passwordHash = await bcrypt.hash('admin123', 10);
      await existingAdmin.save();
      console.log('Admin credentials reset: admin@lms.com / admin123');
    } else {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'System Admin',
        email: 'admin@lms.com',
        passwordHash,
        role: 'admin',
      });
      console.log('Admin created successfully: admin@lms.com / admin123');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
