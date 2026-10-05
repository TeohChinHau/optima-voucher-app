import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
}

export default function Input({ icon: Icon, className = "", ...rest }: InputProps) {
  return (
    <div className="relative mb-4">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        className={`w-full bg-slate-800 text-white border border-slate-700 rounded-full pl-11 pr-4 py-3 focus:outline-none focus:border-orange-400 ${className}`}
        {...rest}
      />
    </div>
  );
}