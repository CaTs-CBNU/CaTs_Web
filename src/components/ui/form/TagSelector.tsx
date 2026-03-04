interface TagSelectorProps {
  label?: string;
  options: string[];
  selected: string[];
  onToggle: (tag: string) => void;
}

export default function TagSelector({ label, options, selected, onToggle }: TagSelectorProps) {
  return (
    <div>
      {label && <label className="block text-sm text-zinc-400 mb-1 ml-1 font-bold">{label}</label>}
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {options.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border border-white/10 ${
              selected.includes(tag) ? "bg-navy text-white border-navy" : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}