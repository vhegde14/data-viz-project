import React from 'react';
import '../App.css'; 
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useData } from '../DataProvider';

function HomePage() {
    const [inputValue, setInputValue] = useState('');
    const navigate = useNavigate();
    const { setData } = useData();
  
    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!inputValue.trim()) return;
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: inputValue })
      };
      try {
        // local testing
        // const response = await fetch('http://127.0.0.1:5000/get_all_home_prices_by_zip', requestOptions);
        // production
        const response = await fetch('https://data-viz-project-ajba.onrender.com/get_all_home_prices_by_zip', requestOptions);
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          const data = await response.json();
          const zipData = { zipcode_data: data, zipcode: inputValue }
          setData(zipData);
          navigate('/home/areas');
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

export default HomePage;