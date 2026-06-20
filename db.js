// db.js
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); // ضروري لقراءة رابط قاعدة البيانات من ملف .env

// إعداد الاتصال بقاعدة البيانات
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// تصدير كائن prisma لاستخدامه في الملفات الأخرى
module.exports = prisma;