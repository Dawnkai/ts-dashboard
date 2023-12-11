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
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "./LoginPage";

const App = () => {
	return (
		<div className="container">
			<BrowserRouter>
				<Header />
				<Routes>
					<Route path="/" element={<Overview />} />
					<Route path="/login" element={<LoginPage />} />
					<Route
						path={ROUTES.exampleSensor}
						element={
							<ProtectedRoute>
								<ExampleSensor />
							</ProtectedRoute>
						}
					/>
					<Route
						path={ROUTES.DHT_temperature}
						element={
							<ProtectedRoute>
								<DHTTemp />
							</ProtectedRoute>
						}
					/>
					<Route
						path={ROUTES.DHT_humidity}
						element={
							<ProtectedRoute>
								<DHTHumidity />
							</ProtectedRoute>
						}
					/>
					<Route
						path={ROUTES.BH_luminosity}
						element={
							<ProtectedRoute>
								<BHLuminosity />
							</ProtectedRoute>
						}
					/>
					<Route
						path={ROUTES.BMP_pressure}
						element={
							<ProtectedRoute>
								<BMPPressure />
							</ProtectedRoute>
						}
					/>
					<Route
						path={ROUTES.DS_heater_temperature}
						element={
							<ProtectedRoute>
								<DSHeaterTemp />
							</ProtectedRoute>
						}
					/>
					<Route
						path={ROUTES.DS_temperature}
						element={
							<ProtectedRoute>
								<DSTemp />
							</ProtectedRoute>
						}
					/>
					<Route
						path={ROUTES.PIR_movement}
						element={
							<ProtectedRoute>
								<PIRMovement />
							</ProtectedRoute>
						}
					/>
					<Route
						path={ROUTES.BMP_temperature}
						element={
							<ProtectedRoute>
								<BMPTemp />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</BrowserRouter>
		</div>
	);
};

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<App />);
