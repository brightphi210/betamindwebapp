import { useState } from "react";
import {
    FiArrowDownLeft,
    FiArrowUpRight,
    FiCheckCircle,
    FiChevronDown,
    FiCreditCard,
    FiDollarSign,
    FiPlus,
    FiTrendingUp,
    FiX,
} from "react-icons/fi";
import LoadingOverlay from "../../component/LoadingOverlay";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";

// TODO: replace with the real wallet/transactions hook once it exists.
type Transaction = {
    id: string;
    type: "payout" | "earning";
    label: string;
    amount: number;
    status: "completed" | "pending" | "failed";
    date: string;
};

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: "t1", type: "earning", label: "Mentorship session — Ada O.", amount: 15000, status: "completed", date: "Jul 18, 2026" },
    { id: "t2", type: "payout", label: "Withdrawal to GTBank ••1234", amount: -50000, status: "completed", date: "Jul 12, 2026" },
    { id: "t3", type: "earning", label: "\"System Design Basics\" course sale", amount: 24000, status: "completed", date: "Jul 10, 2026" },
    { id: "t4", type: "payout", label: "Withdrawal to GTBank ••1234", amount: -20000, status: "pending", date: "Jul 6, 2026" },
];

// TODO: replace with real balance data from the wallet hook.
const MOCK_BALANCE = {
    available: 69000,
    totalEarned: 214000,
    totalWithdrawn: 145000,
};

type BankAccount = { id: string; label: string };

const MOCK_BANK_ACCOUNTS: BankAccount[] = [
    { id: "b1", label: "GTBank ••1234" },
    { id: "b2", label: "Kuda ••8890" },
];

// Nigerian banks only, for now — matches the NGN-only scope of the wallet.
const NIGERIAN_BANKS = [
    "Access Bank",
    "Zenith Bank",
    "Guaranty Trust Bank (GTBank)",
    "First Bank of Nigeria",
    "United Bank for Africa (UBA)",
    "Fidelity Bank",
    "Union Bank",
    "Wema Bank",
    "Sterling Bank",
    "Stanbic IBTC",
    "Ecobank Nigeria",
    "First City Monument Bank (FCMB)",
    "Polaris Bank",
    "Keystone Bank",
    "Unity Bank",
    "Providus Bank",
    "Jaiz Bank",
    "SunTrust Bank",
    "Titan Trust Bank",
    "Opay",
    "PalmPay",
    "Kuda Bank",
    "Moniepoint MFB",
];

const STATUS_STYLES: Record<Transaction["status"], { color: string; bg: string; label: string }> = {
    completed: { color: "#a6ff00", bg: "rgba(166,255,0,0.1)", label: "Completed" },
    pending: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", label: "Pending" },
    failed: { color: "#f87171", bg: "rgba(248,113,113,0.1)", label: "Failed" },
};

// ─── Transaction row ────────────────────────────────────────────────────────
const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const isPayout = tx.type === "payout";
    const statusStyle = STATUS_STYLES[tx.status];
    return (
        <div className="flex items-center gap-3 rounded-xl p-4 bg-neutral-950">
            <div
                className="flex h-9 w-9 shrink-0 items-center bg-neutral-900 justify-center rounded-lg"
            >
                {isPayout ? (
                    <FiArrowUpRight size={15} className="text-red-200" />
                ) : (
                    <FiArrowDownLeft size={15} className="text-[#e1e6d8]" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{tx.label}</p>
                <p className="text-xs text-white/40">{tx.date}</p>
            </div>
            <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-white ">
                    {isPayout ? "-" : "+"}₦{Math.abs(tx.amount).toLocaleString()}
                </p>
                <span
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] bg-neutral-900 font-semibold"
                    style={{ color: statusStyle.color }}
                >
                    {statusStyle.label}
                </span>
            </div>
        </div>
    );
};

