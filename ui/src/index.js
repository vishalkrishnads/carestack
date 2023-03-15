import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import SignUp from './pages/SignUp/SignUp'
import Login from './pages/Login/Login'
import { BrowserRouter, Routes, Route } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <BrowserRouter>
    <Routes>
        <Route path='/' exact element={<App />}>
          <Route path='/signup' exact element={<SignUp />} />
          <Route path='/login' exact element={<Login />} />
        </Route>
      </Routes>
  </BrowserRouter>
);