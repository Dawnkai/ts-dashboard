import React from "react";
import { render } from "react-dom";
import { Hello } from "./Hello";
 
const App = () => {
    return (
        <div>
            <Hello compiler="Parcel" framework="ReactJS" />
        </div>
    );
};
 
render(<App />, document.getElementById("app"));
