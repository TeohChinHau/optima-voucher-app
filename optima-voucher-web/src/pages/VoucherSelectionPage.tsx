import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getAllVouchers } from "../api/voucherApi";
import type { Voucher } from "../types";
import { ShoppingCart } from "lucide-react";

export default function VoucherSelectionPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const categoryFilter = searchParams.get("category") || "All";

  useEffect(() => {
    getAllVouchers()
      .then((res) => {
        if (res.data.success && res.data.data) setVouchers(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(vouchers.map((v) => v.category?.name || "Other")))];

  const filtered = vouchers.filter((v) => {
    const matchesCategory =
      categoryFilter === "All" ? true : (v.category?.name || "Other") === categoryFilter;
    const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategoryClick = (cat: string) => {
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-sm text-orange-400 hover:underline">
          ← Back
        </Link>
        <h1 className="text-lg font-bold">{categoryFilter === "All" ? "All Vouchers" : categoryFilter}</h1>
        <Link to="/cart" className="text-orange-400 hover:text-orange-300">
          <ShoppingCart size={20} />
        </Link>
      </div>

      <div className="p-6">
        <input
          type="text"
          placeholder="Search vouchers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-4"
        />

        {/* Category filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                categoryFilter === cat
                  ? "bg-orange-500 text-white"
                  : "bg-white text-slate-600 border hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500">No vouchers found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtered.map((v) => (
              <div
                key={v.id}
                onClick={() => navigate(`/vouchers/${v.id}`)}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
              >
                <h3 className="font-semibold">{v.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{v.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-orange-500 font-bold">{v.pointsCost} pts</span>
                  <span className="text-xs text-slate-400">{v.stockQuantity} left</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}