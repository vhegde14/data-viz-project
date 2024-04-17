import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { debounce } from 'lodash';

import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";

const MapChart = () => {
    const [year, setYear] = useState(2000); // Default starting year
    const [priceData, setPriceData] = useState();
    const [mapData, setMapData] = useState([]);

    const fetchPriceData = async () => {
        // const url = 'http://127.0.0.1:5000/get_state_average_prices_by_year';
        const url = 'https://data-viz-project-ajba.onrender.com/get_state_average_prices_by_year'
        try {
            const response = await fetch(url, {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const text = await response.text();
            const data = JSON.parse(text); 
            setPriceData(data)
            setMapData(data['2000']);
            console.log('Success');
        } catch (error) {
            console.error('Error:', error);
        }
    }

    useEffect(() => {
        fetchPriceData();
    }, []);

    const handleChange = (event) => {
        setYear(event.target.value);
        setMapData(priceData[event.target.value]);
    };

    const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas/states-10m.json";

    const colorScale = scaleQuantile()
    .domain(Object.values(mapData))
    .range([
      "#ffedea",
      "#ffcec5",
      "#ffad9f",
      "#ff8a75",
      "#ff5533",
      "#e2492d",
      "#be3d26",
      "#9a311f",
      "#782618"
    ]);

    const legendData = [
        { color: "#ffedea", label: "$100k to $200k" },
        { color: "#ffcec5", label: "$200k to $300k" },
        { color: "#ffad9f", label: "$300k to $400k" },
        { color: "#ff8a75", label: "$400k to $500k" },
        { color: "#ff5533", label: "$500k to $600k" },
        { color: "#e2492d", label: "$600k to $700k" },
        { color: "#be3d26", label: "$700k to $800k" },
        { color: "#9a311f", label: "$800k to $900k" },
        { color: "#782618", label: "$900k+" }
    ];
      
    const Legend = ({ legendData }) => (
        <div className="map-legend">
          {legendData.map((item, index) => (
            <div key={index} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: item.color }}></span>
              <span className="legend-label">{item.label}</span>
            </div>
          ))}
        </div>
    );

    return (
        <div className='map-container'>
            <Legend legendData={legendData} />
            <div className="map">
                <ComposableMap projection="geoAlbersUsa" width={900} height={600} >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                        geographies.map(geo => {
                            const stateName = geo.properties.name;
                            const averagePrice = mapData[stateName];
                            return (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={averagePrice ? colorScale(averagePrice) : "#EEE"}
                            />
                            );
                        })
                        }
                    </Geographies>
                </ComposableMap>
            </div>
            <div className="year-slider-container">
                <div className='slider-title'>Selected Year: {year}</div>
                <input
                    type="range"
                    min="2000"
                    max="2024"
                    value={year}
                    onChange={handleChange}
                    className="year-slider"
                    orient="vertical" // This attribute is not officially supported in HTML but works in some browsers
                />
            </div>
        </div>
      );
};


function AreasPage() {
    const location = useLocation();
    const { data } = location.state || {};

    return (
        <div className='App'>
            <div className="areas">
                <p className='areas-page-header'>Average Home Price by State</p>
                <MapChart />
            </div>
        </div>
    )
}

export default AreasPage;