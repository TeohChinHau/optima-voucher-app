import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, LogOut, Coins, Crown, User, ShoppingCart } from "lucide-react";
import { getVouchers, getCategories } from "../api/voucherApi";
import { useAuth } from "../context/AuthContext";
import type { Voucher, VoucherCategory } from "../types";

export default function DashboardPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [categories, setCategories] = useState<VoucherCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { fullName, points, logout } = useAuth();
  const navigate = useNavigate();

  // Load categories once
  useEffect(() => {
    getCategories().then((res) => {
      if (res.data.success && res.data.data) setCategories(res.data.data);
    });
  }, []);

  // Load vouchers whenever the selected category changes
  useEffect(() => {
    setLoading(true);
    getVouchers({
      categoryId: selectedCategoryId ?? undefined,
      page: 1,
      pageSize: 8,
    })
      .then((res) => {
        if (res.data.success && res.data.data) setVouchers(res.data.data.items);
      })
      .finally(() => setLoading(false));
  }, [selectedCategoryId]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top nav */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-800">
        <img src="/logo.png" alt="Optima Bank" className="h-10" />
        <div className="flex items-center gap-8 text-sm font-medium">
          <Link to="/dashboard" className="border-b-2 border-orange-400 pb-1">Home</Link>
          <Link to="/vouchers" className="text-slate-400 hover:text-white">Voucher</Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              placeholder="Search here ..."
              className="bg-slate-800 rounded-full pl-9 pr-4 py-2 text-sm w-56 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/vouchers?search=${(e.target as HTMLInputElement).value}`);
              }}
            />
          </div>
          <Link
            to="/cart"
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700"
          >
            <ShoppingCart size={18} />
          </Link>
          <Link
            to="/profile"
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700"
          >
            <User size={18} />
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-slate-300 hover:text-white">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      <div className="px-8 py-6">
        <p className="text-sm text-slate-400 mb-6">Home &gt;</p>

        <h2 className="text-2xl font-bold mb-1">Welcome back, {fullName}!</h2>
        <p className="text-slate-400 mb-8">Ready to earn and redeem more rewards?</p>

        {/* Points + membership cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-800 to-indigo-900 rounded-2xl p-6 relative overflow-hidden">
            <p className="text-4xl font-extrabold mb-1">{points.toLocaleString()}</p>
            <p className="text-slate-200 mb-1">Available Points</p>
            <p className="text-sm text-slate-300">Ready to redeem rewards</p>
            <Coins className="absolute right-6 bottom-6 text-white/20" size={48} />
          </div>

          <div className="bg-gradient-to-br from-amber-900 to-yellow-950 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown size={20} className="text-yellow-400" />
                <p className="text-xl font-bold">Gold Member</p>
              </div>
              <p className="text-sm text-slate-300">Premium Benefit Active</p>
              <p className="text-sm text-slate-300">2× points on all purchases</p>
            </div>
            <Link
              to="/profile"
              className="self-start mt-4 bg-slate-800 text-white text-sm px-4 py-2 rounded-full hover:bg-slate-700"
            >
              View Details
            </Link>
          </div>
        </div>

        {/* Latest rewards */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Latest Rewards</h3>
          <Link to="/vouchers" className="text-sm text-orange-400 hover:underline">
            View All Rewards
          </Link>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              selectedCategoryId === null
                ? "bg-orange-500 text-slate-900"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                selectedCategoryId === cat.id
                  ? "bg-orange-500 text-slate-900"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : vouchers.length === 0 ? (
          <p className="text-slate-400">No vouchers in this category.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {vouchers.map((v) => (
              <div
                key={v.id}
                onClick={() => navigate(`/vouchers/${v.id}`)}
                className="bg-slate-100 text-slate-900 rounded-xl p-6 text-center font-bold cursor-pointer hover:bg-white transition"
              >
                {v.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}