import OperatorManagement from "../../components/OperatorManagement";
import TransactionSummary from "../../components/TransactionSummary";
import TransactionsManagement from "../../components/TransactionsManagement";

export const metadata = {
  title: "Admin - Dashboard",
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <TransactionSummary />
        <TransactionsManagement />
        <OperatorManagement />
      </div>
    </main>
  );
}
