export const CATEGORIES = [
  { name: "Food & groceries", color: "#ff8b62", soft: "#fff1eb", icon: "food" },
  { name: "Transport", color: "#3f3dff", soft: "#eeedff", icon: "transport" },
  { name: "Bills & utilities", color: "#e1a617", soft: "#fff8df", icon: "bills" },
  { name: "Shopping", color: "#d25ca6", soft: "#fff0fa", icon: "shopping" },
  { name: "Health", color: "#e25562", soft: "#ffeff1", icon: "health" },
  { name: "Giving", color: "#00a98f", soft: "#e8faf6", icon: "giving" },
  { name: "Education", color: "#3479c9", soft: "#edf6ff", icon: "education" },
  { name: "Home", color: "#9a6b4f", soft: "#f8f0eb", icon: "home" },
  { name: "Entertainment", color: "#7f62cc", soft: "#f4f0ff", icon: "entertainment" },
  { name: "Other", color: "#78828c", soft: "#f1f4f6", icon: "other" },
];

export const PAYMENT_METHODS = ["Cash", "Card", "Bank transfer", "Other"];

export const CURRENCIES = [
  { code: "NGN", label: "Nigerian naira", symbol: "₦" },
  { code: "USD", label: "US dollar", symbol: "$" },
  { code: "GBP", label: "British pound", symbol: "£" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "CAD", label: "Canadian dollar", symbol: "$" },
];

export const DEFAULT_PROFILE = {
  full_name: "",
  currency: "NGN",
  monthly_budget: null,
};

export const SAMPLE_EXPENSES = [
  {
    id: "sample-1",
    title: "Tomatoes, sugar and onions",
    amount: 2300,
    category: "Food & groceries",
    expense_date: "2026-09-21",
    payment_method: "Cash",
    note: "Market run",
  },
  {
    id: "sample-2",
    title: "Bike ride",
    amount: 1200,
    category: "Transport",
    expense_date: "2026-09-20",
    payment_method: "Cash",
    note: "",
  },
  {
    id: "sample-3",
    title: "Bread and snack",
    amount: 2500,
    category: "Food & groceries",
    expense_date: "2026-09-20",
    payment_method: "Cash",
    note: "",
  },
  {
    id: "sample-4",
    title: "Sunday offering",
    amount: 800,
    category: "Giving",
    expense_date: "2026-09-20",
    payment_method: "Cash",
    note: "",
  },
  {
    id: "sample-5",
    title: "Vegetable soup ingredients",
    amount: 3500,
    category: "Food & groceries",
    expense_date: "2026-09-18",
    payment_method: "Bank transfer",
    note: "",
  },
  {
    id: "sample-6",
    title: "Mobile data",
    amount: 2000,
    category: "Bills & utilities",
    expense_date: "2026-09-17",
    payment_method: "Bank transfer",
    note: "",
  },
  {
    id: "sample-7",
    title: "Lunch",
    amount: 1800,
    category: "Food & groceries",
    expense_date: "2026-09-16",
    payment_method: "Card",
    note: "",
  },
];
