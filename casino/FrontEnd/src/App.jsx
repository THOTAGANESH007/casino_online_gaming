// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';

// Auth Components
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import RegionSelect from './components/auth/RegionSelect';
import KYCSubmit from './components/auth/KYCSubmit';
import PendingVerification from './components/auth/PendingVerification';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';

// Wallet Components
import WalletOverview from './components/wallet/WalletOverview';

// Game Components
import GamesList from './components/games/GamesList';
import Blackjack from './components/games/Blackjack';
import Dice from './components/games/Dice';
import Slots from './components/games/Slots';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/games" replace />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              
              {/* Onboarding Routes */}
              <Route
                path="/select-region"
                element={
                  <ProtectedRoute>
                    <RegionSelect />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit-kyc"
                element={
                  <ProtectedRoute>
                    <KYCSubmit />
                  </ProtectedRoute>
                }
              />
              <Route path="/pending-verification" element={<PendingVerification />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Wallet Routes */}
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <WalletOverview />
                  </ProtectedRoute>
                }
              />

              {/* Game Routes */}
              <Route
                path="/games"
                element={
                  <ProtectedRoute>
                    <GamesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/blackjack"
                element={
                  <ProtectedRoute>
                    <Blackjack />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/dice"
                element={
                  <ProtectedRoute>
                    <Dice />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/slots"
                element={
                  <ProtectedRoute>
                    <Slots />
                  </ProtectedRoute>
                }
              />

              {/* 404 - Redirect to games */}
              <Route path="*" element={<Navigate to="/games" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;


// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Casino Platform - Play & Win</title>
    <meta name="description" content="Multi-tenant online casino platform with blackjack, roulette, dice, slots, and more!" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>