import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

import "../styles/Overview.css";
import { ROUTES } from "./globals/routes";
import { COLORS_CSS } from "./globals/colors";

interface Fields {
	[key: string]: {
		title: string;
		value: string;
	};
}

interface CardProps {
	title: string;
	value: string;
	icon: string;
	iconColor?: string;
	unit: string;
	goTo: string;
}

const Card = ({ title, value, icon, unit, iconColor, goTo }: CardProps) => {
	const navigate = useNavigate();

	return (
		<div className="col-3 card card-container justify-content-center" onClick={() => navigate(goTo)}>
			<span className="card-title">{title}</span>
			<div className="card-text card-content align-items-center justify-content-center">
				<Icon icon={icon} className="card-icon" width={48} height={48} style={{ color: iconColor }} />
				<span className="card-value">
					<span className="sensor-value">{value}</span>
					<span>{unit}</span>
				</span>
			</div>
		</div>
	);
};

export default function Overview() {
	const [fields, setFields] = useState<Fields>({});
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		async function fetchData() {
			const response = await fetch("/api/overview");
			return response.json();
		}
		setLoading(true);
		fetchData().then((resp) => {
			setFields(resp);
			setLoading(false);
		});
	}, []);

	return (
		<div className="container mb-4">
			{loading ? (
				<div className="d-flex justify-content-center">
					<div className="spinner-border" role="status">
						<span className="sr-only">Loading...</span>
					</div>
				</div>
			) : (
				<>
					<div className="row justify-content-evenly mb-4">
						{/* Temperatura (DHT-22) */}
						<Card
							title={fields?.field1?.title}
							value={fields?.field1?.value}
							icon="solar:temperature-bold-duotone"
							unit="°C"
							goTo={ROUTES.DHT_temperature}
						/>
						{/* Wilgotność względna (DHT-22) */}
						<Card
							title={fields?.field2?.title}
							value={fields?.field2?.value}
							icon="solar:waterdrops-bold-duotone"
							unit="%"
							goTo={ROUTES.DHT_humidity}
							iconColor={COLORS_CSS.blue}
						/>
						{/* Natężenie światła (BH-1750) */}
						<Card
							title={fields?.field3?.title}
							value={fields?.field3?.value}
							icon="solar:flashlight-on-bold-duotone"
							unit="lx"
							goTo={ROUTES.BH_luminosity}
							iconColor={COLORS_CSS.orange}
						/>
					</div>
					<div className="row justify-content-evenly mb-4">
						{/* Ciśnienie atm. (BMP-180) [hPa] */}
						<Card
							title={fields?.field4?.title}
							value={fields?.field4?.value}
							icon="solar:wind-bold-duotone"
							unit="hPa"
							goTo={ROUTES.BMP_pressure}
							iconColor={COLORS_CSS.blue}
						/>
						{/* Temp. grzejnika (DS18B20) [°C] */}
						<Card
							title={fields?.field5?.title}
							value={fields?.field5?.value}
							icon="solar:temperature-bold-duotone"
							unit="°C"
							goTo={ROUTES.DS_heater_temperature}
						/>
						{/* Temperatura (DS18B20) [°C] */}
						<Card
							title={fields?.field6?.title}
							value={fields?.field6?.value}
							icon="solar:temperature-bold-duotone"
							unit="°C"
							goTo={ROUTES.DS_temperature}
						/>
					</div>
					<div className="row justify-content-evenly mb-4">
						{/* Ruch (PIR) */}
						<Card
							title={fields?.field7?.title}
							value={fields?.field7?.value}
							icon="solar:people-nearby-bold-duotone"
							unit=""
							goTo={ROUTES.PIR_movement}
							iconColor={COLORS_CSS.green}
						/>
						{/* Temperatura (BMP-180) [°C] */}
						<Card
							title={fields?.field8?.title}
							value={fields?.field8?.value}
							icon="solar:temperature-bold-duotone"
							unit="°C"
							goTo={ROUTES.BMP_temperature}
						/>
					</div>
				</>
			)}
		</div>
	);
}
