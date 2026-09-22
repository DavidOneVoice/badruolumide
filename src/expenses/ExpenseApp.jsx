/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { supabase } from "../../supabase";
import AuthScreen from "./AuthScreen";
import Dashboard from "./Dashboard";
import ExpenseDialog from "./ExpenseDialog";
import SettingsDialog from "./SettingsDialog";
import { DEFAULT_PROFILE, SAMPLE_EXPENSES } from "./constants";
import { sortExpenses } from "./utils";

const isDemo = import.meta.env.DEV && new URLSearchParams(window.location.search).has("demo");

const DEMO_SESSION = {
  user: {
    id: "demo-user",
    email: "olumide@example.com",
    user_metadata: { full_name: "Olumide David" },
  },
};

function LoadingScreen() {
  return (
    <main className="loading-screen">
      <span className="brand-mark">DS</span>
      <div className="loading-pulse" />
      <p>Opening your spending journal…</p>
    </main>
  );
}

function RecoveryScreen({ onSave, onCancel }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setFeedback({ type: "error", text: "The two passwords do not match." });
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      await onSave(password);
      setFeedback({ type: "success", text: "Your password has been updated." });
      window.setTimeout(onCancel, 900);
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "We couldn’t update your password." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="recovery-page">
      <form className="auth-form recovery-form" onSubmit={handleSubmit}>
        <div className="brand-lockup">
          <span className="brand-mark">DS</span>
          <span><strong>Daily Spend</strong><small>by Badru Olumide</small></span>
        </div>
        <div className="auth-heading">
          <h1>Choose a new password</h1>
          <p>Use at least six characters and keep it somewhere safe.</p>
        </div>
        <label className="field">
          <span>New password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} autoComplete="new-password" required />
        </label>
        <label className="field">
          <span>Confirm password</span>
          <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} autoComplete="new-password" required />
        </label>
        {feedback && (
          <div className={`form-feedback form-feedback--${feedback.type}`} role="status">
            {feedback.type === "success" && <CheckCircleRoundedIcon />}
            {feedback.text}
          </div>
        )}
        <button className="primary-button" type="submit" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
      </form>
    </main>
  );
}

