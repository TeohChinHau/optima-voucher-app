import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getVoucherById } from "../api/voucherApi";
import { addToCart } from "../api/cartApi";
import type { Voucher } from "../types";
import { useToast } from "../context/ToastContext";
import { ShoppingCart } from "lucide-react";

export default function VoucherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!id) return;
    getVoucherById(Number(id))
      .then((res) => {
        if (res.data.success && res.data.data) setVoucher(res.data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!voucher) return;
    try {
      await addToCart(voucher.id, quantity);
      showToast("Added to cart!");
    } catch {
      showToast("Failed to add to cart.", "error");
    }
  };

  const handleRedeemNow = async () => {
    if (!voucher) return;
    try {
      await addToCart(voucher.id, quantity);
      navigate("/checkout");
    } catch {
      showToast("Failed to redeem.", "error");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!voucher) return <p className="p-6">Voucher not found.</p>;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <Link
          to="/vouchers"
          className="text-sm text-orange-400 hover:underline"
        >
          ← Back
        </Link>
        <h1 className="text-lg font-bold">Voucher Detail</h1>
        <Link to="/cart" className="text-orange-400 hover:text-orange-300">
          <ShoppingCart size={20} />
        </Link>
      </div>

      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2">{voucher.title}</h2>
          <p className="text-slate-600 mb-4">{voucher.description}</p>
          <p className="text-orange-500 font-bold text-lg mb-1">
            {voucher.pointsCost} pts
          </p>
          <p className="text-sm text-slate-400 mb-4">
            {voucher.stockQuantity} in stock
          </p>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm">Quantity:</label>
            <input
              type="number"
              min={1}
              max={voucher.stockQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 border border-orange-500 text-orange-500 rounded py-2 font-semibold hover:bg-orange-50"
            >
              Add to Cart
            </button>
            <button
              onClick={handleRedeemNow}
              className="flex-1 bg-orange-500 text-white rounded py-2 font-semibold hover:bg-orange-600"
            >
              Redeem Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
