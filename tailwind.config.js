module.exports = {
  content: ["./index.html"],
  theme: {
    extend: {
      colors: {
        pint: {
          amber: "#F4B860",   // Tiny Pint amber
          cream: "#FFF8EE",   // warm background
          dark: "#1C1B1B",    // deep charcoal for bar feel
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Archivo Black", "sans-serif"],
      },
    },
  },
  plugins: [],
};
