# إعداد قاعدة البيانات والمصادقة

## 1. إنشاء Supabase

1. أنشئ مشروعًا جديدًا من Supabase.
2. اختر منطقة قريبة من جمهورك إن كانت متاحة.
3. احتفظ بكلمة مرور قاعدة البيانات في مدير كلمات مرور.
4. من Project Settings → API انسخ:
   - Project URL إلى `NEXT_PUBLIC_SUPABASE_URL`.
   - anon/public key إلى `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - service_role key إلى `SUPABASE_SERVICE_ROLE_KEY` في الخادم فقط.

## 2. تطبيق المخطط

افتح SQL Editor والصق محتوى:

```text
database/migrations/001_initial_schema.sql
```

نفّذه مرة واحدة. المهاجرة تنشئ الجداول المطلوبة، سجل الأدوات، الباقات، Feature Flags، RLS، Triggers حماية OWNER ودوال الخصم الذرية.

## 3. إعداد Auth

من Authentication → URL Configuration:

```text
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/auth/callback
```

في الإنتاج استبدل النطاق وأضف:

```text
https://YOUR_DOMAIN/auth/callback
```

فعّل Email confirmation. لا تعطل التأكيد في الإنتاج.

## 4. قالب رسالة تأكيد عربي مقترح

العنوان:

```text
تأكيد حسابك في منصة آفاق الرقمية
```

النص:

```html
<div dir="rtl" style="font-family:Tahoma,Arial;line-height:1.8">
  <h2>مرحبًا بك في منصة آفاق الرقمية</h2>
  <p>اضغط الزر لتأكيد بريدك وإكمال حماية الحساب.</p>
  <p><a href="{{ .ConfirmationURL }}">تأكيد البريد الإلكتروني</a></p>
  <p>إذا لم تنشئ الحساب، تجاهل الرسالة.</p>
  <small>برمجة وتطوير عدناني</small>
</div>
```

استخدم متغير Supabase الصحيح كما يظهر في محرر القالب؛ لا تستبدل رابط التأكيد برابط ثابت.

## 5. SMTP

يمكن البدء بمزود Supabase التجريبي، لكنه غير مناسب للإرسال التجاري الكثيف. اربط SMTP موثوقًا، واضبط SPF وDKIM وDMARC لنطاقك.

## 6. تعيين OWNER

ضع البريد نفسه في:

```text
OWNER_EMAIL=you@example.com
```

سجّل الحساب وأكده، ثم:

```bash
npm run bootstrap:owner
```

السكربت لا ينشئ مستخدمًا ولا يعرف كلمة مروره؛ يمنح الدور لحساب موجود ومؤكد. بعدها فعّل TOTP من `/admin/settings`.

## 7. فحص RLS

استخدم حسابين عاديين واختبر أن:

- كل حساب يرى ملفه واستخدامه فقط.
- لا يستطيع USER قراءة `admin_audit_logs` أو `anonymous_usage`.
- لا يستطيع ADMIN حذف OWNER أو تغيير دوره.
- لا يستطيع المتصفح استدعاء دوال خصم الاستخدام أو منح Credits مباشرة.
- Service Role لا يظهر في Network tab أو ملفات JavaScript المبنية.

## 8. النسخ الاحتياطي

قبل الإطلاق، فعّل النسخ الاحتياطي المناسب لخطة Supabase، واختبر استعادة نسخة في مشروع تجريبي. النسخة غير المختبرة ليست خطة استعادة.
