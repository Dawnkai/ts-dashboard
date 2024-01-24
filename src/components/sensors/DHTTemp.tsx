import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";
import ExportButton from "../ExportButton";

const DHTTemp = () => (
	<>
		<ExportButton sensorIds={["1"]} />
		<CustomLineChart
			path="/api/sensor/1"
			title="Temperature registered by DHT-22 sensor over time"
			xLabel="Time"
			yLabel="Temperature [°C]"
			color={COLORS.red}
			predictionColor={COLORS.orange}
		/>
		<BackButton />
	</>
);

export default DHTTemp;
