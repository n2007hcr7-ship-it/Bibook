/* =============================================
   BIBOOK - Frontend JavaScript
   Connected to Backend API with Auth & CRUD
   ============================================= */

// ---- State ----
let allBooks = [];
let filteredBooks = [];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'default';
let currentLang = localStorage.getItem('lang') || 'ar';

// ---- i18n Translations ----
const i18n = {
    ar: {
        searchPlaceholder: 'ابحث عن كتاب أو مؤلف...',
        login: 'دخول',
        register: 'إنشاء حساب',
        addBook: '➕ إضافة كتاب',
        logout: 'خروج',
        greeting: 'مرحباً',
        heroBadge: '✨ منصة الكتب الرقمية',
        heroTitle: 'اكتشف عالماً<br><span class="gradient-text">لا نهاية له</span>',
        heroSubtitle: 'آلاف الكتب في متناول يدك — من الأدب إلى العلوم، من التاريخ إلى الفلسفة.',
        statLabel: 'كتاب متاح',
        statCats: 'تصنيفات',
        statFree: 'قراءة مجانية',
        sectionTitle: '📖 مكتبة الكتب',
        sortDefault: 'ترتيب افتراضي',
        sortTitle: 'حسب العنوان',
        sortAuthor: 'حسب المؤلف',
        sortCat: 'حسب التصنيف',
        chipAll: 'الكل',
        loadingText: 'جاري تحميل الكتب...',
        emptyTitle: 'لا توجد نتائج',
        emptyText: 'جرّب البحث بكلمات مختلفة أو اختر تصنيفاً آخر',
        showAll: 'عرض جميع الكتب',
        readBtn: '👁 عرض التفاصيل',
        readNow: '📖 اقرأ الكتاب الآن',
        notAvailable: 'غير متاح للقراءة حالياً',
        editHint: 'لتعديل بيانات الكتاب، يجب أن تحصل على 5 أصوات.',
        footerTagline: 'مكتبتك الرقمية المفضلة',
        footerCopy: '© 2026 Bibook. جميع الحقوق محفوظة.',
        langBtn: 'EN',
        addBookTitle: 'إضافة كتاب جديد',
        addTitleLabel: 'عنوان الكتاب *',
        addAuthorLabel: 'اسم المؤلف *',
        addCatLabel: 'التصنيف',
        addCoverLabel: 'صورة الغلاف',
        addCoverPrompt: 'اسحب الصورة هنا أو اضغط للاختيار',
        addPdfLabel: 'ملف PDF *',
        addPdfPrompt: 'اسحب ملف PDF هنا أو اضغط للاختيار',
        addSubmit: 'إضافة الكتاب',
        deleteConfirm: 'هل أنت متأكد من حذف هذا الكتاب؟',
        deleteSuccess: 'تم حذف الكتاب بنجاح',
    },
    en: {
        searchPlaceholder: 'Search for a book or author...',
        login: 'Login',
        register: 'Sign Up',
        addBook: '➕ Add Book',
        logout: 'Logout',
        greeting: 'Welcome',
        heroBadge: '✨ Digital Book Platform',
        heroTitle: 'Discover a World<br><span class="gradient-text">Without Limits</span>',
        heroSubtitle: 'Thousands of books at your fingertips — from literature to science, from history to philosophy.',
        statLabel: 'Books Available',
        statCats: 'Categories',
        statFree: 'Free Reading',
        sectionTitle: '📖 Book Library',
        sortDefault: 'Default Order',
        sortTitle: 'By Title',
        sortAuthor: 'By Author',
        sortCat: 'By Category',
        chipAll: 'All',
        loadingText: 'Loading books...',
        emptyTitle: 'No Results Found',
        emptyText: 'Try different keywords or choose another category',
        showAll: 'Show All Books',
        readBtn: '👁 View Details',
        readNow: '📖 Read Book Now',
        notAvailable: 'Not available for reading yet',
        editHint: 'To edit book data, you need 5 votes from users with the same proposed edit.',
        footerTagline: 'Your favorite digital library',
        footerCopy: '© 2026 Bibook. All rights reserved.',
        langBtn: 'AR',
        addBookTitle: 'Add New Book',
        addTitleLabel: 'Book Title *',
        addAuthorLabel: 'Author Name *',
        addCatLabel: 'Category',
        addCoverLabel: 'Cover Image',
        addCoverPrompt: 'Drag image here or click to choose',
        addPdfLabel: 'PDF File *',
        addPdfPrompt: 'Drag PDF file here or click to choose',
        addSubmit: 'Add Book',
        deleteConfirm: 'Are you sure you want to delete this book?',
        deleteSuccess: 'Book deleted successfully',
    }
};

