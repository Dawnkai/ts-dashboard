import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";

const DHTTemp = () => (
	<>
		<CustomLineChart
			path="/api/sensor/dht/temp"
			title="Temperature registered by DHT-22 sensor over time"
			xLabel="Time"
			yLabel="Temperature [°C]"
			color={COLORS.red}
		/>
		<BackButton />
	</>
);

export default DHTTemp;
