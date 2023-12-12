import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";

const DSHeaterTemp = () => (
	<>
		<CustomLineChart
			path="/api/sensor/ds/heater-temp"
			title="Heater temperature registered by DS18B20 sensor over time"
			xLabel="Time"
			yLabel="Temperature [°C]"
			color={COLORS.red}
		/>
		<BackButton />
	</>
);

export default DSHeaterTemp;
