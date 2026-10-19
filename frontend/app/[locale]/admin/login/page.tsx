"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Zap } from "lucide-react";
import { apiPaths, apiRequest, loginErrorMessage } from "@/lib/api";
import { accountNotices } from "@/lib/account-security";
import { imageUrls } from "@/lib/data";

export default function AdminLoginPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale === "fr" ? "fr" : "en";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const french = locale === "fr";

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("notice") || "";
    setNotice(Object.prototype.hasOwnProperty.call(accountNotices, key) ? accountNotices[key] : "");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRequest(apiPaths.login, { method: "POST", body: JSON.stringify({ email: email.trim(), password }) });
      const next = new URLSearchParams(window.location.search).get("next");
      const safeNext = next && next.startsWith(`/${locale}/admin/`) && !next.includes("//") ? next : `/${locale}/admin/dashboard`;
      router.replace(safeNext);
      router.refresh();
    } catch (reason) {
      setError(loginErrorMessage(reason));
    } finally {
      setLoading(false);
    }
  }

  return <main className="admin-login">
    <section className="admin-login-card" aria-labelledby="admin-login-title">
      <a className="brand brand-logo-link" href={`/${locale}`} aria-label="BMTECH home"><img className="brand-logo" src={imageUrls.logo} alt="BMTECH logo" /></a>
      <span className="admin-login-kicker"><LockKeyhole size={14} /> {french ? "ACCÈS ADMINISTRATEUR" : "ADMINISTRATOR ACCESS"}</span>
      <h1 id="admin-login-title">{french ? "Connexion" : "Sign in"}</h1>
      <p>{french ? "Connectez-vous pour gérer le catalogue et les demandes BMTECH." : "Sign in to manage the BMTECH catalogue and customer requests."}</p>
      {notice && <div role="status" className="admin-alert account-success">{notice}</div>}
      <form onSubmit={submit}>
        <div className="form-field"><label htmlFor="admin-email">{french ? "Adresse e-mail" : "Email address"}</label><input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" /></div>
        <div className="form-field"><label htmlFor="admin-password">{french ? "Mot de passe" : "Password"}</label><div className="admin-password-field"><input id="admin-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
        {error && <div role="alert" className="admin-alert admin-alert-error">{error}</div>}
        <button className="button button-primary button-block admin-login-submit" type="submit" disabled={loading}>{loading ? (french ? "Connexion…" : "Signing in…") : (french ? "Se connecter" : "Sign in")}<ArrowRight size={15} /></button>
      </form>
      <a className="button button-outline admin-login-back-link" href={`/${locale}`}><ArrowLeft size={15} />{french ? "Retour au site" : "Back to website"}</a>
      <p className="admin-login-note">{french ? "Les comptes administrateur sont créés par un administrateur autorisé. L’inscription publique est désactivée." : "Administrator accounts are created through authorized onboarding. Public sign-up is disabled."}</p>
    </section>
  </main>;
}
