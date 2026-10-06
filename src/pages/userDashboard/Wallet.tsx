import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FiAlertCircle,
    FiArrowDownLeft,
    FiArrowUpRight,
    FiCheckCircle,
    FiChevronDown,
    FiCreditCard,
    FiDollarSign,
    FiLoader,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiTrendingUp,
    FiX,
} from "react-icons/fi";
import LoadingOverlay from "../../component/LoadingOverlay";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
import { useAddBankDetails } from "../../hooks/mutations/allMutation";
import {
    useGetBankDetails,
    useGetTransactions,
    useGetWallet,
} from "../../hooks/queries/allQueriess";

const PAYSTACK_BANKS_URL =
    "https://api.paystack.co/bank?country=nigeria&perPage=100";

type Transaction = {
    id: string;
    type: "payout" | "earning";
    label: string;
    amount: number;
    status: "completed" | "pending" | "failed";
    date: string;
};

type BankAccount = {
    id: string;
    label: string;
    bank_name?: string;
    bank_code?: string;
    account_number?: string;
    account_name?: string;
};

type NigerianBank = {
    name: string;
    code: string;
};

const STATUS_STYLES: Record<
    Transaction["status"],
    { color: string; bg: string; label: string }
> = {
    completed: {
        color: "#a6ff00",
        bg: "rgba(166,255,0,0.1)",
        label: "Completed",
    },
    pending: {
        color: "#fbbf24",
        bg: "rgba(251,191,36,0.1)",
        label: "Pending",
    },
    failed: {
        color: "#f87171",
        bg: "rgba(248,113,113,0.1)",
        label: "Failed",
    },
};

// ─── Response shape helpers ──────────────────────────────────────────────────
const toArray = (raw: any): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.banks)) return raw.banks;
    if (Array.isArray(raw.results)) return raw.results;
    if (Array.isArray(raw.data?.data)) return raw.data.data;
    if (raw.account_number || raw.bank_code) return [raw];
    return [];
};

const pickAccountName = (json: any): string | undefined =>
    json?.data?.account_name ??
    json?.account_name ??
    json?.data?.data?.account_name ??
    json?.result?.account_name;

const readJson = async (res: Response) => {
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        console.warn("Expected JSON, got:", text.slice(0, 120));
        throw new Error(
            res.ok
                ? "Unexpected response from the server. Check VITE_API_BASE_URL."
                : `Request failed (${res.status}).`
        );
    }
};

const mapTransaction = (t: any): Transaction => {
    const rawAmount = Number(String(t.amount ?? 0).replace(/,/g, "")) || 0;
    const txType = String(t.tx_type || "").toLowerCase();
    const isCredit = txType === "credit" || (txType !== "debit" && rawAmount > 0);
    const amount = isCredit ? Math.abs(rawAmount) : -Math.abs(rawAmount);

    const date = t.created_at
        ? new Date(t.created_at).toLocaleDateString("en-NG", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
        : "";

    return {
        id: String(t.id),
        type: isCredit ? "earning" : "payout",
        label:
            t.note ||
            (isCredit ? "Earning / credit" : "Withdrawal"),
        amount,
        status: "completed",
        date,
    };
};

// ─── Paystack calls ──────────────────────────────────────────────────────────
const fetchBanks = async (signal?: AbortSignal): Promise<NigerianBank[]> => {
    const res = await fetch(PAYSTACK_BANKS_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal,
    });
    const json = await readJson(res);
    if (!res.ok || json?.status === false) {
        throw new Error(json?.message || "Could not load the bank list");
    }

    const seen = new Set<string>();
    const banks = toArray(json)
        .filter((b: any) => b?.code && b?.name && b?.active !== false)
        .filter((b: any) =>
            seen.has(String(b.code)) ? false : seen.add(String(b.code))
        )
        .map((b: any) => ({ name: String(b.name), code: String(b.code) }))
        .sort((a, b) => a.name.localeCompare(b.name));

    if (!banks.length) throw new Error("The bank list came back empty");
    return banks;
};

// ⚠️ Move this to your backend. Never ship a secret key in the browser.
const PAYSTACK_SECRET_KEY =
    "sk_test_42d9af35caea20020dc82cae8d390c6a685d1b75";

