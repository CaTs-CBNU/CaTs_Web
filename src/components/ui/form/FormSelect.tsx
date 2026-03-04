import { ChevronDown } from "lucide-react";
import { SelectHTMLAttributes } from "react";

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: (string | Option)[]; // 문자열 배열 또는 객체 배열 지원
}

export default function FormSelect({ label, options, className = "", ...props }: FormSelectProps) {
  return (
    <div className={className}>
      {label && <label className="block text-sm text-zinc-400 mb-1 ml-1 font-bold">{label}</label>}
      <div className="relative">
        <select
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-navy outline-none transition text-white appearance-none cursor-pointer text-center"
          {...props}
        >
          {options.map((opt, idx) => {
            const value = typeof opt === "string" ? opt : opt.value;
            const text = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={idx} value={value} className="bg-zinc-900 text-white">
                {text}
              </option>
            );
          })}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
      </div>
    </div>
  );
}