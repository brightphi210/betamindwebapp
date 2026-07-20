import { useState } from "react";
import {
    FiArrowDownLeft,
    FiArrowUpRight,
    FiCreditCard,
    FiInfo,
    FiLoader,
    FiX,
} from "react-icons/fi";
import { useOutletContext } from "react-router-dom";
import { cardBg, cardBorder, fieldClass } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
import { useGlobalContext } from "../../providers/GlobalContext";
import { type MentorDashboardContext } from "./MentorDashboardLayout";

// TODO: replace with a real wallet hook (balance + transactions endpoint) once
// it exists. Shapes are written to match what that endpoint will likely return.
type Transaction = {
    id: string;
    type: "payout" | "earning";
    label: string;
    amount: number;
    status: "completed" | "pending" | "failed";
    date: string;
};

const MOCK_WALLET = {
    availableBalance: 148250,
    pendingBalance: 32000,
    transactions: [
        { id: "t1", type: "earning", label: "Mentorship session — Ada O.", amount: 15000, status: "completed", date: "Jul 18, 2026" },
        { id: "t2", type: "payout", label: "Withdrawal to GTBank ••1234", amount: -50000, status: "completed", date: "Jul 12, 2026" },
        { id: "t3", type: "earning", label: "\"System Design Basics\" course sale", amount: 24000, status: "completed", date: "Jul 10, 2026" },
        { id: "t4", type: "payout", label: "Withdrawal to GTBank ••1234", amount: -20000, status: "pending", date: "Jul 6, 2026" },
        { id: "t5", type: "earning", label: "Mentorship session — Chidi E.", amount: 15000, status: "failed", date: "Jul 2, 2026" },
    ] as Transaction[],
};

const STATUS_STYLES: Record<Transaction["status"], { color: string; bg: string; label: string }> = {
    completed: { color: "#a6ff00", bg: "rgba(166,255,0,0.1)", label: "Completed" },
    pending: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", label: "Pending" },
    failed: { color: "#f87171", bg: "rgba(248,113,113,0.1)", label: "Failed" },
};

const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const isPayout = tx.type === "payout";
    const statusStyle = STATUS_STYLES[tx.status];
    return (
        <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: cardBg, border: cardBorder }}>
            <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: isPayout ? "rgba(248,113,113,0.1)" : "rgba(166,255,0,0.1)" }}
            >
                {isPayout ? (
                    <FiArrowUpRight size={15} className="text-red-400" />
                ) : (
                    <FiArrowDownLeft size={15} className="text-[#a6ff00]" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{tx.label}</p>
                <p className="text-xs text-white/40">{tx.date}</p>
            </div>
            <div className="shrink-0 text-right">
                <p className={`text-sm font-bold ${isPayout ? "text-red-400" : "text-[#a6ff00]"}`}>
                    {isPayout ? "-" : "+"}₦{Math.abs(tx.amount).toLocaleString()}
                </p>
                <span
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                    {statusStyle.label}
                </span>
            </div>
        </div>
    );
};

