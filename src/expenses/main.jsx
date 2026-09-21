import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ExpenseApp from "./ExpenseApp";
import "./expense.css";

createRoot(document.getElementById("expense-root")).render(
  <StrictMode>
    <ExpenseApp />
  </StrictMode>,
);
