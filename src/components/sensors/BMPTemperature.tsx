import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";
import ExportButton from "../ExportButton";

const BMPTemp = () => (
	<>
		<ExportButton sensorIds={["8"]} />
		<CustomLineChart
			path="/api/sensor/8"
			title="Temperature registered by BMP-180 sensor over time"
			xLabel="Time"
			yLabel="Temperature [°C]"
			color={COLORS.red}
			predictionColor={COLORS.orange}
		/>
		<BackButton />
	</>
);

export default BMPTemp;
