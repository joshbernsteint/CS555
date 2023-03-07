import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import CameraForm from "./components/CameraForm";
import RegisterForm from "./components/RegisterForm";
import Login from "./components/loginForm";
import AuthDetails from "./components/AuthDetails";
import MaterialNotification from "./components/MaterialNotification";
import React, { useState } from "react";
import NotificationBar from './components/NotificationBar'
import { HomeNavBar } from "./components/homeNavBar";
import { Stack, Row,Col } from 'react-bootstrap';
import { alignProperty } from "@mui/material/styles/cssUtils";
function App() {
  const [showNav, setShowNav] = useState(false);

  const clickHandler = () => {
    setShowNav(!showNav);
  };
  return (
    <div className="App">
      <HomeNavBar/>
      <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/register" element={<RegisterForm />} />
        <Route path="/camera" element={<CameraForm />} />
        <Route path="/tasks" element={<NotificationBar/>} />
        <Route path="/login/:id" element={<h1>Sup</h1>}>
          <Route index element = {<h1>Sup</h1>} />
        </Route>
        <Route path="*" element={<Navigate to ="/" />} /> 
      </Routes>
    </Router>
    <div className="notification">
      <MaterialNotification/>
    </div>
    <AuthDetails/>
    </div>
  );
}

export default App;
