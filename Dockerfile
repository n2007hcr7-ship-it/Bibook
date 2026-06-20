FROM node:lts-alpine

WORKDIR /app

# نسخ ملفات الإعدادات أولاً (لتحسين سرعة البناء)
COPY package*.json ./

# تثبيت المكتبات داخل الحاوية
RUN npm install

# نسخ باقي ملفات المشروع
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]