function t(key) {
    return i18n[currentLang][key] || i18n['ar'][key] || key;
}

// ---- Auth State ----
let currentUser = null; // { id: "...", name: "..." }
let authToken = localStorage.getItem('token');

// ---- DOM Elements ----
const booksContainer = document.getElementById('books-container');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const errorState = document.getElementById('error-state');
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
const filterChips = document.getElementById('filter-chips');
const sortSelect = document.getElementById('sort-select');
const booksCount = document.getElementById('books-count');
const resultsInfo = document.getElementById('results-info');
const resultsCount = document.getElementById('results-count');

// Auth DOM
const authArea = document.getElementById('auth-area');
const userArea = document.getElementById('user-area');
const userNameDisplay = document.getElementById('user-name-display');
const btnOpenLogin = document.getElementById('btn-open-login');
const btnOpenRegister = document.getElementById('btn-open-register');
const btnLogout = document.getElementById('btn-logout');

// Modals
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalContent = document.getElementById('modal-content');

const authModalOverlay = document.getElementById('auth-modal-overlay');
const authModalClose = document.getElementById('auth-modal-close');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSwitchLink = document.getElementById('auth-switch-link');
const authSwitchText = document.getElementById('auth-switch-text');
const authError = document.getElementById('auth-error');
const groupName = document.getElementById('group-name');
let isLoginMode = true;

const addBookModalOverlay = document.getElementById('add-book-modal-overlay');
const btnOpenAddBook = document.getElementById('btn-open-add-book');
const addBookModalClose = document.getElementById('add-book-modal-close');
const addBookForm = document.getElementById('add-book-form');
const addError = document.getElementById('add-error');

const editBookModalOverlay = document.getElementById('edit-book-modal-overlay');
const editBookModalClose = document.getElementById('edit-book-modal-close');
const editBookForm = document.getElementById('edit-book-form');
const editError = document.getElementById('edit-error');
const editMsg = document.getElementById('edit-msg');

// Theme
const themeToggle = document.getElementById('theme-toggle');
const navbar = document.getElementById('navbar');

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    booksContainer.style.display = 'none';
    checkAuthState();
    applyLang(currentLang, false); // apply saved lang without reloading books
    loadBooks();
});

// ---- Language Toggle ----
const htmlRoot = document.getElementById('html-root');
const langToggle = document.getElementById('lang-toggle');

