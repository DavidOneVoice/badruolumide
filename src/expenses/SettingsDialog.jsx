/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { CURRENCIES } from "./constants";

export default function SettingsDialog({ open, profile, saving, onClose, onSave }) {
  const [fullName, setFullName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setFullName(profile.full_name || "");
    setCurrency(profile.currency || "NGN");
    setMonthlyBudget(profile.monthly_budget ?? "");
    setError("");
  }, [open, profile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await onSave({
        full_name: fullName.trim(),
        currency,
        monthly_budget: monthlyBudget === "" ? null : Number(monthlyBudget),
      });
    } catch (saveError) {
      setError(saveError.message || "We couldn’t save your preferences.");
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section className="modal-panel settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header className="modal-header">
          <div>
            <span className="modal-kicker">Your preferences</span>
            <h2 id="settings-title">Account settings</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} disabled={saving} aria-label="Close">
            <CloseRoundedIcon />
          </button>
        </header>

        <form className="settings-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Your name</span>
            <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          </label>

          <label className="field">
            <span>Currency</span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
              {CURRENCIES.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.code} — {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Monthly spending target <small>(optional)</small></span>
            <input
              type="number"
              value={monthlyBudget}
              onChange={(event) => setMonthlyBudget(event.target.value)}
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 100000"
            />
            <small className="field-hint">This is a personal guide, not a hard spending limit.</small>
          </label>

          {error && <div className="form-feedback form-feedback--error" role="alert">{error}</div>}

          <footer className="modal-footer modal-footer--simple">
            <button className="secondary-button" type="button" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save preferences"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
