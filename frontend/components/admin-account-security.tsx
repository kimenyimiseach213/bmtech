"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { ApiError, apiPaths, apiRequest } from "@/lib/api";
import { newPasswordError, validAccountEmail } from "@/lib/account-security";
import { AdminSettingsNav } from "./admin-settings-nav";

type Account = { email: string; pendingEmailChange: { email: string; expiresAt: string } | null };
function PasswordField({ id, label, value, onChange, fresh = false }: {
  id: string; label: string; value: string; onChange: (value: string) => void; fresh?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return <div className="admin-form-field"><label htmlFor={id}>{label}</label><div className="account-password-input">
    <input id={id} type={visible ? "text" : "password"} autoComplete={fresh ? "new-password" : "current-password"}
      required minLength={fresh ? 12 : 1} maxLength={fresh ? 72 : 1024} value={value} onChange={event => onChange(event.target.value)} />
    <button type="button" aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
  </div></div>;
}
function message(error: unknown) { return error instanceof ApiError ? error.message : "An unexpected server error occurred."; }

export function AdminAccountSecurity() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const lang = locale === "fr" ? "fr" : "en";
  const [account, setAccount] = useState<Account | null>(null);
  const [loadError, setLoadError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [busy, setBusy] = useState<"password" | "email" | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<Account>(apiPaths.account).then(data => { if (active) setAccount(data); }).catch(error => {
      if (!active) return;
      if (error instanceof ApiError && error.status === 401) router.replace(`/${lang}/admin/login`);
      else setLoadError(message(error));
    });
    return () => { active = false; };
  }, [lang, router]);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPasswordError("");
    const validation = newPasswordError(newPassword, confirmation);
    if (validation) { setPasswordError(validation); return; }
    if (newPassword === currentPassword) { setPasswordError("Choose a password different from your current password."); return; }
    setBusy("password");
    try {
      await apiRequest(apiPaths.changePassword, { method: "PATCH", body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword: confirmation }) });
      setCurrentPassword(""); setNewPassword(""); setConfirmation(""); setEmailPassword("");
      router.replace(`/${lang}/admin/login?notice=password-changed`); router.refresh();
    } catch (error) { setPasswordError(message(error)); } finally { setBusy(null); }
  }
  async function changeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setEmailError(""); setEmailSuccess("");
    const email = newEmail.trim().toLowerCase();
    if (!validAccountEmail(email)) { setEmailError("Enter a valid email address."); return; }
    if (email === account?.email.toLowerCase()) { setEmailError("Enter a different email address."); return; }
    setBusy("email");
    try {
      const result = await apiRequest<{ message: string; pendingEmailChange: Account["pendingEmailChange"] }>(apiPaths.requestEmailChange,
        { method: "POST", body: JSON.stringify({ newEmail: email, currentPassword: emailPassword }) });
      setAccount(current => current ? { ...current, pendingEmailChange: result.pendingEmailChange } : current);
      setEmailSuccess(result.message); setEmailPassword(""); setNewEmail("");
    } catch (error) { setEmailError(message(error)); } finally { setBusy(null); }
  }

  return <main className="admin-content account-security"><AdminSettingsNav />
    <div className="admin-title-row"><div><h1>Account &amp; Security</h1><p>Manage the email and password for your administrator account.</p></div><ShieldCheck size={24} /></div>
    {loadError && <div className="admin-alert admin-alert-error" role="alert">{loadError}</div>}
    {!account && !loadError && <p role="status">Loading account settings…</p>}
    {account && <div className="account-security-grid">
      <section className="admin-panel account-security-card" aria-labelledby="password-heading"><div className="account-card-heading"><KeyRound size={20} /><h2 id="password-heading">Change Password</h2></div>
        <p>Use a unique password. Changing it signs you out on every device and cancels pending email changes.</p>
        <form onSubmit={changePassword}>
          <PasswordField id="account-current-password" label="Current Password" value={currentPassword} onChange={setCurrentPassword} />
          <PasswordField id="account-new-password" label="New Password" value={newPassword} onChange={setNewPassword} fresh />
          <p className="account-field-help">At least 12 characters, including uppercase, lowercase, a number and a symbol. Maximum 72 UTF-8 bytes.</p>
          <PasswordField id="account-confirm-password" label="Confirm New Password" value={confirmation} onChange={setConfirmation} fresh />
          {passwordError && <div className="admin-alert admin-alert-error" role="alert">{passwordError}</div>}
          <button type="submit" className="button button-primary" disabled={busy !== null}>{busy === "password" ? "Updating password…" : "Change Password"}</button>
        </form>
      </section>
      <section className="admin-panel account-security-card" aria-labelledby="email-heading"><div className="account-card-heading"><Mail size={20} /><h2 id="email-heading">Change Email Address</h2></div>
        <p>Your current email stays active until you verify the new address. Verification links expire after 20 minutes.</p>
        <form onSubmit={changeEmail}>
          <label className="admin-form-field" htmlFor="account-current-email">Current Email Address<input id="account-current-email" type="email" value={account.email} readOnly autoComplete="username" /></label>
          <label className="admin-form-field" htmlFor="account-new-email">New Email Address<input id="account-new-email" type="email" required maxLength={254} value={newEmail} autoComplete="email" onChange={event => setNewEmail(event.target.value)} /></label>
          <PasswordField id="email-current-password" label="Current Password" value={emailPassword} onChange={setEmailPassword} />
          {account.pendingEmailChange && <div className="account-pending" role="status"><strong>Verification pending</strong><span>{account.pendingEmailChange.email}</span><small>Expires {new Date(account.pendingEmailChange.expiresAt).toLocaleString()}. A new request replaces the previous link.</small></div>}
          {emailSuccess && <div className="admin-alert account-success" role="status">{emailSuccess}</div>}
          {emailError && <div className="admin-alert admin-alert-error" role="alert">{emailError}</div>}
          <button type="submit" className="button button-primary" disabled={busy !== null}>{busy === "email" ? "Sending verification…" : "Change Email"}</button>
        </form>
      </section>
    </div>}
  </main>;
}
