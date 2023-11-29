import React from "react";
import { COLORS } from "../globals/colors";
import CustomLineChart from "../charts/LineChart";

const DHTHumidity = () => (
	<CustomLineChart
		path="/api/sensor/dht/humidity"
		title="Humidity registered by DHT-22 sensor over time"
		legend="Humidity"
		xLabel="Humidity [%]"
		yLabel="Time"
		color={COLORS.blue}
	/>
);

export default DHTHumidity;
