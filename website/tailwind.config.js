/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // all your React components
      "./node_modules/flowbite/**/*.js" // Flowbite JS components
    ],
    theme: {
      extend: {},
    },
    plugins: [
      require("flowbite/plugin"), // enables Flowbite plugin
    ],
  }
  