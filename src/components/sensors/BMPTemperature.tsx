import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";

const BMPTemp = () => (
	<>
		<CustomLineChart
			path="/api/sensor/8"
			title="Temperature registered by BMP-180 sensor over time"
			xLabel="Time"
			yLabel="Temperature [°C]"
			color={COLORS.red}
		/>
		<BackButton />
	</>
);

export default BMPTemp;
