import { useState } from "react";
import { Building2, CircleDollarSign, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

export function CenterAdminPanel() {
  const { language } = useLanguage();
  const utils = trpc.useUtils();
  const overview = trpc.app.center.overview.useQuery(undefined, { retry: false });
  const scope = trpc.app.center.scope.useQuery(undefined, { retry: false });
  const save = trpc.app.center.save.useMutation({ onSuccess: () => { utils.app.center.overview.invalidate(); utils.app.center.get.invalidate(); toast.success(language === "ar" ? "تم حفظ بيانات المركز" : "Center details saved"); } });
  const add = trpc.app.center.addMember.useMutation({ onSuccess: () => { utils.app.center.overview.invalidate(); utils.app.center.members.invalidate(); toast.success(language === "ar" ? "تم حفظ عضو الفريق" : "Team member saved"); } });
  const remove = trpc.app.center.removeMember.useMutation({ onSuccess: () => { utils.app.center.overview.invalidate(); utils.app.center.members.invalidate(); toast.success(language === "ar" ? "تم إلغاء وصول العضو" : "Member access removed"); } });
  const [centerName, setCenterName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [role, setRole] = useState<"teacher" | "assistant">("assistant");
  const [attendance, setAttendance] = useState(true);
  const [finance, setFinance] = useState(true);
  const data = overview.data;
  const isOwner = scope.data?.role === "owner";
  if (scope.isLoading || overview.isLoading) return <div className="empty-inline">{language === "ar" ? "جارٍ تحميل مركزك..." : "Loading your center..."}</div>;
  if (!isOwner && scope.data?.center) return <div className="center-admin-panel"><div className="center-admin-head"><span className="eyebrow">{language === "ar" ? "وصول الفريق" : "Team access"}</span><h3>{scope.data.center.name}</h3><p>{language === "ar" ? <>دورك: <b>{scope.data.role === "assistant" ? "مساعد" : "مدرس"}</b>. تتاح لك فقط عمليات الحضور والمالية التي منحها لك المالك.</> : <>Your role: <b>{scope.data.role === "assistant" ? "Assistant" : "Teacher"}</b>. You can only perform attendance and finance tasks granted by the owner.</>}</p></div></div>;
  const center = data?.center;
  return <section className="center-admin-panel"><div className="center-admin-head"><div><span className="eyebrow">لوحة Super Admin</span><h3>{center?.name || "أنشئ مركزك"}</h3><p>{center ? "تابع فريقك وبيانات المركز من مكان واحد." : "أنشئ مركزًا أولًا ثم أضف المدرسين أو المساعدين المسجلين."}</p></div><Building2 size={25}/></div>{!center ? <form className="settings-single-form" onSubmit={event => { event.preventDefault(); if (!centerName.trim()) return toast.error("اكتب اسم المركز"); save.mutate({ name: centerName.trim(), phone: phone || null, address: address || null }); }}><label>اسم المركز<input value={centerName} onChange={event => setCenterName(event.target.value)} placeholder="مثال: مركز El Mister"/></label><label>رقم التواصل<input value={phone} onChange={event => setPhone(event.target.value)} inputMode="tel"/></label><label>العنوان<textarea value={address} onChange={event => setAddress(event.target.value)}/></label><button className="primary" disabled={save.isPending}>إنشاء المركز</button></form> : <><div className="center-admin-stats"><article><Users size={18}/><span>الطلاب</span><b>{data.studentsCount}</b></article><article><ShieldCheck size={18}/><span>الفريق</span><b>{data.membersCount}</b></article><article><CircleDollarSign size={18}/><span>صافي الخزينة</span><b>{data.net.toLocaleString()} ج.م</b></article></div><div className="center-team-form"><div><span className="eyebrow">إضافة عضو</span><h4>مدرس أو مساعد</h4></div><input value={memberPhone} onChange={event => setMemberPhone(event.target.value)} placeholder="رقم هاتف الحساب المسجل" inputMode="tel"/><select value={role} onChange={event => setRole(event.target.value as "teacher" | "assistant")}><option value="assistant">مساعد</option><option value="teacher">مدرس</option></select>{role === "assistant" && <div className="center-permission-checks"><label><input type="checkbox" checked={attendance} onChange={event => setAttendance(event.target.checked)}/> الحضور</label><label><input type="checkbox" checked={finance} onChange={event => setFinance(event.target.checked)}/> المالية</label></div>}<button type="button" className="primary" disabled={add.isPending} onClick={() => { if (!memberPhone.trim()) return toast.error("اكتب رقم هاتف العضو"); const permissions = ([attendance && "attendance", finance && "finance"].filter(Boolean)) as ("attendance" | "finance")[]; if (role === "assistant" && !permissions.length) return toast.error("اختر صلاحية واحدة على الأقل للمساعد"); add.mutate({ phone: memberPhone, role, permissions }); setMemberPhone(""); }}> <UserPlus size={16}/> إضافة</button></div><div className="center-member-list">{data.members.map((member: any) => <article key={member.id}><div><b>{member.role === "owner" ? "مالك المركز" : member.role === "assistant" ? "مساعد" : "مدرس"}</b><small>{member.role === "assistant" ? "الحضور والمالية حسب الصلاحيات" : "إدارة كاملة"}</small></div>{member.role !== "owner" && <button className="icon-button danger" aria-label="إلغاء وصول العضو" onClick={() => remove.mutate({ memberId: member.id })}><Trash2 size={16}/></button>}</article>)}</div></>}</section>;
}
