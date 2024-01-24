import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";
import ExportButton from "../ExportButton";

const DSHeaterTemp = () => (
	<>
		<ExportButton sensorIds={["5"]} />
		<CustomLineChart
			path="/api/sensor/5"
			title="Heater temperature registered by DS18B20 sensor over time"
			xLabel="Time"
			yLabel="Temperature [°C]"
			color={COLORS.red}
			predictionColor={COLORS.orange}
		/>
		<BackButton />
	</>
);

export default DSHeaterTemp;
