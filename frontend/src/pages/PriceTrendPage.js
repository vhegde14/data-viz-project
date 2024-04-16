import React, { useState, useEffect } from 'react';
import '../App.css'; 
import { useData } from '../DataProvider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function PriceChart({ data }) {
    const chartData = data
        .map((item, index) => ({ index, price: item }))
        .filter((item, index) => index % 12 === 0)
        .map((item, newIndex) => ({ name: `${newIndex + 2000}`, price: item.price }));

    function CustomTooltip({ active, payload }) {
        if (active && payload && payload.length) {
            console.log(payload)
            return (
            <div style={{ backgroundColor: 'white', color: 'purple', borderRadius: '5px', padding: '5px', border: '1px solid #ccc', zIndex: 100 }}>
                <p>${Math.round(payload[0].value).toLocaleString()}</p>
            </div>
            );
        }
        return null;
    }

    const yAxisFormatter = (value) => {
        if (value === 0) {
          return '';
        }
        return `$${value.toLocaleString()}`;
      };

    return (
      <ResponsiveContainer width={1100} height={450} >
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 50,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke='#cfcfcf' minTickGap={12} />
          <YAxis stroke='#cfcfcf' tickFormatter={yAxisFormatter} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" name='Avg Home Price' dataKey="price" stroke="#8b85ff" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 3 } }/>
        </LineChart>
      </ResponsiveContainer>
    );
}

function PriceTrendPage() {
    const [inputValue, setInputValue] = useState('');
    const { data, setData } = useData();
    const [localData, setLocalData] = useState(data || {});

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
            // navigate('/home/areas');
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    useEffect(() => {
        // Update local data whenever data changes
        setLocalData(data || {});
    }, [data]);

    useEffect(() => {
        // Save state to global when unmounting
        return () => {
            if (data !== localData) {
                setData({ ...localData });
            }
        }
    }, [localData]);

    let formattedPrice; 
    if (localData.zipcode_data?.exists === true) {   
        const lastPrice = localData.zipcode_data.prices[localData.zipcode_data.prices.length - 1];
        formattedPrice = lastPrice.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    return (
        <div className='trends'>
            {localData.zipcode_data?.exists === true ? 
            <div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={localData.zipcode}
                    className='price-input'
                />
                <button type="submit" className='add-city' onClick={handleSubmit}>Submit</button>
                <p>{localData.zipcode_data.region_name}</p>
                <p>Average Price in 2024: {formattedPrice}</p>
                <PriceChart key={localData.zipcode} data={localData.zipcode_data.prices} />
            </div>
            : 
            <div>
                <pre>Zipcode "{localData.zipcode}" not found. Please try a zipcode that is supported.</pre>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={localData.zipcode}
                    className='price-input'
                />
                <button type="submit" className='add-city' onClick={handleSubmit}>Submit</button>
            </div>
            }
        </div>
    )
}

export default PriceTrendPage;