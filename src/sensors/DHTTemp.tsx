import React from "react";
import { COLORS } from "../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";

const DHTTemp = () => (
	<CustomLineChart
		path="/api/sensor/dht/temp"
		title="Temperature registered by DHT-22 sensor over time"
		legend="Temperature"
		xLabel="Temperature [°C]"
		yLabel="Time"
		color={COLORS.red}
	/>
);

export default DHTTemp;
