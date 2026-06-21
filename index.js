require('dotenv').config();
const express = require('express');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const path = require('path');
const prisma = require('./db');
const app = express();
app.use(express.json());
const port = 3000;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// إعداد التخزين للملفات (Multer)
const supabase = require('./config/supabase'); // تأكد من إنشاء هذا الملف


const upload = multer({ storage: multer.memoryStorage() }); // تخزين مؤقت في الرام للرفع السحابي

// 1. مسار التسجيل (Register)
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name }
        });
        res.status(201).json({ message: "تم إنشاء الحساب بنجاح!" });
    } catch (err) {
        res.status(400).json({ error: "البريد الإلكتروني موجود بالفعل" });
    }
});

// 2. مسار الدخول (Login)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public')));
// --- مسارات المكتبة باستخدام Prisma ---



const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET // سيقرأه من ملف .env الآن
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: jwt_payload.id } });
    if (user) {
      return done(null, user); // المستخدم موجود
    }
    return done(null, false); // المستخدم غير موجود
  } catch (err) {
    return done(err, false);
  }
}));

// 1. مسار جلب جميع الكتب (من قاعدة البيانات مباشرة)
app.get('/api/books', async (req, res) => {
  const lang = req.query.lang || 'ar'; // إذا لم يرسل المستخدم لغة، افترض أنها العربية
  
  const books = await prisma.book.findMany({
    where: { language: lang },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(books);
});
app.use(passport.initialize());
const authenticate = passport.authenticate('jwt', { session: false });

app.post('/api/books', authenticate, upload.fields([{ name: 'coverFile', maxCount: 1 }, { name: 'pdfFile', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, author, category, language } = req.body;
    let bookPath = null;

    // رفع ملف الـ PDF إلى Supabase
    if (req.files && req.files['pdfFile']) {
      const file = req.files['pdfFile'][0];
      const fileName = `user-uploads/${Date.now()}_${file.originalname}`;
      
      const { data, error } = await supabase.storage
        .from('books-bucket')
        .upload(fileName, file.buffer, { contentType: 'application/pdf' });

      if (error) throw error;
      
      // الحصول على الرابط السحابي
      const { data: urlData } = supabase.storage.from('books-bucket').getPublicUrl(fileName);
      bookPath = urlData.publicUrl;
    }

    // حفظ في قاعدة البيانات
    const newBook = await prisma.book.create({
      data: { 
        title, 
        author, 
        category, 
        bookPath, 
        language: language || 'ar',
        authorId: req.user.id,
        isSystemBook: false // كتاب مستخدم
      }
    });
    
    res.status(201).json(newBook);
  } catch (err) {
    console.error('خطأ في الرفع:', err);
    res.status(500).json({ error: 'تعذر رفع الكتاب' });
  }
});
// 2.5 مسار اقتراح تعديل على كتاب أو التصويت عليه
app.post('/api/edit-requests/:bookId', authenticate, async (req, res) => {
  const userId = req.user.id;
  const bookId = parseInt(req.params.bookId);
  const { newTitle, newAuthor } = req.body;

  try {
    // التحقق من وجود الكتاب
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return res.status(404).json({ message: "الكتاب غير موجود" });

    // البحث عن طلب تعديل مطابق معلق
    const existingRequest = await prisma.editRequest.findFirst({
      where: {
        bookId: bookId,
        newTitle: newTitle,
        newAuthor: newAuthor,
        status: 'PENDING'
      },
      include: { approvals: true }
    });

    if (existingRequest) {
      // التحقق من عدم تصويت المستخدم مسبقاً
      const hasVoted = existingRequest.approvals.some(user => user.id === userId);
      if (hasVoted) return res.status(400).json({ message: "لقد قمت بالتصويت على هذا التعديل مسبقاً!" });

      // إضافة صوت جديد (موافقة)
      const updatedRequest = await prisma.editRequest.update({
        where: { id: existingRequest.id },
        data: { approvals: { connect: { id: userId } } },
        include: { approvals: true }
      });

      // التحقق من اكتمال 5 أصوات
      if (updatedRequest.approvals.length >= 5) {
        await prisma.book.update({
          where: { id: bookId },
          data: { title: newTitle, author: newAuthor }
        });
        await prisma.editRequest.update({
          where: { id: existingRequest.id },
          data: { status: 'APPROVED' }
        });
        return res.json({ message: "اكتملت 5 أصوات! تم تطبيق التعديل على الكتاب بنجاح." });
      }

      return res.json({ message: `تم تسجيل تعديلك كتصويت. الأصوات الحالية: ${updatedRequest.approvals.length} / 5` });
    } else {
      // إنشاء طلب تعديل جديد وإضافة المستخدم كأول مصوت
      await prisma.editRequest.create({
        data: {
          bookId: bookId,
          newTitle: newTitle,
          newAuthor: newAuthor,
          status: 'PENDING',
          approvals: { connect: { id: userId } }
        }
      });
      return res.status(201).json({ message: "تم إنشاء طلب التعديل! تحتاج إلى 4 أصوات أخرى لتطبيقه." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء معالجة طلب التعديل" });
  }
});

// 3. مسار تعديل كتاب (PUT)
app.put('/api/edit-requests/:requestId/approve', authenticate, async (req, res) => {
  const userId = req.user.id; 
  const requestId = parseInt(req.params.requestId);

  try {
    // 1. جلب الطلب مع قائمة الموافقين
    const editRequest = await prisma.editRequest.findUnique({
      where: { id: requestId },
      include: { approvals: true }
    });

    if (!editRequest) return res.status(404).json({ message: "الطلب غير موجود" });

    // 2. التحقق من أن المستخدم لم يصوت من قبل
    const hasAlreadyVoted = editRequest.approvals.some(user => user.id === userId);
    
    if (hasAlreadyVoted) {
      return res.status(400).json({ message: "لقد قمت بالتصويت مسبقاً!" });
    }

    // 3. تحديث الطلب بإضافة الموافقة (استخدام connect كما هو مطلوب في Prisma)
    const updatedRequest = await prisma.editRequest.update({
      where: { id: requestId },
      data: {
        approvals: { connect: { id: userId } }
      },
      include: { approvals: true }
    });

    // 4. التحقق من اكتمال النصاب (5 أصوات)
    if (updatedRequest.approvals.length >= 5) {
      // تحديث الكتاب الأصلي
      await prisma.book.update({
        where: { id: updatedRequest.bookId },
        data: {
          title: updatedRequest.newTitle,
          author: updatedRequest.newAuthor
        }
      });

      // إغلاق الطلب
      await prisma.editRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' }
      });
      
      return res.json({ message: "تمت الموافقة! الكتاب الآن محدث." });
    }

    res.json({ message: `تم تسجيل صوتك. المتبقي: ${5 - updatedRequest.approvals.length} أصوات.` });

  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// 4. مسار حذف كتاب (DELETE)
app.delete('/api/books/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id; // هذا الـ ID يأتي من جلسة المستخدم (بعد تسجيل الدخول)

  try {
    // 1. جلب الكتاب للتحقق من مؤلفه
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) }
    });

    if (!book) {
      return res.status(404).json({ message: "الكتاب غير موجود" });
    }

    // 2. التحقق من أن المستخدم هو نفسه صاحب الكتاب
    if (book.authorId !== currentUserId) {
      return res.status(403).json({ message: "خطأ: لا تملك صلاحية حذف هذا الكتاب، أنت لست المؤلف!" });
    }

    // 3. إذا كان هو المؤلف، نحذف الكتاب
    await prisma.book.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "تم حذف الكتاب بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

app.listen(port, () => {
  console.log(`المكتبة تعمل الآن بـ Prisma على الرابط: http://localhost:${port}`);
});