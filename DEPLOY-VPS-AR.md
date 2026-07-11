# نشر منصة آفاق على VPS أو Docker

## الخيار الموصى به: Docker Compose

ثبت Docker وCompose، ثم أنشئ `.env.local` من `.env.example`.

```bash
docker compose build --no-cache
docker compose up -d
docker compose ps
```

اختبر:

```bash
curl http://127.0.0.1:3000/api/health
```

الـ container يعمل بمستخدم غير root، ونظام الملفات Read‑only مع `/tmp` مؤقت.

## Nginx أمام التطبيق

مثال أولي، عدّل النطاق والشهادة:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name YOUR_DOMAIN;

    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

استخدم Certbot أو مدير شهادات موثوق. لا تعرض المنفذ 3000 للإنترنت إذا كان Nginx على الخادم نفسه؛ قيده بجدار الحماية أو bind إلى loopback عند الحاجة.

## نشر Node.js دون Docker

```bash
npm ci
npm run check
npm run build
NODE_ENV=production npm start
```

استخدم systemd أو مدير عمليات موثوق. لا تشغل الجلسة داخل Terminal وتغلقه.

## التحديث

1. خذ نسخة قاعدة بيانات أو تأكد من النسخ الآلي.
2. طبّق المهاجرات الجديدة أولًا حسب تعليماتها.
3. ابنِ صورة جديدة.
4. افحص Health Check.
5. احتفظ بالصورة السابقة للرجوع السريع.

## السجلات

لا تسجل كلمات مرور أو JWT أو API Keys أو محتوى ملفات المستخدمين. راقب عدد أخطاء 5xx ووقت الاستجابة واستهلاك الذاكرة، وضع تنبيهًا عند فشل `/api/health`.
