import React from "react";
import { COLORS } from "../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";

const BMPTemp = () => (
	<CustomLineChart
		path="/api/sensor/bmp/temp"
		title="Temperature registered by BMP-180 sensor over time"
		legend="Temperature"
		xLabel="Temperature [°C]"
		yLabel="Time"
		color={COLORS.red}
	/>
);

export default BMPTemp;