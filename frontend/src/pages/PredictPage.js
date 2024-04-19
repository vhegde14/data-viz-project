import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

function Form() {
  const [formData, setFormData] = useState({
    bathrooms: '',
    stories: '',
    hotWaterHeating: '',
    parkingSpots: '',
    area: '',
    airConditioning: ''
  });
  const [formattedPrice, setFormattedPrice] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'area') {
        if (e.target.value === 'Other') {
            value = 'No';
        } else {
            value = 'Yes';
        }
    }
    setFormData({ ...formData, [e.target.name]: value});
    setError('');  // Clear error message on any input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if any field is empty
    if (!formData.bathrooms || !formData.stories || !formData.hotWaterHeating || !formData.parkingSpots || !formData.area || !formData.airConditioning) {
      setError('Please fill out all fields');
      return;
    }

    console.log('Submitting form', formData);
    // Example POST request
    try {
      const response = await fetch('https://data-viz-project-ajba.onrender.com/get_price_prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      console.log('Response:', data);
      setFormattedPrice(new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
        }).format(data.price));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '800px', margin: 'auto' }}>
      <div style={rowStyle}>
        <input
          type="text"
          name="bathrooms"
          value={formData.bathrooms}
          onChange={handleChange}
          placeholder="Number of bathrooms"
          style={{ ...inputStyle, marginRight: '10px' }}
        />
        <input
          type="text"
          name="stories"
          value={formData.stories}
          onChange={handleChange}
          placeholder="Number of stories"
          style={inputStyle}
        />
      </div>
      <div style={rowStyle}>
        <select
          name="hotWaterHeating"
          value={formData.hotWaterHeating}
          onChange={handleChange}
          style={{ ...inputStyle, marginRight: '10px' }}
        >
          <option value="">Hot water / Heating</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        <select
          name="airConditioning"
          value={formData.airConditioning}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Air conditioning</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
      <div style={rowStyle}>
        <input
          type="text"
          name="parkingSpots"
          value={formData.parkingSpots}
          onChange={handleChange}
          placeholder="Number of Parking Spots"
          style={{ ...inputStyle, marginRight: '10px' }}
        />
        <select
          name="area"
          value={formData.area}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Area</option>
          <option value="Boston">Boston</option>
          <option value="SF">San Francisco</option>
          <option value="NY">New York</option>
          <option value="Other">Other</option>
        </select>
      </div>
      {error && <div style={errorStyle}>{error}</div>}
      <button type="submit" style={buttonStyle}>Submit</button>
      {formattedPrice && <div style={{ marginTop: '20px' }}>Predicted Price: {formattedPrice}</div>}
    </form>
  );
}

// CSS Styles
const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '10px',
  marginBottom: '15px',
  width: '100%'
};

const inputStyle = {
  flex: 1,
  width: '300px',
  height: '40px',
  padding: '8px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  boxShadow: '1px 1px 3px rgba(0,0,0,0.1)',
  maxWidth: '49%'
};

const buttonStyle = {
  width: '100px',
  height: '40px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  boxShadow: '2px 2px 5px rgba(0,0,0,0.2)'
};

const errorStyle = {
  color: 'red',
  marginBottom: '10px'
};

function PredictPage() {
    const location = useLocation();
    const { data } = location.state || {};

    return (
        <div className='App'>
            <div className="App-header">
                <Form />
            </div>
        </div>
    )
}

export default PredictPage;