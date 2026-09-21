/* eslint-disable react/prop-types */
import { useState } from "react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

export default function AuthScreen({ onSignIn, onSignUp, onResetPassword }) {
  const [mode, setMode] = useState("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFeedback(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);

    try {
      if (mode === "forgot") {
        await onResetPassword(email);
        setFeedback({
          type: "success",
          text: "Check your inbox for a secure password-reset link.",
        });
      } else if (mode === "signup") {
        const result = await onSignUp({ fullName, email, password });
        if (result?.needsConfirmation) {
          setFeedback({
            type: "success",
            text: "Your account is almost ready. Check your inbox to confirm your email.",
          });
        }
      } else {
        await onSignIn({ email, password });
      }
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === "signup"
      ? "Create your account"
      : mode === "forgot"
        ? "Reset your password"
        : "Welcome back";

  const subtitle =
    mode === "signup"
      ? "Start with today’s spending. You can add past expenses any time."
      : mode === "forgot"
        ? "Enter your email and we’ll send you a reset link."
        : "Sign in to pick up exactly where you left off.";

  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Daily Spend overview">
        <div className="brand-lockup brand-lockup--light">
          <span className="brand-mark">DS</span>
          <span>
            <strong>Daily Spend</strong>
            <small>by Badru Olumide</small>
          </span>
        </div>

        <div className="auth-story__copy">
          <p className="eyebrow">A clearer money habit</p>
          <h1>Every naira has a story. Keep yours in one place.</h1>
          <p>
            Record expenses as they happen, find any purchase later, and see
            the patterns that are easy to miss in a notes app.
          </p>
        </div>

        <div className="auth-preview" aria-hidden="true">
          <div className="auth-preview__top">
            <span>This week</span>
            <strong>₦14,100</strong>
          </div>
          <div className="mini-chart">
            {[28, 48, 37, 72, 45, 91, 62].map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="auth-preview__row">
            <span className="mini-icon mini-icon--orange">F</span>
            <span>
              <strong>Food & groceries</strong>
              <small>5 entries</small>
            </span>
            <b>₦10,100</b>
          </div>
          <div className="auth-preview__row">
            <span className="mini-icon mini-icon--mint">T</span>
            <span>
              <strong>Transport</strong>
              <small>2 entries</small>
            </span>
            <b>₦4,000</b>
          </div>
        </div>

        <p className="privacy-note">
          <LockRoundedIcon sx={{ fontSize: 17 }} />
          Your records are private to your account.
        </p>
      </section>

      <section className="auth-form-wrap">
        <div className="brand-lockup brand-lockup--mobile">
          <span className="brand-mark">DS</span>
          <span>
            <strong>Daily Spend</strong>
            <small>by Badru Olumide</small>
          </span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-heading">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {mode === "signup" && (
            <label className="field">
              <span>Your name</span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                placeholder="e.g. Olumide David"
                required
              />
            </label>
          )}

          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>

          {mode !== "forgot" && (
            <label className="field">
              <span>Password</span>
              <span className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                </button>
              </span>
            </label>
          )}

          {feedback && (
            <div className={`form-feedback form-feedback--${feedback.type}`} role="status">
              {feedback.type === "success" && <CheckCircleRoundedIcon />}
              <span>{feedback.text}</span>
            </div>
          )}

          <button className="primary-button auth-submit" type="submit" disabled={busy}>
            <span>
              {busy
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : mode === "forgot"
                    ? "Send reset link"
                    : "Sign in"}
            </span>
            {!busy && <ArrowForwardRoundedIcon />}
          </button>

          {mode === "signin" && (
            <button className="text-button auth-forgot" type="button" onClick={() => switchMode("forgot")}>
              Forgot your password?
            </button>
          )}

          <div className="auth-switch">
            {mode === "signin" ? (
              <p>
                New here?{" "}
                <button type="button" onClick={() => switchMode("signup")}>
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                {mode === "signup" ? "Already have an account?" : "Remembered your password?"}{" "}
                <button type="button" onClick={() => switchMode("signin")}>
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
