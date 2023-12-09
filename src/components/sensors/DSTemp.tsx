import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";

const DSTemp = () => (
	<>
		<CustomLineChart
			path="/api/sensor/ds/temp"
			title="Temperature registered by DS18B20 sensor over time"
			legend="Temperature"
			xLabel="Temperature [°C]"
			yLabel="Time"
			color={COLORS.red}
		/>
		<BackButton />
	</>
);

export default DSTemp;
