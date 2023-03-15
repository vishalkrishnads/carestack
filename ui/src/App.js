import * as React from 'react'
import './App.css';
import './fonts/Poppins-Regular.ttf';

import { Link, Outlet } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <div style={{ flex: 2 }} />
      <div style={{ flex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
        <div className='header'>
          <div style={{ flex: 1 }} />
          <div style={{ flex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }} >
            <h1>CareStack</h1>
            <h4>INTERNSHIP SUBMISSION</h4>
          </div>
          <div style={{ flex: 1 }} />
        </div>
        <div className='content'>
          <Outlet />
        </div>
        <div className='footer'>
          <p>A mini social media network, built as the submission for Task Option 1</p>
        </div>
      </div>
      <div style={{ flex: 2 }} />
    </div>
  );
}

export default App;