/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import { CATEGORIES, CURRENCIES, PAYMENT_METHODS } from "./constants";
import { formatMoney, todayISO } from "./utils";

const blankItem = () => ({
  localId: crypto.randomUUID(),
  title: "",
  amount: "",
  category: "Food & groceries",
});

export default function ExpenseDialog({
  open,
  currency,
  expense,
  saving,
  onClose,
  onSave,
}) {
  const firstInputRef = useRef(null);
  const [date, setDate] = useState(todayISO());
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([blankItem()]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (expense) {
      setDate(expense.expense_date);
      setPaymentMethod(expense.payment_method || "Cash");
      setNote(expense.note || "");
      setItems([
        {
          localId: expense.id,
          title: expense.title,
          amount: String(expense.amount),
          category: expense.category,
        },
      ]);
    } else {
      setDate(todayISO());
      setPaymentMethod("Cash");
      setNote("");
      setItems([blankItem()]);
    }

    setError("");
    window.setTimeout(() => firstInputRef.current?.focus(), 80);
  }, [open, expense]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, saving, onClose]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [items],
  );

  const symbol = CURRENCIES.find((item) => item.code === currency)?.symbol || currency;

  const updateItem = (localId, field, value) => {
    setItems((current) =>
      current.map((item) => (item.localId === localId ? { ...item, [field]: value } : item)),
    );
  };

  const removeItem = (localId) => {
    setItems((current) => current.filter((item) => item.localId !== localId));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const invalid = items.some(
      (item) => !item.title.trim() || !Number(item.amount) || Number(item.amount) <= 0,
    );
    if (invalid) {
      setError("Add a clear item name and an amount greater than zero for every row.");
      return;
    }

    try {
      await onSave({
        items: items.map((item) => ({
          title: item.title.trim(),
          amount: Number(item.amount),
          category: item.category,
        })),
        expenseDate: date,
        paymentMethod,
        note: note.trim(),
      });
    } catch (saveError) {
      setError(saveError.message || "We couldn’t save this expense. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section className="modal-panel expense-dialog" role="dialog" aria-modal="true" aria-labelledby="expense-dialog-title">
        <header className="modal-header">
          <div>
            <span className="modal-kicker">{expense ? "Update record" : "New record"}</span>
            <h2 id="expense-dialog-title">{expense ? "Edit expense" : "What did you spend on?"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} disabled={saving} aria-label="Close">
            <CloseRoundedIcon />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-grid form-grid--two">
            <label className="field">
              <span>Date</span>
              <input type="date" value={date} max={todayISO()} onChange={(event) => setDate(event.target.value)} required />
            </label>
            <label className="field">
              <span>Paid with</span>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="expense-items">
            {items.map((item, index) => (
              <div className="expense-item-row" key={item.localId}>
                <div className="expense-item-number">{index + 1}</div>
                <label className="field expense-item-name">
                  <span>{index === 0 ? "Item or service" : "Another item"}</span>
                  <input
                    ref={index === 0 ? firstInputRef : null}
                    type="text"
                    value={item.title}
                    onChange={(event) => updateItem(item.localId, "title", event.target.value)}
                    placeholder="e.g. Sugar, bus fare, mobile data"
                    maxLength={120}
                    required
                  />
                </label>
                <label className="field expense-item-amount">
                  <span>Amount</span>
                  <span className="money-input">
                    <b>{symbol}</b>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(event) => updateItem(item.localId, "amount", event.target.value)}
                      placeholder="0"
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      required
                    />
                  </span>
                </label>
                <label className="field expense-item-category">
                  <span>Category</span>
                  <select value={item.category} onChange={(event) => updateItem(item.localId, "category", event.target.value)}>
                    {CATEGORIES.map((category) => (
                      <option key={category.name} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </label>
                {!expense && items.length > 1 && (
                  <button className="remove-item-button" type="button" onClick={() => removeItem(item.localId)} aria-label={`Remove item ${index + 1}`}>
                    <DeleteOutlineRoundedIcon />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!expense && (
            <div className="item-entry-help">
              <button className="add-another-button" type="button" onClick={() => setItems((current) => [...current, blankItem()])}>
                <AddRoundedIcon />
                Add another item for this date
              </button>
              <small>Separate rows give you accurate totals when you search for a specific item later.</small>
            </div>
          )}

          <label className="field">
            <span>Note <small>(optional)</small></span>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Anything useful to remember about this expense" maxLength={240} rows={3} />
          </label>

          {error && <div className="form-feedback form-feedback--error" role="alert">{error}</div>}

          <footer className="modal-footer">
            <div className="expense-total">
              <ReceiptLongRoundedIcon />
              <span>
                <small>{items.length > 1 ? `${items.length} items` : "Total"}</small>
                <strong>{formatMoney(total, currency)}</strong>
              </span>
            </div>
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={onClose} disabled={saving}>Cancel</button>
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? "Saving…" : expense ? "Save changes" : items.length > 1 ? "Save expenses" : "Save expense"}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
