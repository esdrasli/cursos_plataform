import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  
  // Configurações de build para produção
  build: {
    outDir: 'dist',
    sourcemap: false, // Desabilitar sourcemaps em produção para reduzir tamanho
    minify: 'esbuild', // Usar esbuild (mais rápido e já incluído no Vite)
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios', 'framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Copiar arquivos da pasta public para dist
    copyPublicDir: true,
  },
  // Configurar pasta public
  publicDir: 'public',
  
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        // No Docker, usar o nome do serviço. Localmente, usar localhost
        target: process.env.VITE_API_TARGET || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket support
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
