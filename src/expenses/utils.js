import { CATEGORIES } from "./constants";

export const toISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const todayISO = () => toISODate(new Date());

export const parseLocalDate = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (date, count) => {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
};

export const getPresetRange = (preset, customStart, customEnd) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (preset === "today") {
    const value = toISODate(today);
    return { start: value, end: value };
  }

  if (preset === "last7") {
    return { start: toISODate(addDays(today, -6)), end: toISODate(today) };
  }

  if (preset === "last30") {
    return { start: toISODate(addDays(today, -29)), end: toISODate(today) };
  }

  if (preset === "month") {
    return {
      start: toISODate(new Date(today.getFullYear(), today.getMonth(), 1)),
      end: toISODate(today),
    };
  }

  if (preset === "custom") {
    return { start: customStart || null, end: customEnd || null };
  }

  return { start: null, end: null };
};

export const getRangeDayCount = (start, end, fallback = 1) => {
  if (!start || !end) return fallback;
  const milliseconds = parseLocalDate(end) - parseLocalDate(start);
  return Math.max(1, Math.floor(milliseconds / 86400000) + 1);
};

export const formatMoney = (amount, currency = "NGN", compact = false) => {
  const safeAmount = Number(amount) || 0;

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
      notation: compact && Math.abs(safeAmount) >= 1000000 ? "compact" : "standard",
    }).format(safeAmount);
  } catch {
    return `${currency} ${safeAmount.toLocaleString()}`;
  }
};

export const formatLongDate = (date) =>
  parseLocalDate(date).toLocaleDateString("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const formatShortDate = (date) =>
  parseLocalDate(date).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
  });

export const getRelativeDateLabel = (date) => {
  const today = todayISO();
  const yesterday = toISODate(addDays(new Date(), -1));
  if (date === today) return "Today";
  if (date === yesterday) return "Yesterday";
  return formatLongDate(date);
};

export const categoryDetails = (name) =>
  CATEGORIES.find((category) => category.name === name) || CATEGORIES.at(-1);

export const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "DS";
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export const sortExpenses = (expenses) =>
  [...expenses].sort((a, b) => {
    const dateDifference = b.expense_date.localeCompare(a.expense_date);
    if (dateDifference) return dateDifference;
    return (b.created_at || "").localeCompare(a.created_at || "");
  });

export const downloadCsv = (expenses) => {
  const headings = ["Date", "Item", "Category", "Amount", "Payment method", "Note"];
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows = expenses.map((expense) =>
    [
      expense.expense_date,
      expense.title,
      expense.category,
      Number(expense.amount),
      expense.payment_method,
      expense.note,
    ]
      .map(escape)
      .join(","),
  );
  const csv = [headings.map(escape).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `daily-spend-${todayISO()}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
