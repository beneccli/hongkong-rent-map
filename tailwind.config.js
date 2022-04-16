module.exports = {
    mode: 'jit',
    content: ['./src/**/*.{html,ts}', './projects/**/*.{html,ts}'],
    darkMode: 'media',
    theme: {
        fontFamily: {
            display: ['Oswald', 'sans-serif'],
            body: ['Poppins', 'sans-serif'],
        },
        container: {
            center: true,
            padding: '1.5rem',
        },
        extend: {
          colors: {
            red: {
              pomodoro: 'rgb(217, 85, 80)',
            }
          }
        },
    },
    plugins: [
      require('@tailwindcss/forms')({
        strategy: 'class',
      }),
    ],
};