const WithdrawModal: React.FC<{
    availableBalance: number;
    bankAccount: any;
    onClose: () => void;
}> = ({ availableBalance, bankAccount, onClose }) => {
    const { addToast } = useGlobalContext();
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const numericAmount = parseInt(amount.replace(/[^0-9]/g, ""), 10) || 0;
    const hasBankDetails = !!(bankAccount?.account_number && bankAccount?.bank_name);
    const isValid = numericAmount > 0 && numericAmount <= availableBalance && hasBankDetails;

    const handleWithdraw = async () => {
        if (!isValid) return;
        setIsSubmitting(true);
        try {
            // TODO: wire up to the real withdrawal mutation, e.g.
            // await requestWithdrawal({ amount: numericAmount });
            await new Promise((resolve) => setTimeout(resolve, 900));
            addToast("Withdrawal requested", "success");
            onClose();
        } catch (error: any) {
            addToast(error?.response?.data?.message || "Withdrawal failed. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl p-6"
                style={{ background: "#0a0d09", border: cardBorder }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Withdraw Funds</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:text-white"
                        style={{ background: cardBg }}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                <p className="mb-4 text-xs text-white/40">
                    Available balance: <span className="font-semibold text-white">₦{availableBalance.toLocaleString()}</span>
                </p>

                {!hasBankDetails ? (
                    <div
                        className="mb-4 flex items-start gap-2 rounded-xl p-3 text-xs text-amber-400"
                        style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,.3)" }}
                    >
                        <FiInfo size={14} className="mt-0.5 shrink-0" />
                        Add your bank details on the Profile page before you can withdraw.
                    </div>
                ) : (
                    <div className="mb-4 rounded-xl p-3" style={{ background: cardBg, border: cardBorder }}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Payout to</p>
                        <p className="mt-1 text-sm text-white">
                            {bankAccount.bank_name} •••• {String(bankAccount.account_number).slice(-4)}
                        </p>
                        <p className="text-xs text-white/40">{bankAccount.account_name}</p>
                    </div>
                )}

                <label className="mb-2 block text-sm font-semibold text-white">Amount (NGN)</label>
                <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="0.00"
                    className={fieldClass}
                    style={{ background: cardBg, border: cardBorder }}
                />
                {numericAmount > availableBalance && (
                    <p className="mt-2 text-xs text-red-400">Amount exceeds your available balance.</p>
                )}

                <Button
                    variant="green"
                    className="mt-5 w-full"
                    disabled={!isValid || isSubmitting}
                    onClick={() => {
                        void handleWithdraw();
                    }}
                >
                    <span className="flex items-center justify-center gap-2">
                        {isSubmitting ? <FiLoader size={15} className="animate-spin" /> : <FiArrowUpRight size={15} />}
                        {isSubmitting ? "Processing..." : "Confirm Withdrawal"}
                    </span>
                </Button>
            </div>
        </div>
    );
};

const MentorWallet = () => {
    const { mentorProfile } = useOutletContext<MentorDashboardContext>();
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const wallet = MOCK_WALLET;

    return (
        <div>
            <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">Wallet</h2>
            <p className="mb-6 text-sm text-white/40">Track your earnings and manage payouts.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div
                    className="rounded-2xl p-6"
                    style={{ background: "rgba(166,255,0,0.06)", border: "1px solid rgba(166,255,0,.25)" }}
                >
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                        <FiCreditCard size={14} className="text-[#a6ff00]" />
                        Available Balance
                    </div>
                    <p className="mb-5 text-3xl font-black text-white sm:text-4xl">
                        ₦{wallet.availableBalance.toLocaleString()}
                    </p>
                    <Button variant="green" onClick={() => setShowWithdrawModal(true)}>
                        <span className="flex items-center justify-center gap-2">
                            <FiArrowUpRight size={15} />
                            Withdraw
                        </span>
                    </Button>
                </div>

                <div className="rounded-2xl p-6" style={{ background: cardBg, border: cardBorder }}>
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/40">
                        <FiLoader size={14} className="text-amber-400" />
                        Pending Balance
                    </div>
                    <p className="mb-5 text-3xl font-black text-white sm:text-4xl">
                        ₦{wallet.pendingBalance.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/40">Clears once in-progress payouts and sales settle.</p>
                </div>
            </div>

            <h3 className="mb-4 mt-8 text-sm font-bold text-white">Transaction History</h3>
            <div className="flex flex-col gap-3">
                {wallet.transactions.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} />
                ))}
            </div>

            {showWithdrawModal && (
                <WithdrawModal
                    availableBalance={wallet.availableBalance}
                    bankAccount={mentorProfile?.bank_account}
                    onClose={() => setShowWithdrawModal(false)}
                />
            )}
        </div>
    );
};

export default MentorWallet;