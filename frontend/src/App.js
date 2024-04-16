import React from 'react';
import './App.css'; 
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import PriceTrendPage from './pages/PriceTrendPage';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import AreasPage from './pages/AreasPage';
import { DataProvider } from './DataProvider';

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="home/*" element={
            <div>
              <nav className="tab-menu">
                <Link to="/home/areas" className="tab">Trends</Link>
                <Link to="/home/predict" className="tab">Predict</Link>
                <Link to="/home/trends" className="tab">Areas</Link>
              </nav>
              <Routes>
                <Route path="areas" element={<PriceTrendPage />} />
                <Route path="predict" element={<PredictPage />} />
                <Route path="trends" element={<AreasPage />} />
              </Routes>
            </div>
          } />
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
