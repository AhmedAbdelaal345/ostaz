import type { ReactNode } from "react";

export type AuthRole = "student" | "teacher";
export type AuthMode = "login" | "register";

type AuthFlowControlsProps = {
  role: AuthRole;
  mode: AuthMode;
  roleLabel: string;
  roleName: string;
  loginLabel: string;
  registerLabel: string;
  switchRoleLabel: string;
  roleIcon: ReactNode;
  onModeChange: (mode: AuthMode) => void;
  onRoleChange: () => void;
};

export function AuthFlowControls({
  role,
  mode,
  roleLabel,
  roleName,
  loginLabel,
  registerLabel,
  switchRoleLabel,
  roleIcon,
  onModeChange,
  onRoleChange,
}: AuthFlowControlsProps) {
  return (
    <div className={`auth-flow-controls auth-flow-${role}`}>
      <div className="auth-flow-role-row">
        <span className="auth-flow-role" aria-label={`${roleLabel}: ${roleName}`}>
          {roleIcon}
          <span>{roleName}</span>
        </span>
        <button className="auth-flow-switch-role" type="button" onClick={onRoleChange}>
          {switchRoleLabel}
        </button>
      </div>
      <div className="auth-flow-mode" role="group" aria-label={roleName}>
        <button
          type="button"
          aria-pressed={mode === "login"}
          className={mode === "login" ? "active" : ""}
          onClick={() => onModeChange("login")}
        >
          {loginLabel}
        </button>
        <button
          type="button"
          aria-pressed={mode === "register"}
          className={mode === "register" ? "active" : ""}
          onClick={() => onModeChange("register")}
        >
          {registerLabel}
        </button>
      </div>
    </div>
  );
}
