import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "../../styles/Header.css";
import { ROUTES } from "../globals/routes";
import { isLoggedIn, logOut } from "../globals/utils";

function decodePathName(pathName: string) {
	switch (pathName) {
		case "/":
			return "Overview";
		case "/login":
			return "Login";
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
	const navigate = useNavigate();

	return (
		<div className="d-flex w-100 justify-content-between mt-4 mb-4">
			<div className="title-container d-flex flex-column">
				<h1 className="main-title">TS Dashboard</h1>
				<h3 className="page-title">{decodePathName(location.pathname)}</h3>
			</div>
			<div className="nav-menu d-flex align-items-baseline">
				{!isLoggedIn() && (
					<button className="btn btn-outline-primary login-btn" type="button" aria-expanded="false" onClick={() => navigate("/login")}>
						<i className="fa fa-user-circle-o" aria-hidden="true"></i>
					</button>
				)}
				{isLoggedIn() && (
					<button
						className="btn btn-outline-primary login-btn"
						type="button"
						aria-expanded="false"
						data-bs-toggle="modal"
						data-bs-target="#logoutModal"
					>
						<i className="fa fa-sign-out" aria-hidden="true"></i>
					</button>
				)}
			</div>
			<div className="modal fade" id="logoutModal" tabIndex={-1} aria-labelledby="logoutModalLabel" aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="logoutModalLabel">
								Log out
							</h5>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body text-center">Are you sure you want to log out?</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
								Cancel
							</button>
							<button type="button" className="btn btn-danger" onClick={() => logOut().then(() => window.location.reload())}>
								Log out
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
