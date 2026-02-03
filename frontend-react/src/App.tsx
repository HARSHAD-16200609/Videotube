import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { VideoPlayerPage } from './pages/VideoPlayerPage';
import { LoginPage } from './pages/LoginPage';
import { useAuthStore } from './store/authStore';

function App() {
  const { getCurrentUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUser();
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/video/:id" element={<VideoPlayerPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
