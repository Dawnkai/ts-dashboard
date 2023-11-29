import React from "react";
import ReactDOM from "react-dom/client";
import Overview from "./Overview";
import Header from "./Header";
import ExampleSensor from "./sensors/ExampleSensor";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTES } from "./globals/routes";
import DHTTemp from "./sensors/DHTTemp";
import DHTHumidity from "./sensors/DHTHumidity";

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
				</Routes>
			</BrowserRouter>
		</div>
	);
};

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
