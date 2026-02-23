import DonationForm from "../../components/DonationForm";

export const metadata = {
  title: "Dashboard - Input Muzakki",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <DonationForm />
      </div>
    </main>
  );
}
