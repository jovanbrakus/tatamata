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

const CATEGORY_IMAGES: Record<string, { dark: string; light: string }> = {
  algebra: { dark: "/images/categories/algebra.png", light: "/images/categories/light/algebra.png" },
  jednacine: { dark: "/images/categories/algebra.png", light: "/images/categories/light/algebra.png" },
  trigonometrija: { dark: "/images/categories/trigonometry.png", light: "/images/categories/light/trigonometry.png" },
  geometrija: { dark: "/images/categories/geometry.png", light: "/images/categories/light/geometry.png" },
  analiza: { dark: "/images/categories/analysis.png", light: "/images/categories/light/analysis.png" },
};

export default function DisciplineFilter({
  categories,
  activeCategory,
  onSelect,
}: DisciplineFilterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        const image = CATEGORY_IMAGES[cat.id];
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(isActive ? null : cat.id)}
            className={`group relative flex flex-col justify-end p-6 rounded-xl transition-all duration-300 text-left overflow-hidden h-40 ${
              isActive
                ? "border-2 border-[#FF6B00] ring-2 ring-[#FF6B00]/20"
                : "border border-[var(--glass-border)] hover:border-[#FF6B00]/40"
            }`}
          >
            {/* Background image — dark and light variants */}
            {image && (
              <div className="absolute inset-0">
                <img src={image.dark} alt="" className="h-full w-full object-cover dark-only" />
                <img src={image.light} alt="" className="h-full w-full object-cover light-only absolute inset-0" />
                <div className={`absolute inset-0 transition-all duration-300 dark-only ${
                  isActive
                    ? "bg-gradient-to-t from-black/90 via-black/60 to-black/30"
                    : "bg-gradient-to-t from-black/85 via-black/55 to-black/25 group-hover:from-black/80 group-hover:via-black/50 group-hover:to-black/20"
                }`} />
                <div className={`absolute inset-0 transition-all duration-300 light-only ${
                  isActive
                    ? "bg-gradient-to-t from-white/80 via-white/40 to-white/10"
                    : "bg-gradient-to-t from-white/70 via-white/30 to-white/5 group-hover:from-white/60 group-hover:via-white/20 group-hover:to-transparent"
                }`} />
              </div>
            )}
            {/* Content */}
            <div className="relative z-10">
              <h3 className="font-black text-xl mb-1 text-white drop-shadow-lg light-dark-text">
                {cat.name}
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-white/70 font-bold light-dark-text-muted">
                {cat.count} {cat.count === 1 ? "Lekcija" : cat.count < 5 ? "Lekcije" : "Lekcija"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
