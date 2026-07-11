# Changelog

## 1.0.0 — 2026-07-11

### Added

- تأسيس منصة آفاق الرقمية بهوية عربية أصلية وتوقيع «برمجة وتطوير عدناني».
- ست أدوات إصدار أول حقيقية مع Tool Registry قابل للتوسع.
- مصادقة Supabase، تأكيد البريد، استعادة كلمة المرور وملفات المستخدمين.
- لوحة مستخدم ولوحة OWNER/ADMIN متجاوبة.
- نظام ثلاث عمليات للزائر ببصمة HMAC وتصريح موقع وخصم بعد النجاح.
- PostgreSQL schema وRLS وTriggers ودوال ذرية للاستخدام وCredits.
- حماية OWNER وMFA/TOTP وAudit Logs.
- بنية باقات ومتجر وDeveloper API مخفية بواسطة Feature Flags.
- صفحات قانونية وإعداد أولي وHealth Check وأخطاء عربية.
- Docker وCompose ووثائق cPanel وVPS وقاعدة البيانات والحماية.
- اختبارات للصلاحيات والحدود وسجل الأدوات ومعالجة الأبعاد.

### Security

- مفاتيح Service Role والمزود لا تصل إلى المتصفح.
- فحص نوع وتوقيع الصور المرسلة لإزالة الخلفية.
- CSP وSecurity headers وRate Limiting ومنع Open Redirect.
