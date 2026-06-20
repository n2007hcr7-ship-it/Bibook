require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. تأكد من وجود مستخدم (أو أنشئ مستخدم تجريبي)
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { email: 'admin@test.com', name: 'Admin', password: 'password123' }
    });
  }

  // 1. هنا مصفوفة الكتب الخاصة بك (البيانات)
  const booksAR = [
    {
      title: 'مقدمة ابن خلدون',
      author: 'ابن خلدون',
      category: 'تاريخ',
      coverUrl: '/Background-AR/ibn-khaldun.jpg',
      bookPath: '/Pages-AR/ibn-khaldun.pdf'
    },
    {
      title: 'العادات الذرية',
      author: 'جيمس كلير',
      category: 'تطوير الذات',
      coverUrl: '/Background-AR/atomic-habits.jpg',
      bookPath: '/Pages-AR/atomic-habits.pdf'
    },
    {
      title: 'الخيميائي',
      author: 'باولو كويلو',
      category: 'رواية',
      coverUrl: '/Background-AR/the-alchemist.jpg',
      bookPath: '/Pages-AR/the-alchemist.pdf'
    },
    {
      title: 'ثلاثية غرناطة',
      author: 'رضوى عاشور',
      category: 'رواية تاريخية',
      coverUrl: '/Background-AR/three-golden-rules.jpg',
      bookPath: '/Pages-AR/three-golden-rules.pdf'
    },
    {
      title: 'فن اللامبالاة',
      author: 'مارك مانسون',
      category: 'تطوير الذات',
      coverUrl: '/Background-AR/the-art-of-not-giving-a-fuck.jpg',
      bookPath: '/Pages-AR/the-art-of-not-giving-a-fuck.pdf'
    },
    {
        title: 'مثل الزارع',  
        author: 'أوكتافيا باتلر',
        category: 'رواية',
        coverUrl: '/Background-AR/the-parable-of-the-sower.jpg',
        bookPath: '/Pages-AR/the-parable-of-the-sower.pdf'
    },
  ];

  const booksEN = [
    {
      title: 'Rich Dad Poor Dad',
      author: 'Robert Kiyosaki',
      category: 'Business',
      coverUrl: '/Background-EN/rich-dad-poor-dad.jpg',
      bookPath: '/Pages-EN/rich-dad-poor-dad.pdf'
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      category: 'Self-Development',
      coverUrl: '/Background-EN/Atomic habits.jpg',
      bookPath: '/Pages-EN/Atomic habits.pdf'
    },
    {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      category: 'Fiction',
      coverUrl: '/Background-EN/The-Alchemist-Paulo-Coelho.jpg',
      bookPath: '/Pages-EN/The-Alchemist-Paulo-Coelho.pdf'
    },
    {
      title: 'The Subtle Art of Not Giving a F*ck',
      author: 'Mark Manson',
      category: 'Self-Development',
      coverUrl: '/Background-EN/the-subtle-art-of-not-giving-a-f.jpg',
      bookPath: '/Pages-EN/the-subtle-art-of-not-giving-a-fk.pdf'
    },
    {
        title: 'Thus Spake Zarathustra',  
        author: 'Friedrich Nietzsche',
        category: 'Philosophy',
        coverUrl: '/Background-EN/thus spake zarathustra.jpg',
        bookPath: '/Pages-EN/thus spake zarathustra.pdf'
    },
  ];

console.log('بدء عملية الـ Seeding...');

  // 1. معالجة الكتب العربية
  for (const book of booksAR) {
    await prisma.book.upsert({
      // نستخدم مزيج العنوان واللغة للبحث (شرط أن يكون لديك @@unique([title, language]))
      where: { 
        title_language: { title: book.title, language: 'ar' } 
      },
      update: {
        coverUrl: book.coverUrl,
        bookPath: book.bookPath,
        author: book.author,
        category: book.category,
      },
      create: {
        ...book,
        language: 'ar', // تحديد اللغة
        user: { connect: { id: user.id } }
      },
    });
    console.log(`تم إضافة/تحديث الكتاب العربي: ${book.title}`);
  }

  // 2. معالجة الكتب الإنجليزية
  for (const book of booksEN) {
    await prisma.book.upsert({
      where: { 
        title_language: { title: book.title, language: 'en' } 
      },
      update: {
        coverUrl: book.coverUrl,
        bookPath: book.bookPath,
        author: book.author,
        category: book.category,
      },
      create: {
        ...book,
        language: 'en', // تحديد اللغة
        user: { connect: { id: user.id } }
      },
    });
    console.log(`تم إضافة/تحديث الكتاب الإنجليزي: ${book.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });