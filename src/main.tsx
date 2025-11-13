import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { CartProvider } from './contexts/CartContext.tsx';
import { BrandingProvider } from './contexts/BrandingContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrandingProvider>
          <App />
        </BrandingProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);
