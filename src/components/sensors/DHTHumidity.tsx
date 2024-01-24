import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";
import ExportButton from "../ExportButton";

const DHTHumidity = () => (
	<>
		<ExportButton sensorIds={["2"]} />
		<CustomLineChart
			path="/api/sensor/2"
			title="Humidity registered by DHT-22 sensor over time"
			xLabel="Time"
			yLabel="Humidity [%]"
			color={COLORS.blue}
			predictionColor={COLORS.green}
		/>
		<BackButton />
	</>
);

export default DHTHumidity;
