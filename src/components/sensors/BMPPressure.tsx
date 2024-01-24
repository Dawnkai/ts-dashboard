import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";
import ExportButton from "../ExportButton";

const BMPPressure = () => (
	<>
		<ExportButton sensorIds={["4"]} />
		<CustomLineChart
			path="/api/sensor/4"
			title="Pressure registered by BMP-180 sensor over time"
			xLabel="Time"
			yLabel="Pressure [hPa]"
			color={COLORS.blue}
			predictionColor={COLORS.green}
		/>
		<BackButton />
	</>
);

export default BMPPressure;
