
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './routers/AppRouter';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