export default function ExpenseApp() {
  const [session, setSession] = useState(isDemo ? DEMO_SESSION : null);
  const [authChecked, setAuthChecked] = useState(isDemo);
  const [recovering, setRecovering] = useState(false);
  const [profile, setProfile] = useState(
    isDemo
      ? { full_name: "Olumide David", currency: "NGN", monthly_budget: 80000 }
      : DEFAULT_PROFILE,
  );
  const [expenses, setExpenses] = useState(isDemo ? SAMPLE_EXPENSES : []);
  const [dataLoading, setDataLoading] = useState(Boolean(isDemo ? false : session));
  const [dataError, setDataError] = useState("");
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (isDemo) return undefined;
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      setAuthChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      setSession(nextSession);
      setAuthChecked(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = useCallback(async () => {
    if (!session?.user || isDemo) return;
    setDataLoading(true);
    setDataError("");

    try {
      const [profileResult, expenseResult] = await Promise.all([
        supabase.from("daily_spend_profiles").select("id, full_name, currency, monthly_budget").eq("id", session.user.id).maybeSingle(),
        supabase.from("daily_spend_expenses").select("id, title, amount, category, expense_date, payment_method, note, created_at, updated_at").eq("user_id", session.user.id).order("expense_date", { ascending: false }).order("created_at", { ascending: false }),
      ]);

      if (profileResult.error) throw profileResult.error;
      if (expenseResult.error) throw expenseResult.error;

      let nextProfile = profileResult.data;
      if (!nextProfile) {
        const starterProfile = {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "",
          currency: "NGN",
          monthly_budget: null,
        };
        const { data, error } = await supabase.from("daily_spend_profiles").upsert(starterProfile).select("id, full_name, currency, monthly_budget").single();
        if (error) throw error;
        nextProfile = data;
      }

      setProfile({ ...DEFAULT_PROFILE, ...nextProfile });
      setExpenses(sortExpenses(expenseResult.data || []));
    } catch (error) {
      console.error("Daily Spend data load failed", error);
      const missingTable = error.code === "42P01" || /relation .* does not exist/i.test(error.message || "");
      setDataError(
        missingTable
          ? "The expense database is not ready yet. Please try again shortly."
          : "Your saved records are safe, but the latest data could not be loaded. Refresh to try again.",
      );
    } finally {
      setDataLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user && !isDemo) {
      loadUserData();
    } else if (!session?.user && !isDemo) {
      setProfile(DEFAULT_PROFILE);
      setExpenses([]);
      setDataError("");
    }
  }, [session, loadUserData]);

  const signIn = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async ({ fullName, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/expenses/`,
      },
    });
    if (error) throw error;
    return { needsConfirmation: !data.session };
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/expenses/`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (isDemo) return;
    const { error } = await supabase.auth.signOut();
    if (error) setDataError("We couldn’t sign you out. Please try again.");
  };

  const openNewExpense = () => {
    setEditingExpense(null);
    setExpenseDialogOpen(true);
  };

  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseDialogOpen(true);
  };

  const saveExpense = async ({ items, expenseDate, paymentMethod, note }) => {
    setSavingExpense(true);
    setDataError("");

    try {
      if (editingExpense) {
        const values = {
          title: items[0].title,
          amount: items[0].amount,
          category: items[0].category,
          expense_date: expenseDate,
          payment_method: paymentMethod,
          note,
          updated_at: new Date().toISOString(),
        };

        if (isDemo) {
          setExpenses((current) => sortExpenses(current.map((item) => (item.id === editingExpense.id ? { ...item, ...values } : item))));
        } else {
          const { data, error } = await supabase.from("daily_spend_expenses").update(values).eq("id", editingExpense.id).eq("user_id", session.user.id).select().single();
          if (error) throw error;
          setExpenses((current) => sortExpenses(current.map((item) => (item.id === data.id ? data : item))));
        }
      } else {
        const values = items.map((item) => ({
          ...item,
          user_id: session.user.id,
          expense_date: expenseDate,
          payment_method: paymentMethod,
          note,
        }));

        if (isDemo) {
          const now = new Date().toISOString();
          const demoRows = values.map((item) => ({ ...item, id: crypto.randomUUID(), created_at: now }));
          setExpenses((current) => sortExpenses([...demoRows, ...current]));
        } else {
          const { data, error } = await supabase.from("daily_spend_expenses").insert(values).select();
          if (error) throw error;
          setExpenses((current) => sortExpenses([...(data || []), ...current]));
        }
      }

      setExpenseDialogOpen(false);
      setEditingExpense(null);
    } finally {
      setSavingExpense(false);
    }
  };

  const deleteExpense = async (expense) => {
    setDataError("");
    try {
      if (!isDemo) {
        const { error } = await supabase.from("daily_spend_expenses").delete().eq("id", expense.id).eq("user_id", session.user.id);
        if (error) throw error;
      }
      setExpenses((current) => current.filter((item) => item.id !== expense.id));
    } catch (error) {
      console.error("Daily Spend delete failed", error);
      setDataError("That expense could not be deleted. Please try again.");
    }
  };

  const saveSettings = async (values) => {
    setSavingSettings(true);
    try {
      const nextProfile = { ...profile, ...values };
      if (!isDemo) {
        const { data, error } = await supabase.from("daily_spend_profiles").upsert({ id: session.user.id, ...values, updated_at: new Date().toISOString() }).select("id, full_name, currency, monthly_budget").single();
        if (error) throw error;
        setProfile({ ...DEFAULT_PROFILE, ...data });
      } else {
        setProfile(nextProfile);
      }
      setSettingsOpen(false);
    } finally {
      setSavingSettings(false);
    }
  };

  const currentCurrency = useMemo(() => profile.currency || "NGN", [profile.currency]);

  if (!authChecked) return <LoadingScreen />;

  if (recovering) {
    return <RecoveryScreen onSave={updatePassword} onCancel={() => setRecovering(false)} />;
  }

  if (!session?.user) {
    return <AuthScreen onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />;
  }

  if (dataLoading) return <LoadingScreen />;

  return (
    <>
      <Dashboard
        profile={profile}
        userEmail={session.user.email}
        expenses={expenses}
        dataError={dataError}
        onAdd={openNewExpense}
        onEdit={openEditExpense}
        onDelete={deleteExpense}
        onOpenSettings={() => setSettingsOpen(true)}
        onSignOut={signOut}
      />
      <ExpenseDialog
        open={expenseDialogOpen}
        currency={currentCurrency}
        expense={editingExpense}
        saving={savingExpense}
        onClose={() => !savingExpense && setExpenseDialogOpen(false)}
        onSave={saveExpense}
      />
      <SettingsDialog
        open={settingsOpen}
        profile={profile}
        saving={savingSettings}
        onClose={() => !savingSettings && setSettingsOpen(false)}
        onSave={saveSettings}
      />
    </>
  );
}
