# منصة آفاق الرقمية

منصة عربية Full‑Stack مستقلة للأدوات الرقمية، بتوقيع **برمجة وتطوير عدناني** وربط موحد بحساب X: [@aale1164](https://x.com/aale1164?s=20).

## ما الذي يعمل بعد فك الضغط؟

يعمل المشروع مباشرة في وضع استعراضي دون مفاتيح خارجية، وتشمل الأدوات الجاهزة:

1. محرر صور عربي: صورة أساسية، نصوص، صور إضافية، سحب، تحجيم، تدوير، قص تفاعلي وتصدير.
2. معالجة صور دُفعية: ضغط، تغيير مقاس، PNG/JPG/WEBP وZIP.
3. علامة مائية جماعية: نص أو شعار، 9 مواضع، حجم وشفافية وZIP.
4. استوديو QR: رابط، نص، هاتف، بريد، Wi‑Fi، ألوان، شعار، PNG وSVG.
5. مختبر المطور: JSON وBase64 وUUID وHash وURL وTimestamp وJWT وRegex.
6. إزالة الخلفية: Adapter حقيقي وآمن، ويحتاج مفتاح `remove.bg` ليعمل.

الحسابات ولوحة الإدارة تستخدم بيانات عرض آمنة إلى أن تربط Supabase. لا توجد أزرار دفع أو متجر ظاهر.

## 1. التشغيل السريع

المتطلبات: Node.js 20.9 أو أحدث، ويوصى بـ Node.js 22 LTS، وnpm.

```bash
npm install
npm run dev
```

افتح:

```text
http://localhost:3000
```

في `npm run dev` يعمل العرض التجريبي تلقائيًا. صفحة فحص الإعداد:

```text
http://localhost:3000/setup
```

لوحة المالك الاستعراضية:

```text
http://localhost:3000/admin
```

## 2. إنشاء ملف البيئة

انسخ الملف دون وضع أي سر في Git:

```bash
cp .env.example .env.local
```

أنشئ مفتاح بصمة طويلًا:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

ضع الناتج في:

```text
VISITOR_HMAC_SECRET=
```

رابط X مضبوط من مكان واحد:

```text
NEXT_PUBLIC_X_URL=https://x.com/aale1164?s=20
```

## 3. ربط Supabase

التفاصيل الكاملة في `DATABASE-SETUP-AR.md`. باختصار:

1. أنشئ مشروع Supabase.
2. نفّذ `database/migrations/001_initial_schema.sql` في SQL Editor.
3. انسخ Project URL وAnon Key وService Role Key إلى `.env.local`.
4. لا تضع `SUPABASE_SERVICE_ROLE_KEY` في متغير يبدأ بـ `NEXT_PUBLIC_`.
5. أضف Redirect URL: `http://localhost:3000/auth/callback`.
6. أعد تشغيل المشروع.

## 4. إنشاء حساب OWNER

1. ضع بريدك في `OWNER_EMAIL`.
2. سجّل من `/register` وأكد البريد.
3. شغّل:

```bash
npm run bootstrap:owner
```

4. ادخل `/admin/settings` وفعّل MFA بواسطة تطبيق TOTP.

حماية OWNER موجودة أيضًا في Trigger داخل PostgreSQL؛ لا يستطيع ADMIN حذفه أو تغيير دوره.

## 5. إزالة الخلفية

أنشئ مفتاحًا لدى remove.bg ثم ضعه في الخادم فقط:

```text
BACKGROUND_REMOVAL_PROVIDER=remove-bg
REMOVE_BG_API_KEY=...
```

إذا لم يوجد المفتاح، تعرض الأداة تعليمات واضحة ولا ترفع الصورة ولا تعطي نتيجة وهمية.

## 6. Cloudflare Turnstile

ضع:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

في التطوير يمكن تركهما فارغين. في الإنتاج يوصى بتفعيلهما للتسجيل والتواصل والعمليات الحساسة.

## 7. الاختبارات والبناء

```bash
npm run type-check
npm run lint
npm test
npm run build
```

أو جميعها:

```bash
npm run check
```

لا تنتقل إلى الإنتاج إذا فشل `build`.

## 8. رفع المشروع إلى GitHub

```bash
git init
git add .
git commit -m "Initial AFAQ Digital platform"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

تحقق قبل `git add` أن `.env.local` غير ظاهر في `git status`.

## 9. النشر

- cPanel مع Node.js/Application Manager: راجع `DEPLOY-CPANEL-AR.md`.
- VPS أو Docker: راجع `DEPLOY-VPS-AR.md`.
- قاعدة البيانات: راجع `DATABASE-SETUP-AR.md`.
- الحماية: راجع `SECURITY-CHECKLIST.md`.
- الحالة الصريحة: راجع `PROJECT-STATUS.md`.

## ملاحظات مهمة

- الثلاث عمليات تُحسب من الخادم بعد نجاح الأداة، لا بعد الضغط على الزر.
- الوضع المحلي يستخدم ذاكرة الخادم للتجربة؛ Supabase مطلوب لعداد دائم متعدد الخوادم.
- لا تحفظ أدوات الصور المحلية الملفات في قاعدة البيانات.
- المتجر وDeveloper API مخفيان افتراضيًا بواسطة Feature Flags.
- لا توجد مفاتيح حقيقية داخل المشروع أو ملف ZIP.
