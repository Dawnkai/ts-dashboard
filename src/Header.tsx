import React from "react";
import { useLocation } from "react-router-dom";

import "../styles/Header.css";
import { ROUTES } from "./globals/routes";

function decodePathName(pathName: string) {
	// This can be replaced by passing props with page name to Route in react-dom
	switch (pathName) {
		case "/":
			return "Overview";
		case ROUTES.exampleSensor:
			return "Sensor: Example";
		case ROUTES.DHT_temperature:
			return "Sensor: DHT-22 - Temperature";
		case ROUTES.DHT_humidity:
			return "Sensor: DHT-22 - Humidity";
		case ROUTES.BH_luminosity:
			return "Sensor: BH1750 - Luminosity";
		case ROUTES.BMP_pressure:
			return "Sensor: BMP180 - Pressure";
		case ROUTES.DS_heater_temperature:
			return "Sensor: DS18B20 - Heater temperature";
		case ROUTES.DS_temperature:
			return "Sensor: DS18B20 - Temperature";
		case ROUTES.PIR_movement:
			return "Sensor: PIR - Movement";
		case ROUTES.BMP_temperature:
			return "Sensor: BMP180 - Temperature";
		default:
			return "Unknown";
	}
}

export default function Header() {
	const location = useLocation();

	return (
		<div className="d-flex w-100 justify-content-between mt-4 mb-4">
			<div className="title-container d-flex flex-column">
				<h1 className="main-title">TTN Dashboard</h1>
				<h3 className="page-title">{decodePathName(location.pathname)}</h3>
			</div>
			<div className="nav-menu d-flex align-items-baseline">
				<button className="btn btn-outline-primary nav-menu-btn">
					<i className="fa fa-user-circle-o login-icon" aria-hidden="true"></i>
				</button>
			</div>
		</div>
	);
}
