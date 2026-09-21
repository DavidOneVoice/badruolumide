/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import CategoryIcon from "./CategoryIcon";
import { CATEGORIES } from "./constants";
import {
  addDays,
  categoryDetails,
  downloadCsv,
  formatMoney,
  formatShortDate,
  getInitials,
  getPresetRange,
  getRangeDayCount,
  getRelativeDateLabel,
  sortExpenses,
  todayISO,
  toISODate,
} from "./utils";

const PERIOD_LABELS = {
  today: "Today",
  last7: "Last 7 days",
  last30: "Last 30 days",
  month: "This month",
  all: "All time",
  custom: "Custom dates",
};

const DAY_LABEL = new Intl.DateTimeFormat("en", { weekday: "short" });

export default function Dashboard({
  profile,
  userEmail,
  expenses,
  dataError,
  onAdd,
  onEdit,
  onDelete,
  onOpenSettings,
  onSignOut,
}) {
  const [period, setPeriod] = useState("last7");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState(todayISO());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const currency = profile.currency || "NGN";
  const displayName = profile.full_name || userEmail?.split("@")[0] || "there";
  const firstName = displayName.split(/\s+/)[0];
  const range = useMemo(
    () => getPresetRange(period, customStart, customEnd),
    [period, customStart, customEnd],
  );

  const filteredExpenses = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sortExpenses(expenses).filter((expense) => {
      const inDateRange =
        (!range.start || expense.expense_date >= range.start) &&
        (!range.end || expense.expense_date <= range.end);
      const inCategory = category === "All categories" || expense.category === category;
      const searchable = `${expense.title} ${expense.category} ${expense.note || ""} ${expense.payment_method || ""}`.toLowerCase();
      const matchesSearch = !term || searchable.includes(term);
      return inDateRange && inCategory && matchesSearch;
    });
  }, [expenses, range, category, search]);

  const total = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const rangeDayCount =
    period === "all"
      ? Math.max(1, new Set(filteredExpenses.map((expense) => expense.expense_date)).size)
      : getRangeDayCount(range.start, range.end);
  const average = total / rangeDayCount;

  const breakdown = useMemo(() => {
    const totals = new Map();
    filteredExpenses.forEach((expense) => {
      totals.set(expense.category, (totals.get(expense.category) || 0) + Number(expense.amount));
    });
    return [...totals.entries()]
      .map(([name, amount]) => ({ name, amount, ...categoryDetails(name) }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const topCategory = breakdown[0];

  const monthStart = todayISO().slice(0, 8) + "01";
  const monthTotal = expenses
    .filter((expense) => expense.expense_date >= monthStart && expense.expense_date <= todayISO())
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
  const budget = Number(profile.monthly_budget) || 0;
  const budgetPercentage = budget ? Math.min(100, Math.round((monthTotal / budget) * 100)) : 0;
  const budgetRemaining = Math.max(0, budget - monthTotal);

  const week = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(today, index - 6);
      const iso = toISODate(date);
      const amount = expenses
        .filter((expense) => expense.expense_date === iso)
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      return { iso, label: DAY_LABEL.format(date).slice(0, 2), amount };
    });
  }, [expenses]);

  const weekMaximum = Math.max(...week.map((day) => day.amount), 1);
  const weekTotal = week.reduce((sum, day) => sum + day.amount, 0);

  const donutBackground = useMemo(() => {
    if (!total || !breakdown.length) return "conic-gradient(#edf0f4 0 100%)";
    let cursor = 0;
    const slices = breakdown.map((item) => {
      const start = cursor;
      cursor += (item.amount / total) * 100;
      return `${item.color} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${slices.join(", ")})`;
  }, [breakdown, total]);

  const groupedExpenses = useMemo(() => {
    const groups = new Map();
    filteredExpenses.forEach((expense) => {
      const current = groups.get(expense.expense_date) || [];
      current.push(expense);
      groups.set(expense.expense_date, current);
    });
    return [...groups.entries()];
  }, [filteredExpenses]);

  const handleDelete = async (expense) => {
    setDeleting(expense.id);
    try {
      await onDelete(expense);
      setConfirmingDelete(null);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="dashboard-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand-lockup">
            <span className="brand-mark">DS</span>
            <span>
              <strong>Daily Spend</strong>
              <small>by Badru Olumide</small>
            </span>
          </div>

          <div className="header-actions">
            <button className="primary-button add-expense-button" type="button" onClick={onAdd}>
              <AddRoundedIcon />
              Add expense
            </button>

            <details className="account-menu">
              <summary aria-label="Open account menu">
                <span className="avatar">{getInitials(displayName)}</span>
                <span className="account-name">
                  <strong>{displayName}</strong>
                  <small>{userEmail}</small>
                </span>
                <KeyboardArrowDownRoundedIcon />
              </summary>
              <div className="account-popover">
                <button type="button" onClick={onOpenSettings}>
                  <SettingsRoundedIcon />
                  Preferences
                </button>
                <button type="button" onClick={onSignOut}>
                  <LogoutRoundedIcon />
                  Sign out
                </button>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-intro">
          <div>
            <p className="eyebrow">{new Date().toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" })}</p>
            <h1>Good to see you, {firstName}.</h1>
            <p className="dashboard-intro__text">Here’s the clearest picture of your recent spending.</p>
          </div>
          <div className="period-control">
            <CalendarMonthRoundedIcon />
            <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Choose date period">
              <option value="today">Today</option>
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
              <option value="month">This month</option>
              <option value="all">All time</option>
              <option value="custom">Custom dates</option>
            </select>
          </div>
        </section>

        {period === "custom" && (
          <section className="custom-date-bar" aria-label="Custom date range">
            <label>
              <span>From</span>
              <input type="date" value={customStart} max={customEnd || todayISO()} onChange={(event) => setCustomStart(event.target.value)} />
            </label>
            <span>to</span>
            <label>
              <span>Until</span>
              <input type="date" value={customEnd} min={customStart} max={todayISO()} onChange={(event) => setCustomEnd(event.target.value)} />
            </label>
          </section>
        )}

        {dataError && (
          <div className="data-alert" role="alert">
            <strong>We couldn’t refresh your records.</strong>
            <span>{dataError}</span>
          </div>
        )}

        <section className="summary-grid" aria-label={`${PERIOD_LABELS[period]} spending summary`}>
          <article className="summary-card summary-card--primary">
            <div className="summary-card__top">
              <span>Spent · {PERIOD_LABELS[period]}</span>
              <TrendingUpRoundedIcon />
            </div>
            <strong>{formatMoney(total, currency, true)}</strong>
            <small>{filteredExpenses.length} {filteredExpenses.length === 1 ? "entry" : "entries"}</small>
          </article>

          <article className="summary-card">
            <div className="summary-card__top"><span>Average per day</span></div>
            <strong>{formatMoney(average, currency, true)}</strong>
            <small>Across {rangeDayCount} {rangeDayCount === 1 ? "day" : "days"}</small>
          </article>

          <article className="summary-card">
            <div className="summary-card__top"><span>Top category</span></div>
            <strong className="summary-category">{topCategory?.name || "No spending yet"}</strong>
            <small>{topCategory ? formatMoney(topCategory.amount, currency) : "Add an expense to begin"}</small>
          </article>

          <article className="summary-card summary-card--budget">
            <div className="summary-card__top">
              <span>{budget ? "Left this month" : "Monthly target"}</span>
              <SavingsRoundedIcon />
            </div>
            <strong>{budget ? formatMoney(budgetRemaining, currency, true) : "Not set"}</strong>
            {budget ? (
              <div className="budget-progress" aria-label={`${budgetPercentage}% of monthly budget used`}>
                <span style={{ width: `${budgetPercentage}%` }} />
              </div>
            ) : (
              <button className="inline-link" type="button" onClick={onOpenSettings}>Set a monthly target</button>
            )}
          </article>
        </section>

        <section className="insight-grid">
          <article className="panel spending-chart-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Daily rhythm</p>
                <h2>Last 7 days</h2>
              </div>
              <strong>{formatMoney(weekTotal, currency)}</strong>
            </div>
            <div className="spending-chart" role="img" aria-label="Spending bar chart for the last seven days">
              {week.map((day) => (
                <div className="chart-day" key={day.iso} title={`${formatShortDate(day.iso)}: ${formatMoney(day.amount, currency)}`}>
                  <span className="chart-value">{day.amount ? formatMoney(day.amount, currency, true) : ""}</span>
                  <div className="chart-track">
                    <span style={{ height: `${day.amount ? Math.max(8, (day.amount / weekMaximum) * 100) : 3}%` }} />
                  </div>
                  <small className={day.iso === todayISO() ? "is-today" : ""}>{day.label}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="panel category-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Where it went</p>
                <h2>By category</h2>
              </div>
            </div>
            {breakdown.length ? (
              <div className="category-breakdown">
                <div className="donut" style={{ background: donutBackground }}>
                  <div>
                    <strong>{formatMoney(total, currency, true)}</strong>
                    <small>Total</small>
                  </div>
                </div>
                <div className="category-legend">
                  {breakdown.slice(0, 4).map((item) => (
                    <div key={item.name}>
                      <span className="legend-dot" style={{ backgroundColor: item.color }} />
                      <span>
                        <strong>{item.name}</strong>
                        <small>{Math.round((item.amount / total) * 100)}% of spend</small>
                      </span>
                      <b>{formatMoney(item.amount, currency, true)}</b>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="small-empty-state">
                <span className="empty-receipt"><CategoryIcon category="Other" size={28} /></span>
                <p>Your category picture will appear after you add an expense in this period.</p>
              </div>
            )}
          </article>
        </section>

        <section className="panel transactions-panel">
          <div className="transactions-heading">
            <div>
              <p className="panel-kicker">Your records</p>
              <h2>Expenses</h2>
            </div>
            <button className="secondary-button export-button" type="button" onClick={() => downloadCsv(filteredExpenses)} disabled={!filteredExpenses.length}>
              <DownloadRoundedIcon />
              Export CSV
            </button>
          </div>

          <div className="transaction-filters">
            <label className="search-field">
              <SearchRoundedIcon />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sugar, transport, note…"
                aria-label="Search expenses"
              />
            </label>
            <label className="category-filter">
              <span className="sr-only">Filter by category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option>All categories</option>
                {CATEGORIES.map((item) => <option key={item.name}>{item.name}</option>)}
              </select>
            </label>
          </div>

          {groupedExpenses.length ? (
            <div className="transaction-groups">
              {groupedExpenses.map(([date, dateExpenses]) => (
                <section className="transaction-group" key={date}>
                  <header>
                    <h3>{getRelativeDateLabel(date)}</h3>
                    <span>{formatMoney(dateExpenses.reduce((sum, item) => sum + Number(item.amount), 0), currency)}</span>
                  </header>
                  <div className="transaction-list">
                    {dateExpenses.map((expense) => {
                      const details = categoryDetails(expense.category);
                      return (
                        <article className="transaction-row" key={expense.id}>
                          <span className="transaction-icon" style={{ backgroundColor: details.soft, color: details.color }}>
                            <CategoryIcon category={expense.category} />
                          </span>
                          <div className="transaction-details">
                            <strong>{expense.title}</strong>
                            <span>{expense.category} <i /> {expense.payment_method || "Not specified"}{expense.note ? <> <i /> {expense.note}</> : null}</span>
                          </div>
                          <strong className="transaction-amount">{formatMoney(expense.amount, currency)}</strong>
                          {confirmingDelete === expense.id ? (
                            <div className="delete-confirm">
                              <span>Delete?</span>
                              <button type="button" onClick={() => handleDelete(expense)} disabled={deleting === expense.id}>{deleting === expense.id ? "…" : "Yes"}</button>
                              <button type="button" onClick={() => setConfirmingDelete(null)}>Keep</button>
                            </div>
                          ) : (
                            <div className="transaction-actions">
                              <button type="button" onClick={() => onEdit(expense)} aria-label={`Edit ${expense.title}`}><EditRoundedIcon /></button>
                              <button type="button" onClick={() => setConfirmingDelete(expense.id)} aria-label={`Delete ${expense.title}`}><DeleteOutlineRoundedIcon /></button>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state__icon"><SearchRoundedIcon /></span>
              <h3>{expenses.length ? "No matching expenses" : "Your spending journal starts here"}</h3>
              <p>
                {expenses.length
                  ? "Try another search, category, or date range."
                  : "Add your first expense now. You can record several items for the same date in one go."}
              </p>
              {!expenses.length && <button className="primary-button" type="button" onClick={onAdd}><AddRoundedIcon />Add your first expense</button>}
            </div>
          )}
        </section>
      </main>

      <button className="mobile-add-button" type="button" onClick={onAdd} aria-label="Add expense">
        <AddRoundedIcon />
      </button>
    </div>
  );
}
