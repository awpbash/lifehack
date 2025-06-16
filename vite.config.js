import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'popup' ? 'popup.js' : `${chunkInfo.name}.js`;
        },
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content.css') return 'content.css';
          if (assetInfo.name === 'popup.css') return 'popup.css';
          return '[name].[ext]';
        },
      },
    },
    outDir: 'dist',
<<<<<<< Updated upstream
    emptyOutDir: false
  }
});
=======
    emptyOutDir: false,
  },
  publicDir: 'public',
});
>>>>>>> Stashed changes
