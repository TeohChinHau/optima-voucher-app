import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCart, updateCartQuantity, removeFromCart } from "../api/cartApi";
import type { CartItem } from "../types";
import Button from "../components/Button";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCart = () => {
    setLoading(true);
    getCart()
      .then((res) => {
        if (res.data.success && res.data.data) setItems(res.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    await updateCartQuantity(id, quantity);
    loadCart();
  };

  const handleRemove = async (id: number) => {
    await removeFromCart(id);
    loadCart();
  };

  const totalPoints = items.reduce(
    (sum, item) => sum + (item.voucher?.pointsCost || 0) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-sm text-orange-400 hover:underline">
          ← Back
        </Link>
        <h1 className="text-lg font-bold">Your Cart</h1>
        <span className="w-10" />
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-slate-500">Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">{item.voucher?.title}</h3>
                    <p className="text-sm text-slate-500">
                      {item.voucher?.pointsCost} pts each
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 border rounded hover:bg-slate-50"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 border rounded hover:bg-slate-50"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-500 text-sm ml-3 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center mb-4">
              <span className="font-semibold">Total</span>
              <span className="text-orange-500 font-bold text-lg">{totalPoints} pts</span>
            </div>

            <Button onClick={() => navigate("/checkout")}>Proceed to Checkout</Button>
          </>
        )}
      </div>
    </div>
  );
}