function applyLang(lang, reload = true) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Direction & lang attribute
    htmlRoot.setAttribute('lang', lang);
    htmlRoot.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // Toggle button style
    langToggle.textContent = t('langBtn');
    langToggle.classList.toggle('lang-en', lang === 'en');

    // UI text updates
    document.getElementById('search-input').placeholder = t('searchPlaceholder');
    document.getElementById('btn-open-login').textContent = t('login');
    document.getElementById('btn-open-register').textContent = t('register');
    document.getElementById('btn-open-add-book').textContent = t('addBook');
    document.getElementById('btn-logout').textContent = t('logout');
    
    const greetingText = document.getElementById('greeting-text');
    if (greetingText) greetingText.textContent = t('greeting');

    // Hero
    document.querySelector('.hero-badge').innerHTML = t('heroBadge');
    document.querySelector('.hero-title').innerHTML = t('heroTitle');
    document.querySelector('.hero-subtitle').textContent = t('heroSubtitle');
    document.querySelector('.stat-label').textContent = t('statLabel');
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels[1]) statLabels[1].textContent = t('statCats');
    if (statLabels[2]) statLabels[2].textContent = t('statFree');

    // Filter section
    document.querySelector('.section-title').textContent = t('sectionTitle');
    const sortOpts = document.querySelectorAll('#sort-select option');
    if (sortOpts[0]) sortOpts[0].textContent = t('sortDefault');
    if (sortOpts[1]) sortOpts[1].textContent = t('sortTitle');
    if (sortOpts[2]) sortOpts[2].textContent = t('sortAuthor');
    if (sortOpts[3]) sortOpts[3].textContent = t('sortCat');
    const chipAll = document.querySelector('[data-category="all"]');
    if (chipAll) chipAll.textContent = t('chipAll');

    // Loading / Empty state
    const loadingP = document.querySelector('#loading-state p');
    if (loadingP) loadingP.textContent = t('loadingText');
    const emptyH3 = document.querySelector('#empty-state h3');
    if (emptyH3) emptyH3.textContent = t('emptyTitle');
    const emptyP = document.querySelector('#empty-state p');
    if (emptyP) emptyP.textContent = t('emptyText');
    const emptyBtn = document.querySelector('#empty-state .btn-primary');
    if (emptyBtn) emptyBtn.textContent = t('showAll');

    // Add Book Modal labels
    const addModalH2 = document.querySelector('#add-book-modal .modal-header h2');
    if (addModalH2) addModalH2.textContent = t('addBookTitle');
    document.getElementById('add-language').value = lang;
    
    const labelTitle = document.getElementById('label-add-title');
    if (labelTitle) labelTitle.textContent = t('addTitleLabel');
    
    const labelAuthor = document.getElementById('label-add-author');
    if (labelAuthor) labelAuthor.textContent = t('addAuthorLabel');
    
    const labelCat = document.getElementById('label-add-category');
    if (labelCat) labelCat.textContent = t('addCatLabel');
    
    const inputCat = document.getElementById('add-category');
    if (inputCat) inputCat.placeholder = currentLang === 'en' ? 'e.g. History, Novel, Self-help' : 'مثال: تاريخ، رواية، تطوير الذات';
    
    const labelCover = document.getElementById('label-add-cover');
    if (labelCover) labelCover.textContent = t('addCoverLabel');
    
    const promptCover = document.getElementById('prompt-add-cover');
    if (promptCover) promptCover.textContent = t('addCoverPrompt');
    
    const labelPdf = document.getElementById('label-add-pdf');
    if (labelPdf) labelPdf.textContent = t('addPdfLabel');
    
    const promptPdf = document.getElementById('prompt-add-pdf');
    if (promptPdf) promptPdf.textContent = t('addPdfPrompt');
    
    const btnSubmit = document.getElementById('btn-add-submit');
    if (btnSubmit) btnSubmit.textContent = t('addSubmit');

    // Footer
    const footerTagline = document.querySelector('.footer-tagline');
    if (footerTagline) footerTagline.textContent = t('footerTagline');
    const footerCopy = document.querySelector('.footer-copy');
    if (footerCopy) footerCopy.textContent = t('footerCopy');

    // Reload books in new language
    if (reload) loadBooks();
}

langToggle.addEventListener('click', () => {
    applyLang(currentLang === 'ar' ? 'en' : 'ar');
});

// ---- Auth Logic ----
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function checkAuthState() {
    if (authToken) {
        const decoded = parseJwt(authToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
            currentUser = { id: decoded.id };
            authArea.style.display = 'none';
            userArea.style.display = 'flex';
        } else {
            logout();
        }
    } else {
        authArea.style.display = 'flex';
        userArea.style.display = 'none';
        currentUser = null;
    }
}

function logout() {
    localStorage.removeItem('token');
    authToken = null;
    checkAuthState();
    applyFilters(); 
}

btnLogout.addEventListener('click', logout);

// ---- Auth Modal Logic ----
btnOpenLogin.addEventListener('click', () => openAuthModal(true));
btnOpenRegister.addEventListener('click', () => openAuthModal(false));

