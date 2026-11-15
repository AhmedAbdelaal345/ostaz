import { type FormEvent, useEffect, useState } from "react";
import { GraduationCap, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { navigateAfterTeacherLogin } from "@/lib/applicationRoutes";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthFlowControls } from "@/components/AuthFlowControls";
import { clearAuthPhoneDraft, readAuthPhoneDraft, saveAuthPhoneDraft } from "@/lib/authDraft";
import { localizeAuthMessage } from "@/lib/authMessages";
import {
  isValidAuthPassword,
  isValidAuthPhone,
  isValidRegistrationName,
  isValidRegistrationSubject,
} from "../../../shared/authValidation";

export default function TeacherPortal() {
  const { language, setLanguage, isRtl } = useLanguage();
  const [location, setLocation] = useLocation();
  const isRegister = location === "/teacher/register";
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [phone, setPhone] = useState(() => readAuthPhoneDraft().accountPhone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [recoveryHint, setRecoveryHint] = useState("");
  const current = trpc.auth.me.useQuery(undefined, { retry: false });
  const register = trpc.teacherAuth.register.useMutation({
    onSuccess: async () => {
      const navigated = await navigateAfterTeacherLogin(
        async () => (await current.refetch()).data,
        setLocation,
      );
      if (!navigated) {
        toast.error(language === "ar" ? "تم قبول الطلب لكن تعذر التحقق من الجلسة. أعد المحاولة." : "The request succeeded, but the session could not be verified. Please try again.");
        return;
      }
      clearAuthPhoneDraft();
      toast.success(language === "ar" ? "تم إنشاء حساب المعلم" : "Teacher account created");
    },
    onError: error => { const message = localizeAuthMessage(error.message, language); setFormError(message); toast.error(message); },
  });
  const login = trpc.teacherAuth.login.useMutation({
    onSuccess: async () => {
      const navigated = await navigateAfterTeacherLogin(
        async () => (await current.refetch()).data,
        setLocation,
      );
      if (!navigated) {
        toast.error(language === "ar" ? "تم قبول الطلب لكن تعذر التحقق من الجلسة. أعد المحاولة." : "The request succeeded, but the session could not be verified. Please try again.");
        return;
      }
      clearAuthPhoneDraft();
      toast.success(language === "ar" ? "تم تسجيل الدخول بنجاح" : "Signed in successfully");
    },
    onError: error => { const message = localizeAuthMessage(error.message, language); setFormError(message); toast.error(message); },
  });

  useEffect(() => {
    if (current.data) setLocation("/");
  }, [current.data, setLocation]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setRecoveryHint("");
    if (!isValidAuthPhone(phone)) {
      setFormError(language === "ar" ? "أدخل رقم هاتف صحيحًا من 7 إلى 32 رقمًا." : "Enter a valid phone number with 7 to 32 digits.");
      return;
    }
    if (!isValidAuthPassword(password)) {
      setFormError(language === "ar" ? "يجب أن تكون كلمة المرور من 8 إلى 128 حرفًا." : "Password must be 8 to 128 characters.");
      return;
    }
    if (isRegister) {
      if (!isValidRegistrationName(name)) {
        setFormError(language === "ar" ? "اكتب اسمًا من حرفين إلى 160 حرفًا." : "Enter a name between 2 and 160 characters.");
        return;
      }
      if (!isValidRegistrationSubject(subject)) {
        setFormError(language === "ar" ? "اكتب مادة من حرفين إلى 120 حرفًا." : "Enter a subject between 2 and 120 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setFormError(language === "ar" ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
        return;
      }
      register.mutate({ name: name.trim(), subject: subject.trim(), phone: phone.trim(), password });
    } else {
      login.mutate({ phone: phone.trim(), password });
    }
  };

  const isPending = register.isPending || login.isPending;
  return (
    <main className="teacher-portal" dir={isRtl ? "rtl" : "ltr"} data-no-legacy-translate="true">
      <form className="teacher-auth-card" onSubmit={submit}>
        <button className="teacher-auth-switch" type="button" aria-label={language === "ar" ? "Switch language to English" : "تغيير اللغة إلى العربية"} onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>
          {language === "ar" ? "English" : "العربية"}
        </button>
        <AuthFlowControls
          role="teacher"
          mode={isRegister ? "register" : "login"}
          roleLabel={language === "ar" ? "نوع الحساب" : "Account type"}
          roleName={language === "ar" ? "معلم" : "Teacher"}
          loginLabel={language === "ar" ? "تسجيل الدخول" : "Log in"}
          registerLabel={language === "ar" ? "إنشاء حساب" : "Register"}
          switchRoleLabel={isRegister
            ? (language === "ar" ? "إنشاء حساب طالب بدلًا من ذلك" : "Register as a Student instead")
            : (language === "ar" ? "الدخول كطالب بدلًا من ذلك" : "Log in as a Student instead")}
          roleIcon={<GraduationCap size={17} aria-hidden="true" />}
          onModeChange={mode => setLocation(mode === "register" ? "/teacher/register" : "/teacher/login")}
          onRoleChange={() => setLocation(isRegister ? "/student/register" : "/student/login")}
        />
        <div className="teacher-avatar-mark">أ</div>
        <span className="teacher-auth-kicker">{language === "ar" ? "حساب المعلم" : "Teacher account"}</span>
        <h1>{isRegister ? (language === "ar" ? "أنشئ مساحة عملك" : "Create your workspace") : (language === "ar" ? "أهلًا بعودتك" : "Welcome back")}</h1>
        <p>{isRegister ? (language === "ar" ? "استخدم رقم هاتفك وكلمة مرور تنشئها بنفسك؛ بيانات كل معلم تبقى في مساحة مستقلة." : "Use your phone number and create a password. Each teacher's data remains in a separate workspace.") : (language === "ar" ? "أدخل رقم هاتفك وكلمة المرور للوصول إلى بياناتك فقط." : "Enter your phone number and password to access only your data.")}</p>
        {isRegister && <>
          <label>
            {language === "ar" ? "اسم المعلم" : "Teacher name"}
            <input value={name} onChange={event => setName(event.target.value)} placeholder={language === "ar" ? "مثال: أ/ أحمد محمود" : "Example: Ahmed Mahmoud"} autoComplete="name" required minLength={2} maxLength={160} />
          </label>
          <label>
            {language === "ar" ? "المادة الأساسية" : "Main subject"}
            <input value={subject} onChange={event => setSubject(event.target.value)} placeholder={language === "ar" ? "مثال: الرياضيات" : "Example: Mathematics"} required minLength={2} maxLength={120} />
          </label>
        </>}
        <label>
          {language === "ar" ? "رقم الهاتف" : "Phone number"}
          <input type="tel" inputMode="tel" value={phone} onChange={event => { setPhone(event.target.value); saveAuthPhoneDraft({ accountPhone: event.target.value }); setFormError(""); }} placeholder="01xxxxxxxxx" autoComplete="tel" required minLength={7} maxLength={32} />
        </label>
        <label>
          {language === "ar" ? "كلمة المرور" : "Password"}
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder={language === "ar" ? "8 أحرف على الأقل" : "At least 8 characters"} autoComplete={isRegister ? "new-password" : "current-password"} required minLength={8} maxLength={128} />
        </label>
        {isRegister && <label>
          {language === "ar" ? "تأكيد كلمة المرور" : "Confirm password"}
          <input type="password" value={confirmPassword} onChange={event => { setConfirmPassword(event.target.value); setFormError(""); }} placeholder={language === "ar" ? "أعد كتابة كلمة المرور" : "Enter your password again"} autoComplete="new-password" required minLength={8} maxLength={128} />
        </label>}
        {!isRegister && <button className="teacher-forgot-password" type="button" onClick={() => setRecoveryHint(language === "ar" ? "لا يتوفر استرداد آلي لكلمة المرور حاليًا. تواصل مع دعم المنصة." : "Automatic password reset is not available yet. Contact platform support.")}>
          {language === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}
        </button>}
        {recoveryHint && <p className="auth-form-hint" role="status">{recoveryHint}</p>}
        {formError && <p className="auth-form-error" role="alert">{formError}</p>}
        <button type="submit" className="teacher-primary" disabled={isPending}>
          {isPending ? (language === "ar" ? "جارٍ التحقق..." : "Please wait...") : isRegister ? <><UserPlus size={18}/>{language === "ar" ? "إنشاء الحساب" : "Create account"}</> : <><LogIn size={18}/>{language === "ar" ? "تسجيل الدخول" : "Log in"}</>}
        </button>
        <small><ShieldCheck size={14}/>{language === "ar" ? "رقم الهاتف وكلمة المرور يحميان مساحة المعلم وبيانات طلابه." : "Your phone number and password protect your workspace and student data."}</small>
      </form>
    </main>
  );
}
