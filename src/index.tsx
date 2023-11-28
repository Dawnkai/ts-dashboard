import React from "react";
import ReactDOM from 'react-dom/client';
import Overview from "./Overview";
import Header from "./Header";
 
const App = () => {
    return (
        <div className="container">
            <Header/>
            <Overview />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
