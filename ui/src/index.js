import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import App from './App';
import SignUp from './pages/SignUp/SignUp'
import SignIn from './pages/Login/Login'
import Home from './pages/Home/Home'
import AuthCheck from './pages/AuthCheck/AuthCheck';
import NotFriends from './pages/NotFriends/NotFriends';
import Find from './pages/Find/Find';
import Profile from './pages/Profile/ProfilePage'

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' exact element={<App />}>
        <Route path='/' exact element={<AuthCheck />} />
        <Route path='/signup' exact element={<SignUp />} />
        <Route path='/signin' exact element={<SignIn />} />
        <Route path='/home' exact element={<Home />} />
        <Route path='/notfriends' exact element={<NotFriends />} />
        <Route path='/search' exact element={<Find />} />
        <Route path='/profile/:handle' element={<Profile />} />
      </Route>
    </Routes>
  </BrowserRouter>
);