// ─── Add bank account modal ─────────────────────────────────────────────────
const AddBankModal: React.FC<{
    onClose: () => void;
    onAdd: (account: BankAccount) => void;
}> = ({ onClose, onAdd }) => {
    const [bankName, setBankName] = useState(NIGERIAN_BANKS[0]);
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const isValid = !!bankName && accountNumber.length === 10 && accountName.trim().length > 0;

    const handleSubmit = async () => {
        if (!isValid) return;
        setSubmitting(true);
        // TODO: call the real add-bank-account mutation here, ideally with
        // NUBAN resolution so accountName is verified rather than typed.
        await new Promise((res) => setTimeout(res, 800));
        setSubmitting(false);
        onAdd({
            id: `b${Date.now()}`,
            label: `${bankName} ••${accountNumber.slice(-4)}`,
        });
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                style={{
                    background: "rgba(10,13,9,0.85)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
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
                        className="shrink-0 rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                <h3 className="mb-1 text-xl font-black text-white">Add Bank Account</h3>
                <p className="mb-6 text-xs text-white/40">
                    Currently supports Nigerian bank accounts only — payouts are made in NGN.
                </p>

                <label className="mb-2 block text-xs font-semibold text-white/50">Bank</label>
                <div className="relative mb-4">
                    <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full appearance-none rounded-xl px-4 py-3 text-sm text-white outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                        {NIGERIAN_BANKS.map((b) => (
                            <option key={b} value={b} className="bg-[#0a0f08]">
                                {b}
                            </option>
                        ))}
                    </select>
                    <FiChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                    />
                </div>

                <label className="mb-2 block text-xs font-semibold text-white/50">Account Number</label>
                <input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                    placeholder="0123456789"
                    className="mb-1 w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <p className="mb-4 text-[11px] text-white/30">10-digit NUBAN account number.</p>

                <label className="mb-2 block text-xs font-semibold text-white/50">Account Name</label>
                <input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Name on the account"
                    className="mb-6 w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />

                <Button onClick={handleSubmit} variant="green" className="w-full" disabled={!isValid || submitting}>
                    {submitting ? "Verifying…" : "Add Bank Account"}
                </Button>
            </div>
        </div>
    );
};

// ─── Withdraw modal ─────────────────────────────────────────────────────────
const WithdrawModal: React.FC<{
    availableBalance: number;
    bankAccounts: BankAccount[];
    onClose: () => void;
}> = ({ availableBalance, bankAccounts, onClose }) => {
    const [amount, setAmount] = useState("");
    const [bankId, setBankId] = useState(bankAccounts[0]?.id ?? "");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const numericAmount = parseFloat(amount) || 0;
    const isValid = numericAmount > 0 && numericAmount <= availableBalance && !!bankId;

    const handleQuickSelect = (pct: number) => {
        setAmount(String(Math.floor((availableBalance * pct) / 100)));
    };

    const handleSubmit = async () => {
        if (!isValid) return;
        setSubmitting(true);
        // TODO: call the real withdraw-funds mutation here.
        await new Promise((res) => setTimeout(res, 900));
        setSubmitting(false);
        setSuccess(true);
    };

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                style={{
                    background: "rgba(10,13,9,0.85)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {success ? (
                    <div className="flex flex-col items-center py-4 text-center">
                        <div
                            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                            style={{ background: "rgba(166,255,0,0.12)" }}
                        >
                            <FiCheckCircle size={26} className="text-[#a6ff00]" />
                        </div>
                        <h3 className="mb-1 text-lg font-black text-white">Withdrawal Requested</h3>
                        <p className="mb-6 text-sm text-white/50">
                            ₦{numericAmount.toLocaleString()} is on its way to{" "}
                            {bankAccounts.find((b) => b.id === bankId)?.label}. It typically takes 1–3
                            business days.
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
                        <h3 className="mb-1 text-lg font-black text-white">No Bank Account Linked</h3>
                        <p className="mb-6 text-sm text-white/50">
                            Add a Nigerian bank account first so we know where to send your withdrawals.
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
                                className="shrink-0 rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <h3 className="mb-1 text-xl font-black text-white">Withdraw Funds</h3>
                        <p className="mb-6 text-xs text-white/40">
                            Available balance: ₦{availableBalance.toLocaleString()}
                        </p>

                        <label className="mb-2 block text-xs font-semibold text-white/50">Amount</label>
                        <div
                            className="mb-3 flex items-center gap-2 rounded-xl px-4 py-3"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            <span className="text-white/40 text-sm">₦</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/20"
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

                        <label className="mb-2 block text-xs font-semibold text-white/50">Withdraw to</label>
                        <div className="relative mb-6">
                            <select
                                value={bankId}
                                onChange={(e) => setBankId(e.target.value)}
                                className="w-full appearance-none rounded-xl px-4 py-3 text-sm text-white outline-none"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                                {bankAccounts.map((b) => (
                                    <option key={b.id} value={b.id} className="bg-[#0a0f08]">
                                        {b.label}
                                    </option>
                                ))}
                            </select>
                            <FiChevronDown
                                size={16}
                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                            />
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/30">
                                <FiCreditCard size={12} />
                                Manage accounts below
                            </div>
                        </div>

                        {numericAmount > availableBalance && (
                            <p className="mb-4 text-xs font-medium text-red-400">
                                Amount exceeds your available balance.
                            </p>
                        )}

                        <Button
                            onClick={handleSubmit}
                            variant="green"
                            className="w-full"
                            disabled={!isValid || submitting}
                        >
                            {submitting ? "Processing…" : `Withdraw ₦${numericAmount.toLocaleString() || "0"}`}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Wallet page ────────────────────────────────────────────────────────────
const Wallet = () => {
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showAddBank, setShowAddBank] = useState(false);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(MOCK_BANK_ACCOUNTS);
    const isLoading = false; // TODO: wire to the real wallet-fetch hook.

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <LoadingOverlay visible={isLoading} />

            <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">Wallet</h2>
            <p className="mb-6 text-sm text-white/40">Track your earnings and manage withdrawals.</p>

            {/* Balance hero */}
            <div
                className="relative bg-white/5! mb-8 overflow-hidden rounded-2xl p-6 sm:p-8"
                style={{
                    background:
                        "radial-gradient(ellipse 300px 200px at 100% 0%, rgba(166,255,0,0.2), transparent), rgba(255,255,255,0.02)",
                }}
            >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
                    Available Balance
                </p>
                <p className="mb-6 text-3xl font-black text-white sm:text-4xl">
                    ₦{MOCK_BALANCE.available.toLocaleString()}
                </p>

                <div className="mb-6 flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ background: "rgba(166,255,0,0.08)" }}
                        >
                            <FiTrendingUp size={14} className="text-[#a6ff00]" />
                        </div>
                        <div>
                            <p className="text-[11px] text-white/40">Total Earned</p>
                            <p className="text-sm font-bold text-white">
                                ₦{MOCK_BALANCE.totalEarned.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                            <FiArrowUpRight size={14} className="text-white/50" />
                        </div>
                        <div>
                            <p className="text-[11px] text-white/40">Total Withdrawn</p>
                            <p className="text-sm font-bold text-white">
                                ₦{MOCK_BALANCE.totalWithdrawn.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <Button onClick={() => setShowWithdraw(true)} variant="green">
                    Withdraw Funds
                </Button>
            </div>

            {/* Linked bank accounts */}
            <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Linked Bank Accounts</h3>
                    <button
                        type="button"
                        onClick={() => setShowAddBank(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#a6ff00] transition-opacity hover:opacity-80"
                    >
                        <FiPlus size={14} /> Add Bank
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    {bankAccounts.length === 0 ? (
                        <div
                            className="rounded-xl p-6 text-center text-sm text-white/40"
                            style={{ background: cardBg, border: cardBorder }}
                        >
                            No bank account linked yet.
                        </div>
                    ) : (
                        bankAccounts.map((b) => (
                            <div
                                key={b.id}
                                className="flex items-center gap-3 rounded-xl p-4"
                                style={{ background: cardBg, border: cardBorder }}
                            >
                                <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                    style={{ background: "rgba(166,255,0,0.08)" }}
                                >
                                    <FiCreditCard size={15} className="text-[#a6ff00]" />
                                </div>
                                <p className="text-sm font-medium text-white">{b.label}</p>
                                <span
                                    className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold text-white/40"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
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
                <h3 className="text-sm font-bold text-white">Previous Transactions</h3>
            </div>
            <div className="flex flex-col gap-3">
                {MOCK_TRANSACTIONS.length === 0 ? (
                    <div
                        className="rounded-xl p-8 text-center text-sm text-white/40"
                        style={{ background: cardBg, border: cardBorder }}
                    >
                        No transactions yet.
                    </div>
                ) : (
                    MOCK_TRANSACTIONS.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
                )}
            </div>

            {showWithdraw && (
                <WithdrawModal
                    availableBalance={MOCK_BALANCE.available}
                    bankAccounts={bankAccounts}
                    onClose={() => setShowWithdraw(false)}
                />
            )}

            {showAddBank && (
                <AddBankModal
                    onClose={() => setShowAddBank(false)}
                    onAdd={(account) => setBankAccounts((prev) => [...prev, account])}
                />
            )}
        </div>
    );
};

export default Wallet;