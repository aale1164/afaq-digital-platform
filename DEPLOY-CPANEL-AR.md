# نشر منصة آفاق على cPanel

## شرط أساسي

يجب أن تحتوي الاستضافة على **Setup Node.js App** أو **Application Manager** وأن تدعم Node.js 20.9 فأحدث. إذا كانت الاستضافة تعرض ملفات HTML/PHP فقط فلن تشغّل هذا المشروع؛ استخدم VPS أو استضافة تدعم Next.js.

## الخطوات

1. ارفع ملفات المشروع دون `node_modules` ودون `.env.local`.
2. أنشئ تطبيق Node.js وحدد Node.js 22 إن توفر.
3. اجعل جذر التطبيق هو مجلد المشروع الذي يحتوي `package.json`.
4. من Terminal داخل cPanel:

```bash
npm ci
npm run build
```

5. اجعل أمر التشغيل:

```bash
npm start
```

6. لا تثبت رقم PORT يدويًا إذا كان cPanel يمرره للتطبيق.
7. أضف متغيرات `.env.example` من واجهة Environment Variables. لا تجعل القيم السرية `NEXT_PUBLIC_`.
8. أعد تشغيل التطبيق من لوحة cPanel.
9. افتح `/api/health` ثم `/setup`.

## متغيرات NEXT_PUBLIC

Next.js يضمّن المتغيرات العامة وقت `npm run build`. لذلك ضع قيم النطاق وSupabase العامة قبل البناء، ثم أعد البناء إذا تغيرت.

## النطاق وSSL

- اربط النطاق بالتطبيق عبر cPanel.
- فعّل AutoSSL.
- ضع `NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN`.
- أضف `https://YOUR_DOMAIN/auth/callback` في Supabase.
- اضبط `DEMO_MODE=false` في الإنتاج. لا يحتاج هذا المتغير إلى بادئة `NEXT_PUBLIC_`.

## إذا ظهر 503

راجع بالترتيب:

1. سجل التطبيق في cPanel.
2. إصدار Node.js.
3. نجاح `npm run build`.
4. وجود متغيرات البيئة.
5. هل أمر التشغيل هو `npm start` وليس فتح `server.js` من مسار خاطئ؟

لا تحوّل المشروع إلى HTML ثابت لحل المشكلة؛ ستفقد المصادقة ولوحة الإدارة ومسارات الخادم.