const resolveAccount = async (
    accountNumber: string,
    bankCode: string,
    signal?: AbortSignal
): Promise<string> => {
    const res = await fetch(
        `https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(
            accountNumber
        )}&bank_code=${encodeURIComponent(bankCode)}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
            signal,
        }
    );
    const json = await readJson(res);
    if (!res.ok || json?.status === false) {
        throw new Error(json?.message || "We couldn't verify that account");
    }

    const name = pickAccountName(json);
    if (!name) throw new Error("No account name came back for this number");
    return name;
};

// ─── Transaction row ────────────────────────────────────────────────────────
const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const isPayout = tx.type === "payout";
    const statusStyle = STATUS_STYLES[tx.status];
    return (
        <div className="flex items-center gap-3 rounded-xl bg-neutral-950 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900">
                {isPayout ? (
                    <FiArrowUpRight size={15} className="text-red-200" />
                ) : (
                    <FiArrowDownLeft size={15} className="text-[#e1e6d8]" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                    {tx.label}
                </p>
                <p className="text-xs text-white/40">{tx.date}</p>
            </div>
            <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-white">
                    {isPayout ? "-" : "+"}₦
                    {Math.abs(tx.amount).toLocaleString()}
                </p>
                <span
                    className="mt-1 inline-block rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold"
                    style={{ color: statusStyle.color }}
                >
                    {statusStyle.label}
                </span>
            </div>
        </div>
    );
};

// ─── Animated modal wrapper ─────────────────────────────────────────────────
const AnimatedModal: React.FC<{
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}> = ({ open, onClose, children }) => {
    const [mounted, setMounted] = useState(open);
    const [visible, setVisible] = useState(false);

    const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 0 : 280;

    useEffect(() => {
        if (open) {
            setMounted(true);
            return;
        }
        setVisible(false);
        const t = setTimeout(() => setMounted(false), duration);
        return () => clearTimeout(t);
    }, [open, duration]);

    useEffect(() => {
        if (!mounted || !open) return;
        let raf2 = 0;
        const raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => setVisible(true));
        });
        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, [mounted, open]);

    useEffect(() => {
        if (!mounted) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [mounted, onClose]);

    if (!mounted) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[80] flex items-center justify-center px-4"
            style={{
                background: visible ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
                backdropFilter: visible ? "blur(8px)" : "blur(0px)",
                WebkitBackdropFilter: visible ? "blur(8px)" : "blur(0px)",
                transition: `background ${duration}ms ease, backdrop-filter ${duration}ms ease`,
            }}
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl p-6 shadow-2xl"
                style={{
                    background: "rgba(10,13,9,0.92)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    opacity: visible ? 1 : 0,
                    transform: visible
                        ? "scale(1) translateY(0)"
                        : "scale(0.94) translateY(14px)",
                    transition: `opacity ${duration}ms ease, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
                    willChange: "opacity, transform",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

// ─── Add bank account modal ─────────────────────────────────────────────────
type LookupState = "idle" | "resolving" | "resolved" | "error";

const AddBankModal: React.FC<{
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ open, onClose, onSuccess }) => {
    const [banks, setBanks] = useState<NigerianBank[]>([]);
    const [banksLoading, setBanksLoading] = useState(false);
    const [banksError, setBanksError] = useState<string | null>(null);
    const [bankQuery, setBankQuery] = useState("");

    const [bankCode, setBankCode] = useState("");
    const [accountNumber, setAccountNumber] = useState("");

    const [state, setState] = useState<LookupState>("idle");
    const [accountName, setAccountName] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const abortRef = useRef<AbortController | null>(null);
    const { mutate, isPending } = useAddBankDetails();

    const loadBanks = useCallback((signal?: AbortSignal) => {
        setBanksLoading(true);
        setBanksError(null);
        fetchBanks(signal)
            .then(setBanks)
            .catch((err) => {
                if (signal?.aborted) return;
                setBanksError(err?.message || "Could not load the bank list");
            })
            .finally(() => {
                if (!signal?.aborted) setBanksLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!open) return;
        setBankCode("");
        setAccountNumber("");
        setBankQuery("");
        setState("idle");
        setAccountName("");
        setErrorMsg(null);

        const ctrl = new AbortController();
        if (!banks.length) loadBanks(ctrl.signal);
        return () => ctrl.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        abortRef.current?.abort();

        if (!bankCode || accountNumber.length !== 10) {
            setState("idle");
            setAccountName("");
            setErrorMsg(null);
            return;
        }

        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setState("resolving");
        setAccountName("");
        setErrorMsg(null);

        const timer = setTimeout(async () => {
            try {
                const name = await resolveAccount(
                    accountNumber,
                    bankCode,
                    ctrl.signal
                );
                if (ctrl.signal.aborted) return;
                setAccountName(name);
                setState("resolved");
            } catch (err: any) {
                if (ctrl.signal.aborted) return;
                setState("error");
                setErrorMsg(err?.message || "Could not verify this account");
            }
        }, 450);

        return () => {
            clearTimeout(timer);
            ctrl.abort();
        };
    }, [accountNumber, bankCode]);

    const filteredBanks = useMemo(() => {
        const q = bankQuery.trim().toLowerCase();
        if (!q) return banks;
        return banks.filter((b) => b.name.toLowerCase().includes(q));
    }, [banks, bankQuery]);

    const selectedBank = useMemo(
        () => banks.find((b) => b.code === bankCode) ?? null,
        [banks, bankCode]
    );

    const isValid = state === "resolved" && !!accountName && !!selectedBank;

    const handleSubmit = () => {
        if (!isValid || isPending || !selectedBank) return;
        mutate(
            {
                bank_name: selectedBank.name,
                bank_code: selectedBank.code,
                account_number: accountNumber,
                account_name: accountName,
            },
            {
                onSuccess: () => {
                    onSuccess();
                    onClose();
                },
            }
        );
    };

    const fieldStyle = {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
    };

    return (
        <AnimatedModal open={open} onClose={onClose}>
            <div className="mb-4 flex items-start justify-between">
                <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                >
                    <FiCreditCard className="text-white/70" size={20} />
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                >
                    <FiX size={18} />
                </button>
            </div>

            <h3 className="mb-1 text-xl font-black text-white">
                Add bank account
            </h3>
            <p className="mb-6 text-xs text-white/40">
                Nigerian accounts only — payouts are sent in NGN.
            </p>

            <label className="mb-2 block text-xs font-semibold text-white/50">
                Bank
            </label>

            {banksError ? (
                <div
                    className="mb-4 flex items-start gap-3 rounded-xl p-3"
                    style={{
                        background: "rgba(248,113,113,0.08)",
                        border: "1px solid rgba(248,113,113,0.3)",
                    }}
                >
                    <FiAlertCircle
                        size={15}
                        className="mt-0.5 shrink-0 text-red-400"
                    />
                    <div className="min-w-0">
                        <p className="text-xs text-red-300">{banksError}</p>
                        <button
                            type="button"
                            onClick={() => loadBanks()}
                            className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-white/70 hover:text-white"
                        >
                            <FiRefreshCw size={11} /> Try again
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {banks.length > 12 && (
                        <div className="relative mb-2">
                            <FiSearch
                                size={14}
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                            />
                            <input
                                value={bankQuery}
                                onChange={(e) => setBankQuery(e.target.value)}
                                placeholder="Search banks"
                                className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/20 outline-none"
                                style={fieldStyle}
                            />
                        </div>
                    )}

                    <div className="relative mb-4">
                        <select
                            value={bankCode}
                            onChange={(e) => setBankCode(e.target.value)}
                            disabled={banksLoading || !banks.length}
                            className="w-full appearance-none rounded-xl px-4 py-3 text-sm text-white outline-none disabled:opacity-50"
                            style={fieldStyle}
                        >
                            <option value="" className="bg-[#0a0f08]">
                                {banksLoading
                                    ? "Loading banks…"
                                    : "Select your bank"}
                            </option>
                            {filteredBanks.map((b) => (
                                <option
                                    key={b.code}
                                    value={b.code}
                                    className="bg-[#0a0f08]"
                                >
                                    {b.name}
                                </option>
                            ))}
                        </select>
                        {banksLoading ? (
                            <FiLoader
                                size={16}
                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-white/40"
                            />
                        ) : (
                            <FiChevronDown
                                size={16}
                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                            />
                        )}
                    </div>
                </>
            )}

            <label className="mb-2 block text-xs font-semibold text-white/50">
                Account number
            </label>
            <div className="relative mb-1">
                <input
                    inputMode="numeric"
                    value={accountNumber}
                    disabled={!bankCode}
                    onChange={(e) =>
                        setAccountNumber(
                            e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
                        )
                    }
                    placeholder={
                        bankCode ? "0123456789" : "Select a bank first"
                    }
                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm tracking-wide text-white placeholder-white/20 outline-none transition-colors disabled:opacity-50"
                    style={{
                        ...fieldStyle,
                        border: `1px solid ${state === "error"
                            ? "rgba(248,113,113,0.4)"
                            : state === "resolved"
                                ? "rgba(166,255,0,0.35)"
                                : "rgba(255,255,255,0.08)"
                            }`,
                    }}
                />
                {state === "resolving" && (
                    <FiLoader
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-white/50"
                    />
                )}
                {state === "resolved" && (
                    <FiCheckCircle
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a6ff00]"
                    />
                )}
            </div>
            <p className="mb-4 text-[11px] text-white/30">
                {accountNumber.length > 0 && accountNumber.length < 10
                    ? `${10 - accountNumber.length} more digit${10 - accountNumber.length === 1 ? "" : "s"
                    }`
                    : "10-digit NUBAN number."}
            </p>

            <label className="mb-2 block text-xs font-semibold text-white/50">
                Account name
            </label>
            <div
                className="mb-2 flex min-h-[46px] items-center rounded-xl px-4 py-3 text-sm"
                style={{
                    ...fieldStyle,
                    border: `1px solid ${state === "resolved"
                        ? "rgba(166,255,0,0.35)"
                        : "rgba(255,255,255,0.08)"
                        }`,
                }}
            >
                {state === "resolving" ? (
                    <span className="text-white/40">
                        Checking with your bank…
                    </span>
                ) : accountName ? (
                    <span className="font-semibold text-white">
                        {accountName}
                    </span>
                ) : (
                    <span className="text-white/20">
                        Shows once your number is verified
                    </span>
                )}
            </div>

            {errorMsg && (
                <p className="mb-4 text-xs font-medium text-red-400">
                    {errorMsg}
                </p>
            )}
            {state === "resolved" && (
                <p className="mb-4 text-[11px] text-[#a6ff00]">
                    Verified. Confirm the name matches your account.
                </p>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid || isPending}
                className="mt-1 w-full rounded-lg bg-white px-4 py-3 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isPending ? "Adding…" : "Add bank account"}
            </button>
        </AnimatedModal>
    );
};

// ─── Withdraw modal ─────────────────────────────────────────────────────────
const WithdrawModal: React.FC<{
    open: boolean;
    availableBalance: number;
    bankAccounts: BankAccount[];
    onClose: () => void;
}> = ({ open, availableBalance, bankAccounts, onClose }) => {
    const [amount, setAmount] = useState("");
    const [bankId, setBankId] = useState(bankAccounts[0]?.id ?? "");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!open) return;
        setAmount("");
        setBankId(bankAccounts[0]?.id ?? "");
        setSubmitting(false);
        setSuccess(false);
    }, [open, bankAccounts]);

    const numericAmount = parseFloat(amount) || 0;
    const isValid =
        numericAmount > 0 && numericAmount <= availableBalance && !!bankId;

    const handleQuickSelect = (pct: number) => {
        setAmount(String(Math.floor((availableBalance * pct) / 100)));
    };

    const handleSubmit = async () => {
        if (!isValid) return;
        setSubmitting(true);
        // TODO: wire real withdraw mutation
        await new Promise((res) => setTimeout(res, 900));
        setSubmitting(false);
        setSuccess(true);
    };

    return (
        <AnimatedModal open={open} onClose={onClose}>
            {success ? (
                <div className="flex flex-col items-center py-4 text-center">
                    <div
                        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                        style={{ background: "rgba(166,255,0,0.12)" }}
                    >
                        <FiCheckCircle size={26} className="text-[#a6ff00]" />
                    </div>
                    <h3 className="mb-1 text-lg font-black text-white">
                        Withdrawal requested
                    </h3>
                    <p className="mb-6 text-sm text-white/50">
                        ₦{numericAmount.toLocaleString()} is on its way to{" "}
                        {bankAccounts.find((b) => b.id === bankId)?.label}. It
                        usually lands in 1–3 business days.
                    </p>
                    <Button onClick={onClose} variant="green" className="w-full">
                        Done
                    </Button>
                </div>
            ) : bankAccounts.length === 0 ? (
                <div className="flex flex-col items-center py-4 text-center">
                    <div
                        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                        <FiCreditCard className="text-white/50" size={24} />
                    </div>
                    <h3 className="mb-1 text-lg font-black text-white">
                        No bank account linked
                    </h3>
                    <p className="mb-6 text-sm text-white/50">
                        Add a Nigerian bank account so we know where to send
                        your withdrawals.
                    </p>
                    <Button onClick={onClose} variant="green" className="w-full">
                        Got it
                    </Button>
                </div>
            ) : (
                <>
                    <div className="mb-4 flex items-start justify-between">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-full"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                            <FiDollarSign className="text-white/70" size={20} />
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="shrink-0 rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <FiX size={18} />
                        </button>
                    </div>

                    <h3 className="mb-1 text-xl font-black text-white">
                        Withdraw funds
                    </h3>
                    <p className="mb-6 text-xs text-white/40">
                        Available balance: ₦{availableBalance.toLocaleString()}
                    </p>

                    <label className="mb-2 block text-xs font-semibold text-white/50">
                        Amount
                    </label>
                    <div
                        className="mb-3 flex items-center gap-2 rounded-xl px-4 py-3"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <span className="text-sm text-white/40">₦</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                        />
                    </div>

                    <div className="mb-6 flex items-center gap-2">
                        {[25, 50, 100].map((pct) => (
                            <button
                                key={pct}
                                type="button"
                                onClick={() => handleQuickSelect(pct)}
                                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:text-white"
                                style={{ background: "rgba(255,255,255,0.05)" }}
                            >
                                {pct === 100 ? "Max" : `${pct}%`}
                            </button>
                        ))}
                    </div>

                    <label className="mb-2 block text-xs font-semibold text-white/50">
                        Withdraw to
                    </label>
                    <div className="relative mb-6">
                        <select
                            value={bankId}
                            onChange={(e) => setBankId(e.target.value)}
                            className="w-full appearance-none rounded-xl px-4 py-3 text-sm text-white outline-none"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            {bankAccounts.map((b) => (
                                <option
                                    key={b.id}
                                    value={b.id}
                                    className="bg-[#0a0f08]"
                                >
                                    {b.label}
                                </option>
                            ))}
                        </select>
                        <FiChevronDown
                            size={16}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                        />
                    </div>

                    {numericAmount > availableBalance && (
                        <p className="mb-4 text-xs font-medium text-red-400">
                            That&apos;s more than your available balance.
                        </p>
                    )}

                    <Button
                        onClick={handleSubmit}
                        variant="green"
                        className="w-full"
                        disabled={!isValid || submitting}
                    >
                        {submitting
                            ? "Processing…"
                            : `Withdraw ₦${numericAmount.toLocaleString() || "0"}`}
                    </Button>
                </>
            )}
        </AnimatedModal>
    );
};

