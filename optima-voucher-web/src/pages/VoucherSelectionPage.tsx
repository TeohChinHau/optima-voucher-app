import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getVouchers, getCategories } from "../api/voucherApi";
import { useDebounce } from "../hooks/useDebounce";
import type { Voucher, VoucherCategory } from "../types";

const PAGE_SIZE = 12;

export default function VoucherSelectionPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<VoucherCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const categoryParam = searchParams.get("category");
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Load categories once
  useEffect(() => {
    getCategories().then((res) => {
      if (res.data.success && res.data.data) setCategories(res.data.data);
    });
  }, []);

  // Reset to page 1 whenever search or category changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryParam]);

  // Fetch vouchers whenever search, category, or page changes
  useEffect(() => {
    setLoading(true);
    const selectedCategory = categories.find((c) => c.name === categoryParam);

    getVouchers({
      search: debouncedSearch || undefined,
      categoryId: selectedCategory?.id,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((res) => {
        if (res.data.success && res.data.data) {
          setVouchers(res.data.data.items);
          setTotalCount(res.data.data.totalCount);
        }
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, categoryParam, page, categories]);

  const handleCategoryClick = (catName: string) => {
    if (catName === "All") setSearchParams({});
    else setSearchParams({ category: catName });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-sm text-orange-400 hover:underline">
          ← Back
        </Link>
        <h1 className="text-lg font-bold">{categoryParam || "All Vouchers"}</h1>
        <Link to="/cart" className="text-sm text-orange-400 hover:underline">
          Cart
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

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => handleCategoryClick("All")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              !categoryParam
                ? "bg-orange-500 text-white"
                : "bg-white text-slate-600 border hover:bg-slate-50"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                categoryParam === cat.name
                  ? "bg-orange-500 text-white"
                  : "bg-white text-slate-600 border hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : vouchers.length === 0 ? (
          <p className="text-slate-500">No vouchers found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {vouchers.map((v) => (
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

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded border disabled:opacity-40 bg-white"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded border disabled:opacity-40 bg-white"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}