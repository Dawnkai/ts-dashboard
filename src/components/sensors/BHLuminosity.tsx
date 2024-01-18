import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";
import ExportButton from "../ExportButton";

const BHLuminosity = () => (
	<>
		<ExportButton sensorIds={["3"]}/>
		<CustomLineChart
			path="/api/sensor/3"
			title="Luminosity registered by BH-1750 sensor over time"
			xLabel="Time"
			yLabel="Luminosity [lx]"
			color={COLORS.orange}
		/>
		<BackButton />
	</>
);

export default BHLuminosity;
