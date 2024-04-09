import React from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation

function AreasPage() {
    const location = useLocation();
    const { data } = location.state || {};

    return (
        <div className='App'>
            <div class="App-header">
                <p>Results</p>
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        </div>
    )
}

export default AreasPage;