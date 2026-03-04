import { InputHTMLAttributes, forwardRef } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <div className={className}>
        {label && <label className="block text-sm text-zinc-400 mb-1 ml-1 font-bold">{label}</label>}
        <input
          ref={ref}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-navy outline-none transition text-white placeholder-zinc-500 text-center disabled:opacity-50 disabled:cursor-not-allowed"
          {...props}
        />
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
export default FormInput;