import React from "react";
import ReactDOM from "react-dom/client";
import Overview from "./Overview";
import Header from "./components/Header";
import ExampleSensor from "./components/sensors/ExampleSensor";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTES } from "./globals/routes";

import DHTTemp from "./components/sensors/DHTTemp";
import DHTHumidity from "./components/sensors/DHTHumidity";
import BHLuminosity from "./components/sensors/BHLuminosity";
import BMPPressure from "./components/sensors/BMPPressure";
import BMPTemp from "./components/sensors/BMPTemperature";
import DSHeaterTemp from "./components/sensors/DSHeaterTemperature";
import DSTemp from "./components/sensors/DSTemp";
import PIRMovement from "./components/sensors/PIRMovement";

const App = () => {
	return (
		<div className="container">
			<BrowserRouter>
				<Header />
				<Routes>
					<Route path="/" element={<Overview />} />
					<Route path={ROUTES.exampleSensor} element={<ExampleSensor />} />
					<Route path={ROUTES.DHT_temperature} element={<DHTTemp />} />
					<Route path={ROUTES.DHT_humidity} element={<DHTHumidity />} />
					<Route path={ROUTES.BH_luminosity} element={<BHLuminosity />} />
					<Route path={ROUTES.BMP_pressure} element={<BMPPressure />} />
					<Route path={ROUTES.DS_heater_temperature} element={<DSHeaterTemp />} />
					<Route path={ROUTES.DS_temperature} element={<DSTemp />} />
					<Route path={ROUTES.PIR_movement} element={<PIRMovement />} />
					<Route path={ROUTES.BMP_temperature} element={<BMPTemp />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
};

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
