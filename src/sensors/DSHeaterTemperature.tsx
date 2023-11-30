import React from "react";
import { COLORS } from "../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";

const DSHeaterTemp = () => (
	<CustomLineChart
		path="/api/sensor/ds/heater-temp"
		title="Heater temperature registered by DS18B20 sensor over time"
		legend="Heater temperature"
		xLabel="Temperature [°C]"
		yLabel="Time"
		color={COLORS.red}
	/>
);

export default DSHeaterTemp;