// ─── Wallet page ────────────────────────────────────────────────────────────
const Wallet = () => {
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showAddBank, setShowAddBank] = useState(false);

    const { walletData, isLoading } = useGetWallet();
    const {
        bankData,
        isLoading: isBankLoading,
        refetch: refetchBanks,
    } = useGetBankDetails();
    const { transactionsData, isLoading: isTxLoading } = useGetTransactions();

    const bankAccounts: BankAccount[] = useMemo(
        () =>
            toArray(bankData?.data ?? bankData).map((b: any) => ({
                id: b.id ?? b._id ?? `${b.bank_code}-${b.account_number}`,
                label: `${b.bank_name} ••${String(b.account_number || "").slice(-4)}`,
                bank_name: b.bank_name,
                bank_code: b.bank_code,
                account_number: b.account_number,
                account_name: b.account_name,
            })),
        [bankData]
    );

    const transactions: Transaction[] = useMemo(
        () =>
            toArray(transactionsData?.data ?? transactionsData).map(
                mapTransaction
            ),
        [transactionsData]
    );

    const myWalletData = walletData?.data;

    const availableBalance = Number(
        myWalletData?.balance ?? myWalletData?.available ?? 0
    );

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 anim-fade-up">
            <LoadingOverlay
                visible={isLoading || isBankLoading || isTxLoading}
            />

            <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">
                Wallet
            </h2>
            <p className="mb-6 text-sm text-white/40">
                Track your earnings and manage withdrawals.
            </p>

            {/* Balance hero */}
            <div
                className="relative mb-8 overflow-hidden rounded-2xl p-6 sm:p-8"
                style={{
                    background:
                        "radial-gradient(ellipse 300px 200px at 100% 0%, rgba(166,255,0,0.2), transparent), rgba(255,255,255,0.04)",
                }}
            >
                <p className="mb-2 text-xs font-semibold tracking-wide text-white/40">
                    Available balance
                </p>
                <p className="mb-6 text-3xl font-black text-white sm:text-4xl">
                    ₦
                    {availableBalance.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </p>

                <div className="mb-6 flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ background: "rgba(166,255,0,0.08)" }}
                        >
                            <FiTrendingUp
                                size={14}
                                className="text-[#a6ff00]"
                            />
                        </div>
                        <div>
                            <p className="text-[11px] text-white/40">
                                Total earned
                            </p>
                            <p className="text-sm font-bold text-white">
                                ₦
                                {Number(
                                    myWalletData?.totalEarned ?? 0
                                ).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                            <FiArrowUpRight
                                size={14}
                                className="text-white/50"
                            />
                        </div>
                        <div>
                            <p className="text-[11px] text-white/40">
                                Total withdrawn
                            </p>
                            <p className="text-sm font-bold text-white">
                                ₦
                                {Number(
                                    myWalletData?.totalWithdrawn ?? 0
                                ).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => setShowWithdraw(true)}
                    variant="white"
                >
                    Withdraw funds
                </Button>
            </div>

            {/* Linked bank accounts */}
            <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                        Linked bank accounts
                    </h3>
                    <button
                        type="button"
                        onClick={() => setShowAddBank(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#a6ff00] transition-opacity hover:opacity-80"
                    >
                        <FiPlus size={14} /> Add bank
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    {bankAccounts.length === 0 ? (
                        <div
                            className="rounded-xl p-6 text-center text-sm text-white/40"
                            style={{ background: cardBg, border: cardBorder }}
                        >
                            No bank account linked yet. Add one to withdraw.
                        </div>
                    ) : (
                        bankAccounts.map((b) => (
                            <div
                                key={b.id}
                                className="flex items-center gap-3 rounded-xl p-4"
                                style={{
                                    background: cardBg,
                                }}
                            >
                                <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                    style={{
                                        background: "rgba(166,255,0,0.08)",
                                    }}
                                >
                                    <FiCreditCard
                                        size={15}
                                        className="text-[#a6ff00]"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-white">
                                        {b.label}
                                    </p>
                                    {b.account_name && (
                                        <p className="truncate text-xs text-white/40">
                                            {b.account_name}
                                        </p>
                                    )}
                                </div>
                                <span
                                    className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold text-white/40"
                                    style={{
                                        background: "rgba(255,255,255,0.05)",
                                    }}
                                >
                                    NGN
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Transaction history */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                    Previous transactions
                </h3>
            </div>
            <div className="flex flex-col gap-3">
                {transactions.length === 0 ? (
                    <div
                        className="rounded-xl p-8 text-center text-sm text-white/40"
                        style={{ background: cardBg, border: cardBorder }}
                    >
                        No transactions yet.
                    </div>
                ) : (
                    transactions.map((tx) => (
                        <TransactionRow key={tx.id} tx={tx} />
                    ))
                )}
            </div>

            <WithdrawModal
                open={showWithdraw}
                availableBalance={availableBalance}
                bankAccounts={bankAccounts}
                onClose={() => setShowWithdraw(false)}
            />

            <AddBankModal
                open={showAddBank}
                onClose={() => setShowAddBank(false)}
                onSuccess={() => refetchBanks()}
            />
        </div>
    );
};

export default Wallet;