function openAuthModal(isLogin) {
    isLoginMode = isLogin;
    authTitle.textContent = isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد';
    authSwitchText.textContent = isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟';
    authSwitchLink.textContent = isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول';
    groupName.style.display = isLogin ? 'none' : 'block';
    if(!isLogin) document.getElementById('auth-name').required = true;
    else document.getElementById('auth-name').required = false;
    authError.style.display = 'none';
    authForm.reset();
    authModalOverlay.classList.add('active');
}

authModalClose.addEventListener('click', () => authModalOverlay.classList.remove('active'));
authSwitchLink.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal(!isLoginMode);
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.style.display = 'none';
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;

    const url = isLoginMode ? '/api/auth/login' : '/api/auth/register';
    const body = isLoginMode ? { email, password } : { email, password, name };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || data.error || 'حدث خطأ');

        if (isLoginMode) {
            localStorage.setItem('token', data.token);
            authToken = data.token;
            checkAuthState();
            authModalOverlay.classList.remove('active');
            applyFilters(); 
        } else {
            openAuthModal(true);
            authError.textContent = 'تم إنشاء الحساب بنجاح! الرجاء تسجيل الدخول.';
            authError.style.display = 'block';
            authError.style.color = '#4ade80';
            authError.style.backgroundColor = 'rgba(74, 222, 128, 0.1)';
        }
    } catch (err) {
        authError.textContent = err.message;
        authError.style.color = '#ef4444';
        authError.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        authError.style.display = 'block';
    }
});


// ---- Add Book Logic ----
btnOpenAddBook.addEventListener('click', () => {
    addError.style.display = 'none';
    addBookForm.reset();
    document.querySelectorAll(".drop-zone-thumb").forEach(thumb => thumb.remove());
    document.querySelectorAll(".drop-zone-prompt").forEach(prompt => prompt.style.display = 'block');
    addBookModalOverlay.classList.add('active');
});

addBookModalClose.addEventListener('click', () => addBookModalOverlay.classList.remove('active'));

addBookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    addError.style.display = 'none';

    const formData = new FormData();
    formData.append('title', document.getElementById('add-title').value);
    formData.append('author', document.getElementById('add-author').value);
    formData.append('category', document.getElementById('add-category').value);
    formData.append('language', currentLang);
    
    const coverFile = document.getElementById('add-cover').files[0];
    if (coverFile) formData.append('coverFile', coverFile);
    
    const pdfFile = document.getElementById('add-path').files[0];
    if (pdfFile) formData.append('pdfFile', pdfFile);

    try {
        const res = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || 'حدث خطأ في الإضافة');

        addBookModalOverlay.classList.remove('active');
        await loadBooks(); 
    } catch (err) {
        addError.textContent = err.message;
        addError.style.display = 'block';
    }
});

// ---- Drag and Drop Logic ----
document.querySelectorAll(".drop-zone-input").forEach((inputElement) => {
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("click", (e) => {
        inputElement.click();
    });

    inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach((type) => {
        dropZoneElement.addEventListener(type, (e) => {
            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }
        dropZoneElement.classList.remove("drop-zone--over");
    });
});

function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone-thumb");
    const promptElement = dropZoneElement.querySelector(".drop-zone-prompt");

    if (promptElement) {
        promptElement.style.display = 'none';
    }

    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone-thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;

    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
        };
    } else {
        thumbnailElement.style.backgroundImage = null;
    }
}

// ---- Edit Book (Vote) Logic ----
function openEditModal(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    document.getElementById('edit-book-id').value = book.id;
    document.getElementById('edit-title').value = book.title;
    document.getElementById('edit-author').value = book.author;
    editError.style.display = 'none';
    editMsg.style.display = 'none';
    editBookModalOverlay.classList.add('active');
}

editBookModalClose.addEventListener('click', () => editBookModalOverlay.classList.remove('active'));

editBookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    editError.style.display = 'none';
    editMsg.style.display = 'none';

    const bookId = document.getElementById('edit-book-id').value;
    const body = {
        newTitle: document.getElementById('edit-title').value,
        newAuthor: document.getElementById('edit-author').value
    };

    try {
        const res = await fetch(`/api/edit-requests/${bookId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || 'حدث خطأ');

        editMsg.textContent = data.message;
        editMsg.style.display = 'block';
        
        if(data.message.includes('تم تطبيق التعديل')) {
            setTimeout(() => {
                editBookModalOverlay.classList.remove('active');
                loadBooks();
            }, 2000);
        }
    } catch (err) {
        editError.textContent = err.message;
        editError.style.display = 'block';
    }
});

// ---- Delete Book Logic ----
async function deleteBook(bookId) {
    if (!confirm(t('deleteConfirm'))) return;

    try {
        const res = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || 'Error deleting book');
        
        alert(t('deleteSuccess'));
        await loadBooks();
    } catch (err) {
        alert(err.message);
    }
}


// ---- Theme Toggle ----
let isDark = true;
themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
});

// ---- Navbar Scroll Effect ----
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ---- Fetch Books from API ----
async function loadBooks() {
    showState('loading');

    try {
        const response = await fetch(`/api/books?lang=${currentLang}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        
        const books = await response.json();
        allBooks = books;

        animateCounter(booksCount, books.length);
        buildCategoryChips(books);
        applyFilters();
    } catch (err) {
        console.error('فشل تحميل الكتب:', err);
        document.getElementById('error-message').textContent = err.message || 'Connection failed';
        showState('error');
    }
}

// ---- Animate Number Counter ----
function animateCounter(el, target) {
    let current = 0;
    const step = Math.ceil(target / 30) || 1;
    const interval = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(interval);
    }, 40);
}

// ---- Build Category Filter Chips ----
function buildCategoryChips(books) {
    const categories = [...new Set(books.map(b => b.category).filter(Boolean))];
    const existingAll = filterChips.querySelector('[data-category="all"]');
    filterChips.innerHTML = '';
    filterChips.appendChild(existingAll);

    categories.forEach(cat => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.dataset.category = cat;
        chip.textContent = cat;
        chip.addEventListener('click', () => filterByCategory(cat, chip));
        filterChips.appendChild(chip);
    });

    existingAll.addEventListener('click', () => filterByCategory('all', existingAll));
}

// ---- Filter by Category ----
function filterByCategory(category, chipEl) {
    currentCategory = category;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chipEl.classList.add('active');
    applyFilters();
}

// ---- Search & Sort ----
searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim();
    searchClear.style.display = currentSearch ? 'block' : 'none';
    applyFilters();
});

searchClear.addEventListener('click', () => {
    searchInput.value = '';
    currentSearch = '';
    searchClear.style.display = 'none';
    applyFilters();
    searchInput.focus();
});

sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    applyFilters();
});

// ---- Apply All Filters ----
function applyFilters() {
    let result = [...allBooks];

    if (currentCategory !== 'all') {
        result = result.filter(b => b.category === currentCategory);
    }

    if (currentSearch) {
        const term = currentSearch.toLowerCase();
        result = result.filter(b =>
            b.title?.toLowerCase().includes(term) ||
            b.author?.toLowerCase().includes(term) ||
            b.category?.toLowerCase().includes(term)
        );
    }

    const locale = currentLang === 'ar' ? 'ar' : 'en';
    if (currentSort === 'title') {
        result.sort((a, b) => a.title.localeCompare(b.title, locale));
    } else if (currentSort === 'author') {
        result.sort((a, b) => a.author.localeCompare(b.author, locale));
    } else if (currentSort === 'category') {
        result.sort((a, b) => (a.category || '').localeCompare(b.category || '', locale));
    }

    filteredBooks = result;
    renderBooks(result);
}

