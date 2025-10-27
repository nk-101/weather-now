// tailwind.config.js
// ------------------
// This file configures how Tailwind CSS scans and builds styles for your project.

export default {
  // 🔍 "content" tells Tailwind where to look for class names in your files.
  // It scans these paths and includes only the styles you actually use in the final CSS.
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  // 🎨 "theme" defines your design tokens like colors, fonts, spacing, etc.
  // The "extend" key lets you safely add custom styles without overwriting defaults.
  theme: { extend: {} },

  // 🧩 "plugins" lets you enable extra Tailwind utilities or third-party extensions.
  // Example: require('@tailwindcss/forms') for better input styles.
  plugins: [],
};
