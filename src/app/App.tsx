import { BrowserRouter } from 'react-router-dom';
import { Rotas } from '@/app/Rotas';
import { ErrorBoundary } from '@/app/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Rotas />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
