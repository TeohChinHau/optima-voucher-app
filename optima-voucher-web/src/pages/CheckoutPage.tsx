import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import client from "../api/client";
import { getCart, downloadRedemptionPdf } from "../api/cartApi";
import { useAuth } from "../context/AuthContext";
import type { CartItem, ApiResponse } from "../types";

interface RedeemedItem {
  id: number;
  voucherTitle: string;
}

interface CheckoutResult {
  remainingPoints: number;
  redeemedItems: RedeemedItem[];
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    redeemedItems?: RedeemedItem[];
  } | null>(null);
  const { points, login: setAuth, token, fullName } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getCart()
      .then((res) => {
        if (res.data.success && res.data.data) setItems(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPoints = items.reduce(
    (sum, item) => sum + (item.voucher?.pointsCost || 0) * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      const res = await client.post<ApiResponse<CheckoutResult>>(
        "/redemption/checkout",
      );
      if (res.data.success) {
        setResult({
          success: true,
          message: "Redemption successful!",
          redeemedItems: res.data.data?.redeemedItems,
        });
        if (res.data.data && token) {
          setAuth(token, fullName || "", res.data.data.remainingPoints);
        }
      } else {
        setResult({
          success: false,
          message: res.data.message || "Redemption failed.",
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.response?.data?.message || "Redemption failed.",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <Link to="/cart" className="text-sm text-orange-400 hover:underline">
          ← Back
        </Link>
        <h1 className="text-lg font-bold">Checkout</h1>
        <span className="w-10" />
      </div>

      <div className="p-6 max-w-lg mx-auto">
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 && !result ? (
          <p className="text-slate-500">Your cart is empty.</p>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm mb-2">
                <span>
                  {item.voucher?.title} × {item.quantity}
                </span>
                <span>
                  {(item.voucher?.pointsCost || 0) * item.quantity} pts
                </span>
              </div>
            ))}
            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>{totalPoints} pts</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Your balance: {points.toLocaleString()} pts
            </p>

            <button
              onClick={handleCheckout}
              disabled={processing || items.length === 0}
              className="w-full bg-orange-500 text-white rounded py-3 font-semibold hover:bg-orange-600 mt-6 disabled:opacity-50"
            >
              {processing ? "Processing..." : "Confirm & Redeem"}
            </button>
          </div>
        )}
      </div>

      {/* Success/failure modal */}
      {result && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-96 text-center max-h-[80vh] overflow-y-auto">
            <p
              className={`text-lg font-bold mb-2 ${
                result.success ? "text-green-600" : "text-red-500"
              }`}
            >
              {result.success ? "Success!" : "Failed"}
            </p>
            <p className="text-sm text-slate-600 mb-4">{result.message}</p>

            {result.success &&
              result.redeemedItems &&
              result.redeemedItems.length > 0 && (
                <div className="text-left space-y-2 mb-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Download your vouchers:
                  </p>
                  {result.redeemedItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => downloadRedemptionPdf(item.id)}
                      className="w-full flex justify-between items-center border rounded px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <span>{item.voucherTitle}</span>
                      <span className="text-orange-500 font-semibold">
                        Download PDF
                      </span>
                    </button>
                  ))}
                </div>
              )}

            <button
              onClick={() => navigate(result.success ? "/dashboard" : "/cart")}
              className="w-full bg-orange-500 text-white rounded py-2 font-semibold hover:bg-orange-600"
            >
              {result.success ? "Back to Dashboard" : "Back to Cart"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
