export const MATHJAX_CONFIG = {
  loader: { load: ["[tex]/ams"] },
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    packages: { "[+]": ["ams"] },
  },
  svg: { fontCache: "global" },
};

export const MATHJAX_SRC =
  "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
