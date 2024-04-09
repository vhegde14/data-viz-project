import React from 'react';
import './App.css'; 
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import AreasPage from './pages/AreasPage';
import { useState } from 'react';

function HomePage() {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    console.log('Here!');
    e.preventDefault();
    if (!inputValue.trim()) return;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: inputValue })
    };
    try {
      // local testing
      // const response = await fetch('http://127.0.0.1:5000/get_home_price_by_zip', requestOptions);
      // production
      const response = await fetch('https://data-viz-project-ajba.onrender.com/get_home_price_by_zip', requestOptions);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        navigate('/areas', { state: { data } });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>CSE6242 - Team 40</p>
        <p>Enter a zip code</p>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="e.g. 90001"
        />
        <button type="submit" onClick={handleSubmit}>Submit</button>
      </header>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/areas" element={<AreasPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
