"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function TokenPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    getToken({ template: "test_env" }).then((t) => {
      setToken(t);
      setLoading(false);
    });
  }, [isLoaded, isSignedIn, getToken]);

  const handleCopy = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="container">
      <div className="card">
        <div className="card-header">
          <span className="badge">AUTH</span>
          <h1>Bearer Token</h1>
          <p className="subtitle">Your current session token</p>
        </div>

        <div className="token-box">
          {loading ? (
            <div className="state-msg">
              <span className="spinner" />
              Fetching token…
            </div>
          ) : !isSignedIn ? (
            <div className="state-msg warn">
              ⚠ Sign in to view your bearer token.
            </div>
          ) : token ? (
            <>
              <div className="prefix">Bearer</div>
              <code className="token-value">{token}</code>
            </>
          ) : (
            <div className="state-msg warn">Could not retrieve token.</div>
          )}
        </div>

        {token && (
          <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy to clipboard
              </>
            )}
          </button>
        )}
      </div>
    </main>
  );
}
