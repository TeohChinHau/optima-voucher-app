import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
}

interface QuickReply {
  label: string;
  response: string;
  action?: { label: string; path: string };
}

const QUICK_REPLIES: QuickReply[] = [
  {
    label: "How do I redeem a voucher?",
    response:
      "Browse vouchers from the Dashboard or Voucher page, open one you like, set a quantity, then tap 'Redeem Now' to check out immediately, or 'Add to Cart' to save it for later.",
    action: { label: "Browse Vouchers", path: "/vouchers" },
  },
  {
    label: "How do points work?",
    response:
      "You earn points through your account activity, and each voucher has a points cost shown on its card. Redeeming a voucher deducts that cost from your balance — you can see your current balance on the Dashboard or your Profile page.",
  },
  {
    label: "How do I use my cart?",
    response:
      "Add vouchers to your cart from any voucher's detail page. From the Cart page, you can adjust quantities with the +/− buttons or remove items, then tap 'Proceed to Checkout' when ready.",
    action: { label: "View Cart", path: "/cart" },
  },
  {
    label: "Where's my redeemed voucher PDF?",
    response:
      "Right after a successful checkout, a 'Download your vouchers' list appears with a download button for each redeemed voucher's PDF.",
  },
  {
    label: "How do I change my password?",
    response:
      "Go to your Profile page and scroll to the 'Change Password' section. Enter your current password and a new one, then tap 'Update Password'.",
    action: { label: "Go to Profile", path: "/profile" },
  },
  {
    label: "How do I update my profile picture?",
    response:
      "On your Profile page, tap the small camera icon on your avatar circle to upload a new picture.",
    action: { label: "Go to Profile", path: "/profile" },
  },
];

const KEYWORD_MAP: { keywords: string[]; response: string }[] = [
  { keywords: ["redeem", "voucher"], response: QUICK_REPLIES[0].response },
  { keywords: ["point", "points"], response: QUICK_REPLIES[1].response },
  { keywords: ["cart", "checkout"], response: QUICK_REPLIES[2].response },
  { keywords: ["pdf", "download"], response: QUICK_REPLIES[3].response },
  { keywords: ["password"], response: QUICK_REPLIES[4].response },
  { keywords: ["picture", "photo", "avatar"], response: QUICK_REPLIES[5].response },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: "bot",
      text: "Hi! I'm here to help you navigate Optima Bank. Pick a topic below or type your question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [lastAction, setLastAction] = useState<{ label: string; path: string } | null>(null);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const addMessage = (from: "bot" | "user", text: string) => {
    setMessages((prev) => [...prev, { id: prev.length, from, text }]);
  };

  const handleQuickReply = (qr: QuickReply) => {
    addMessage("user", qr.label);
    setTimeout(() => {
      addMessage("bot", qr.response);
      setLastAction(qr.action || null);
    }, 300);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    addMessage("user", text);
    setInput("");

    const lower = text.toLowerCase();
    const match = KEYWORD_MAP.find((k) => k.keywords.some((kw) => lower.includes(kw)));

    setTimeout(() => {
      if (match) {
        addMessage("bot", match.response);
        setLastAction(null);
      } else {
        addMessage(
          "bot",
          "I'm not sure about that one — try one of the topics below, or ask about vouchers, points, cart, or your profile."
        );
        setLastAction(null);
      }
    }, 300);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 text-slate-900 flex items-center justify-center shadow-lg hover:bg-orange-400 transition z-50"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[28rem] bg-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-700">
          <div className="bg-slate-900 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
            <MessageCircle size={18} className="text-orange-400" />
            <p className="font-semibold text-white text-sm">Optima Assistant</p>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  msg.from === "bot"
                    ? "bg-slate-700 text-white self-start"
                    : "bg-orange-500 text-slate-900 self-end ml-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {lastAction && (
              <button
                onClick={() => {
                  navigate(lastAction.path);
                  setOpen(false);
                }}
                className="block bg-orange-500 text-slate-900 text-sm font-semibold px-3 py-2 rounded-full hover:bg-orange-400"
              >
                {lastAction.label} →
              </button>
            )}
          </div>

          <div className="p-3 border-t border-slate-700 flex flex-wrap gap-2">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.label}
                onClick={() => handleQuickReply(qr)}
                className="text-xs bg-slate-700 text-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-600"
              >
                {qr.label}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-slate-700 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-700 text-white text-sm rounded-full px-4 py-2 focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-400"
            >
              <Send size={16} className="text-slate-900" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}