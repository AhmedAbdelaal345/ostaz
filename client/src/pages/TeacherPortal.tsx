import { useEffect, useState } from "react";
import { LogIn, Phone, ShieldCheck, UserPlus } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TeacherPortal() {
  const { language, setLanguage, isRtl } = useLanguage();
  const [location, setLocation] = useLocation();
  const isRegister = location === "/teacher/register";
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const current = trpc.auth.me.useQuery(undefined, { retry: false });
  const register = trpc.teacherAuth.register.useMutation({
    onSuccess: () => { toast.success(language === "ar" ? "تم إنشاء حساب المعلم" : "Teacher account created"); window.location.assign("/"); },
    onError: error => toast.error(error.message),
  });
  const login = trpc.teacherAuth.login.useMutation({
    onSuccess: () => { toast.success(language === "ar" ? "تم تسجيل الدخول بنجاح" : "Signed in successfully"); window.location.assign("/"); },
    onError: error => toast.error(error.message),
  });

  useEffect(() => { if (current.data) window.location.assign("/"); }, [current.data]);
  const submit = () => {
    if (!phone.trim() || password.length < 8) return toast.error(language === "ar" ? "اكتب رقم الهاتف وكلمة مرور من 8 أحرف على الأقل" : "Enter a phone number and a password of at least 8 characters.");
    if (isRegister) {
      if (name.trim().length < 2 || subject.trim().length < 2) return toast.error(language === "ar" ? "اكتب اسمك والمادة الأساسية" : "Enter your name and main subject.");
      register.mutate({ name: name.trim(), subject: subject.trim(), phone, password });
    } else login.mutate({ phone, password });
  };

  return <main className="teacher-portal" dir={isRtl ? "rtl" : "ltr"}><section className="teacher-auth-card"><button className="teacher-auth-switch" type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>{language === "ar" ? "English" : "العربية"}</button><div className="teacher-avatar-mark">أ</div><span className="teacher-auth-kicker">{language === "ar" ? "حساب المعلم" : "Teacher account"}</span><h1>{isRegister ? (language === "ar" ? "أنشئ مساحة عملك" : "Create your workspace") : (language === "ar" ? "أهلًا بعودتك" : "Welcome back")}</h1><p>{isRegister ? (language === "ar" ? "استخدم رقم هاتفك وكلمة مرور تنشئها بنفسك؛ بيانات كل معلم تبقى في مساحة مستقلة." : "Use your phone number and create a password. Each teacher's data remains in a separate workspace.") : (language === "ar" ? "أدخل رقم هاتفك وكلمة المرور للوصول إلى بياناتك فقط." : "Enter your phone number and password to access only your data.")}</p>{isRegister && <><label>{language === "ar" ? "اسم المعلم" : "Teacher name"}<input value={name} onChange={event => setName(event.target.value)} placeholder={language === "ar" ? "مثال: أ/ أحمد محمود" : "Example: Ahmed Mahmoud"} autoComplete="name"/></label><label>{language === "ar" ? "المادة الأساسية" : "Main subject"}<input value={subject} onChange={event => setSubject(event.target.value)} placeholder={language === "ar" ? "مثال: الرياضيات" : "Example: Mathematics"}/></label></>}<label>{language === "ar" ? "رقم الهاتف" : "Phone number"}<input inputMode="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="01xxxxxxxxx" autoComplete="tel"/></label><label>{language === "ar" ? "كلمة المرور" : "Password"}<input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder={language === "ar" ? "8 أحرف على الأقل" : "At least 8 characters"} autoComplete={isRegister ? "new-password" : "current-password"}/></label><button type="button" className="teacher-primary" disabled={register.isPending || login.isPending} onClick={submit}>{isRegister ? <><UserPlus size={18}/>{language === "ar" ? "إنشاء الحساب" : "Create account"}</> : <><LogIn size={18}/>{language === "ar" ? "تسجيل الدخول" : "Sign in"}</>}</button><button type="button" className="teacher-auth-switch" onClick={() => setLocation(isRegister ? "/teacher/login" : "/teacher/register")}>{isRegister ? (language === "ar" ? "لديك حساب؟ سجّل الدخول" : "Already have an account? Sign in") : (language === "ar" ? "ليس لديك حساب؟ أنشئ حسابًا" : "No account? Create one")}</button><small><ShieldCheck size={14}/>{language === "ar" ? "رقم الهاتف وكلمة المرور يحميان مساحة المعلم وبيانات طلابه." : "Your phone number and password protect your workspace and student data."}</small><a className="teacher-student-link" href="/student/login"><Phone size={14}/>{language === "ar" ? "دخول الطالب" : "Student sign in"}</a></section></main>;
}
