import React, { useEffect } from "react";
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
