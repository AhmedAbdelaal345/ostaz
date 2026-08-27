import { Download, MoreVertical, Share2, Smartphone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { detectInstallPlatform, isStandaloneApp, shouldShowInstallGuide, type InstallPlatform } from "../../../shared/installGuide";
import { useLanguage } from "@/contexts/LanguageContext";

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "el-mister-install-guide-dismissed-v1";

function getInitialPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "other";
  return detectInstallPlatform(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);
}

function wasDismissed() {
  try { return localStorage.getItem(DISMISS_KEY) === "true"; } catch { return false; }
}

export function InstallGuide() {
  const { language, isRtl } = useLanguage();
  const promptRef = useRef<DeferredInstallPrompt | null>(null);
  const [platform] = useState<InstallPlatform>(getInitialPlatform);
  const [canInstall, setCanInstall] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone = isStandaloneApp(
      (navigator as Navigator & { standalone?: boolean }).standalone,
      window.matchMedia("(display-mode: standalone)").matches,
    );
    if (!shouldShowInstallGuide({ platform, dismissed: wasDismissed(), standalone })) return;

    const showTimer = window.setTimeout(() => setVisible(true), 950);
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as DeferredInstallPrompt;
      setCanInstall(true);
    };
    const onInstalled = () => {
      try { localStorage.setItem(DISMISS_KEY, "true"); } catch { /* optional browser storage */ }
      setVisible(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [platform]);

  if (!visible) return null;
  const english = language === "en";
  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, "true"); } catch { /* optional browser storage */ }
    setVisible(false);
  };
  const install = async () => {
    const prompt = promptRef.current;
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      try { localStorage.setItem(DISMISS_KEY, "true"); } catch { /* optional browser storage */ }
      setVisible(false);
    }
    promptRef.current = null;
    setCanInstall(false);
  };

  const iOS = platform === "ios";
  const title = english ? "Install El Mister" : "ثبّت El Mister";
  const description = iOS
    ? (english ? "Add the app to your Home Screen for an app-style, full-screen experience." : "أضف التطبيق إلى الشاشة الرئيسية لتفتحه مثل تطبيق مستقل وبكامل الشاشة.")
    : (english ? "Install the app on this device for faster access from your Home Screen." : "ثبّت التطبيق على جهازك للوصول السريع إليه من الشاشة الرئيسية.");

  return <div className="install-guide-backdrop" role="presentation">
    <section className="install-guide" dir={isRtl ? "rtl" : "ltr"} role="dialog" aria-modal="true" aria-labelledby="install-guide-title">
      <button className="install-guide-close" type="button" onClick={dismiss} aria-label={english ? "Close installation guide" : "إغلاق إرشاد التثبيت"}><X size={18}/></button>
      <div className="install-guide-icon"><Smartphone size={25}/></div>
      <span className="install-guide-kicker">El Mister</span>
      <h2 id="install-guide-title">{title}</h2>
      <p>{description}</p>
      {iOS ? <ol className="install-guide-steps">
        <li><span>1</span><div>{english ? "Open this link in Safari." : "افتح الرابط من متصفح Safari."}</div></li>
        <li><span>2</span><div>{english ? <>Tap <b>Share</b> <Share2 size={14}/>.</> : <>اضغط زر <b>المشاركة</b> <Share2 size={14}/>.</>}</div></li>
        <li><span>3</span><div>{english ? <>Choose <b>Add to Home Screen</b>, then tap <b>Add</b>.</> : <>اختر <b>«إضافة إلى الشاشة الرئيسية»</b> ثم <b>«إضافة»</b>.</>}</div></li>
      </ol> : <div className="install-guide-android">
        {canInstall ? <p className="install-guide-ready">{english ? "Your browser is ready to install the app." : "متصفحك جاهز لتثبيت التطبيق الآن."}</p> : <p>{english ? <>Open the browser menu <MoreVertical size={15}/> and choose <b>Install app</b> or <b>Add to Home screen</b>.</> : <>افتح قائمة المتصفح <MoreVertical size={15}/> ثم اختر <b>«تثبيت التطبيق»</b> أو <b>«إضافة إلى الشاشة الرئيسية»</b>.</>}</p>}
      </div>}
      <div className="install-guide-actions">
        {!iOS && canInstall && <button className="primary install-guide-install" type="button" onClick={install}><Download size={17}/>{english ? "Install now" : "تثبيت الآن"}</button>}
        <button className="secondary install-guide-later" type="button" onClick={dismiss}>{english ? "Not now" : "ليس الآن"}</button>
      </div>
    </section>
  </div>;
}
