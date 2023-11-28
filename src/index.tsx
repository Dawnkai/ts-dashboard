import React from "react";
import ReactDOM from 'react-dom/client';
import Overview from "./Overview";
import Header from "./Header";
import ExampleSensor from "./ExampleSensor";
import { BrowserRouter, Routes, Route } from "react-router-dom";
 
const App = () => {
    return (
        <div className="container">
            <BrowserRouter>
                <Header/>
                <Routes>
                    <Route path="/" element={<Overview />}/>
                    <Route path="/example-sensor" element={<ExampleSensor/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
