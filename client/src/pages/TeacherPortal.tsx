import { useEffect, useState } from "react";
import { LogIn, Phone, ShieldCheck, UserPlus } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function TeacherPortal() {
  const [location, setLocation] = useLocation();
  const isRegister = location === "/teacher/register";
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const current = trpc.auth.me.useQuery(undefined, { retry: false });
  const register = trpc.teacherAuth.register.useMutation({
    onSuccess: () => { toast.success("تم إنشاء حساب المعلم"); window.location.assign("/"); },
    onError: error => toast.error(error.message),
  });
  const login = trpc.teacherAuth.login.useMutation({
    onSuccess: () => { toast.success("تم تسجيل الدخول بنجاح"); window.location.assign("/"); },
    onError: error => toast.error(error.message),
  });

  useEffect(() => { if (current.data) window.location.assign("/"); }, [current.data]);
  const submit = () => {
    if (!phone.trim() || password.length < 8) return toast.error("اكتب رقم الهاتف وكلمة مرور من 8 أحرف على الأقل");
    if (isRegister) {
      if (name.trim().length < 2 || subject.trim().length < 2) return toast.error("اكتب اسمك والمادة الأساسية");
      register.mutate({ name: name.trim(), subject: subject.trim(), phone, password });
    } else login.mutate({ phone, password });
  };

  return <main className="teacher-portal" dir="rtl"><section className="teacher-auth-card"><div className="teacher-avatar-mark">أ</div><span className="teacher-auth-kicker">حساب المعلم</span><h1>{isRegister ? "أنشئ مساحة عملك" : "أهلًا بعودتك"}</h1><p>{isRegister ? "استخدم رقم هاتفك وكلمة مرور تنشئها بنفسك؛ بيانات كل معلم تبقى في مساحة مستقلة." : "أدخل رقم هاتفك وكلمة المرور للوصول إلى بياناتك فقط."}</p>{isRegister && <><label>اسم المعلم<input value={name} onChange={event => setName(event.target.value)} placeholder="مثال: أ/ أحمد محمود" autoComplete="name"/></label><label>المادة الأساسية<input value={subject} onChange={event => setSubject(event.target.value)} placeholder="مثال: الرياضيات"/></label></>}<label>رقم الهاتف<input inputMode="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="01xxxxxxxxx" autoComplete="tel"/></label><label>كلمة المرور<input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="8 أحرف على الأقل" autoComplete={isRegister ? "new-password" : "current-password"}/></label><button type="button" className="teacher-primary" disabled={register.isPending || login.isPending} onClick={submit}>{isRegister ? <><UserPlus size={18}/> إنشاء الحساب</> : <><LogIn size={18}/> تسجيل الدخول</>}</button><button type="button" className="teacher-auth-switch" onClick={() => setLocation(isRegister ? "/teacher/login" : "/teacher/register")}>{isRegister ? "لديك حساب؟ سجّل الدخول" : "ليس لديك حساب؟ أنشئ حسابًا"}</button><small><ShieldCheck size={14}/> رقم الهاتف وكلمة المرور يحميان مساحة المعلم وبيانات طلابه.</small><a className="teacher-student-link" href="/student/login"><Phone size={14}/> دخول الطالب</a></section></main>;
}
