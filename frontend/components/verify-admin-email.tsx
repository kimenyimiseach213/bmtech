"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ApiError, apiPaths, apiRequest } from "@/lib/api";

export function VerifyAdminEmail() {
  const { locale } = useParams<{ locale: string }>();
  const lang = locale === "fr" ? "fr" : "en";
  const router = useRouter();
  const captured = useRef(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (captured.current) return;
    captured.current = true;
    const value = new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
    window.history.replaceState(null, "", window.location.pathname);
    if (/^[a-f0-9]{64}$/.test(value)) setToken(value);
    else setError("This verification link is invalid or has already been used.");
  }, []);
  async function verify() {
    setBusy(true); setError("");
    try {
      await apiRequest(apiPaths.verifyEmailChange, { method: "POST", body: JSON.stringify({ token }) });
      setToken(""); router.replace(`/${lang}/admin/login?notice=email-changed`); router.refresh();
    } catch (reason) { setError(reason instanceof ApiError ? reason.message : "Unable to connect to the server."); }
    finally { setBusy(false); }
  }
  return <main className="admin-login"><section className="admin-login-card account-verify" aria-labelledby="verify-title">
    <MailCheck size={30} /><h1 id="verify-title">Verify your new email</h1>
    <p>Confirm this change to update your administrator login email. You will be signed out on every device and asked to log in again.</p>
    {error && <div role="alert" className="admin-alert admin-alert-error">{error}</div>}
    <button className="button button-primary button-block" type="button" disabled={!token || busy} onClick={() => void verify()}>{busy ? "Verifying…" : "Verify email address"}</button>
    <Link className="account-back-link" href={`/${lang}/admin/settings/account-security`}>Return to Account &amp; Security</Link>
  </section></main>;
}
