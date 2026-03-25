"use client";

interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface DisciplineFilterProps {
  categories: CategoryInfo[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
}

export default function DisciplineFilter({
  categories,
  activeCategory,
  onSelect,
}: DisciplineFilterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(isActive ? null : cat.id)}
            className={`group flex flex-col p-6 rounded-xl transition-all duration-300 text-left ${
              isActive
                ? "border border-[#FF6B00] bg-[rgba(255,107,0,0.05)]"
                : "border border-[rgba(73,72,71,0.1)] hover:border-[#FF6B00]/40"
            }`}
            style={{
              background: isActive
                ? "rgba(255, 107, 0, 0.05)"
                : "rgba(38, 38, 38, 0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div className="w-10 h-10 rounded bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00] mb-6 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-2xl">
                {cat.icon}
              </span>
            </div>
            <h3
              className="font-bold text-lg mb-1 text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {cat.name}
            </h3>
            <span
              className="text-[10px] uppercase tracking-widest text-[#adaaaa]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {cat.count} {cat.count === 1 ? "Lekcija" : cat.count < 5 ? "Lekcije" : "Lekcija"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
