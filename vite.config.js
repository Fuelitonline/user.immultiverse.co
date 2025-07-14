// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
   server: {
    host: true, // to allow external access
    allowedHosts: ['97d01377d730.ngrok-free.app'], // allow Ngrok domain
  },
  optimizeDeps: {
    include: [
      'jquery',
      'jquery-ui/ui/widgets/draggable',
      'jquery-ui/ui/widgets/droppable',
      'jquery-ui/ui/widgets/sortable',
      'jquery-formbuilder',
    ],
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: 'index.html',  // Ensuring that the entry point is correct
      },
    },
  },
});