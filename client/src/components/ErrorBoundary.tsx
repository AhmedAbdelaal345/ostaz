import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[App recovery]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-recovery-screen" role="alert">
          <div className="app-recovery-card">
            <span className="app-recovery-icon"><AlertTriangle size={28}/></span>
            <span className="app-recovery-kicker">استرداد التطبيق</span>
            <h2>تعذر إكمال هذه الشاشة</h2>
            <p>لم تُحذف بياناتك. عُد إلى الرئيسية أو أعد تحميل التطبيق لاستكمال العمل بأمان.</p>
            <div className="app-recovery-actions">
              <button type="button" className="primary" onClick={() => window.location.assign("/")}>العودة للرئيسية</button>
              <button type="button" className="secondary" onClick={() => window.location.reload()}><RotateCcw size={16}/> إعادة التحميل</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
