# Security Checklist

## قبل الإنتاج

- [ ] `DEMO_MODE=false` (الوضع التجريبي يتوقف افتراضيًا في `NODE_ENV=production`).
- [ ] `VISITOR_HMAC_SECRET` عشوائي وطويل ولا يقل عن 32 حرفًا.
- [ ] Service Role وTurnstile وremove.bg موجودة في الخادم فقط.
- [ ] تأكيد البريد مفعل.
- [ ] OWNER عُيّن بالسكربت وMFA مفعّل.
- [ ] RLS مفعل على كل الجداول الحساسة واختُبر بحسابين.
- [ ] Redirect URLs محصورة في النطاقات الصحيحة.
- [ ] HTTPS إجباري، ولا توجد Mixed Content requests.
- [ ] Turnstile مفعل للتسجيل والتواصل.
- [ ] CSP وSecurity Headers فُحصت بعد إضافة أي مزود جديد.
- [ ] حد رفع Nginx/cPanel يطابق حد التطبيق ولا يتجاوزه كثيرًا.
- [ ] النسخ الاحتياطي والاستعادة اختُبرا.
- [ ] SMTP محمي بـ SPF/DKIM/DMARC.
- [ ] `/setup` محمي أو محذوف من الوصول العام بعد الإطلاق.
- [ ] لا يظهر أي Secret في `git grep`, Source Maps أو Network tab.

## موجود في الكود

- [x] Server-side authorization للإدارة.
- [x] Trigger يمنع حذف OWNER أو تغيير دوره.
- [x] RLS وسياسات قراءة ذاتية.
- [x] HMAC لعنوان IP دون تخزينه خامًا.
- [x] Cookie زائر HttpOnly/SameSite وموقع.
- [x] تصريح عملية قصير المدة وموقع.
- [x] Idempotency لمنع الخصم المكرر.
- [x] الخصم بعد النجاح فقط.
- [x] Rate Limiting لمسارات الاستخدام والتواصل والمزود.
- [x] Zod للتحقق من المدخلات.
- [x] فحص MIME والتوقيع السحري للصور المرسلة للخادم.
- [x] Security headers وCSP وX-Frame-Options.
- [x] منع Open Redirect في Auth callback.
- [x] رسائل أخطاء عربية لا تعرض Stack Trace.
- [x] Audit Log للإجراءات الإدارية.

## يحتاج بنية خارجية

- [ ] Rate Limiting موزع (Redis/Upstash أو Cloudflare) عند تشغيل أكثر من نسخة خادم. الذاكرة المحلية مناسبة للتطوير فقط.
- [ ] منصة مراقبة أخطاء مع تنقية البيانات الحساسة.
- [ ] فحص Malware إذا أضيف تخزين ملفات على الخادم مستقبلًا.
- [ ] اختبارات اختراق مستقلة قبل استقبال مدفوعات أو ملفات شركات.
