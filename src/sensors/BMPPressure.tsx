import React from "react";
import { COLORS } from "../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";

const BMPPressure = () => (
	<CustomLineChart
		path="/api/sensor/bmp/pressure"
		title="Pressure registered by BMP-180 sensor over time"
		legend="Pressure"
		xLabel="Pressure [hPa]"
		yLabel="Time"
		color={COLORS.blue}
	/>
);

export default BMPPressure;
