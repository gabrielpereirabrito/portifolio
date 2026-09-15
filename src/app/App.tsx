import { BrowserRouter } from 'react-router-dom';
import { Rotas } from '@/app/Rotas';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { Scanlines } from '@/shared/ui';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Rotas />
        <Scanlines />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
