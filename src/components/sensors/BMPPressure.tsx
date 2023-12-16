import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";

const BMPPressure = () => (
	<>
		<CustomLineChart
			path="/api/sensor/4"
			title="Pressure registered by BMP-180 sensor over time"
			xLabel="Time"
			yLabel="Pressure [hPa]"
			color={COLORS.blue}
		/>
		<BackButton />
	</>
);

export default BMPPressure;
