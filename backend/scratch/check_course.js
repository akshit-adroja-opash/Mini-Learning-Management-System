import mongoose from 'mongoose';
import Course from '../src/models/Course.js';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config();

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini-lms');
  const course = await Course.findOne({ title: /Master Queues/ });
  console.log('Course Data:', JSON.stringify(course, null, 2));
  process.exit();
};

check();
