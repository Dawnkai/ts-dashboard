import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";

const DHTHumidity = () => (
	<>
		<CustomLineChart
			path="/api/sensor/2"
			title="Humidity registered by DHT-22 sensor over time"
			xLabel="Time"
			yLabel="Humidity [%]"
			color={COLORS.blue}
		/>
		<BackButton />
	</>
);

export default DHTHumidity;