// ---- Render Books ----
function renderBooks(books) {
    if (books.length === 0) {
        showState('empty');
        return;
    }

    showState('books');

    if (currentSearch || currentCategory !== 'all') {
        resultsInfo.style.display = 'block';
        resultsCount.textContent = `عُثر على ${books.length} كتاب${books.length === 1 ? '' : ''}`;
    } else {
        resultsInfo.style.display = 'none';
    }

    booksContainer.innerHTML = '';
    books.forEach((book, index) => {
        const card = createBookCard(book, index);
        booksContainer.appendChild(card);
    });
}

// ---- Create Book Card ----
function createBookCard(book, index) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.style.animationDelay = `${index * 0.06}s`;

    let actionButtons = '';
    if (currentUser) {
        // Edit button visible to any logged in user (for voting)
        actionButtons += `<button class="btn-icon edit" onclick="event.stopPropagation(); openEditModal(${book.id})" title="اقتراح تعديل">✏️</button>`;
        
        // Delete button visible ONLY if current user is the author
        if (book.authorId === currentUser.id) {
            actionButtons += `<button class="btn-icon delete" onclick="event.stopPropagation(); deleteBook(${book.id})" title="حذف الكتاب">🗑️</button>`;
        }
    }

    card.innerHTML = `
        <div class="book-cover">
            ${actionButtons ? `<div class="book-card-actions">${actionButtons}</div>` : ''}
            ${book.coverUrl ? `<img src="${book.coverUrl}" alt="${book.title}" loading="lazy" onerror="this.style.display='none';">` : getPlaceholderHTML(book)}
            ${book.category ? `<span class="book-category-badge">${book.category}</span>` : ''}
            <div class="book-overlay">
                <button class="book-read-btn" onclick="openModal(${book.id})">${t('readBtn')}</button>
            </div>
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">${book.author}</p>
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-icon') && !e.target.classList.contains('book-read-btn')) {
            openModal(book.id);
        }
    });

    return card;
}

// ---- Placeholder HTML for books without cover ----
function getPlaceholderHTML(book) {
    const letter = book.title ? book.title[0] : '📖';
    return `<div class="book-cover-placeholder">
        <span class="book-emoji">📖</span>
        <span class="book-letter">${letter}</span>
    </div>`;
}

// ---- Open Book Modal ----
function openModal(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    const coverContent = book.coverUrl
        ? `<img class="modal-cover" src="${book.coverUrl}" alt="${book.title}" onerror="this.outerHTML='<div class=\\'modal-cover-placeholder\\'>📖</div>'">`
        : `<div class="modal-cover-placeholder">📖</div>`;

    const readBtn = book.bookPath
        ? `<a href="${book.bookPath}" target="_blank" class="btn-read">${t('readNow')}</a>`
        : `<button class="btn-read" style="opacity:0.6;cursor:default;">${t('notAvailable')}</button>`;

    modalContent.innerHTML = `
        ${coverContent}
        <div class="modal-body">
            ${book.category ? `<span class="modal-category">${book.category}</span>` : ''}
            <h2 class="modal-title">${book.title}</h2>
            <p class="modal-author">✍️ ${book.author}</p>
            <div class="modal-actions">
                ${readBtn}
            </div>
        </div>
    `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ---- Close Modals ----
function closeViewModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}
modalClose.addEventListener('click', closeViewModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeViewModal();
});

// Close all modals on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeViewModal();
        authModalOverlay.classList.remove('active');
        addBookModalOverlay.classList.remove('active');
        editBookModalOverlay.classList.remove('active');
    }
});

// ---- Show/Hide States ----
function showState(state) {
    loadingState.style.display = state === 'loading' ? 'flex' : 'none';
    emptyState.style.display = state === 'empty' ? 'flex' : 'none';
    errorState.style.display = state === 'error' ? 'flex' : 'none';
    booksContainer.style.display = state === 'books' ? 'grid' : 'none';
}

// ---- Reset All Filters ----
function resetFilters() {
    currentCategory = 'all';
    currentSearch = '';
    currentSort = 'default';
    searchInput.value = '';
    searchClear.style.display = 'none';
    sortSelect.value = 'default';
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-category="all"]')?.classList.add('active');
    applyFilters();
}