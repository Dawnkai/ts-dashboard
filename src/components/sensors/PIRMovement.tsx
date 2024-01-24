import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";
import ExportButton from "../ExportButton";

const PIRMovement = () => (
	<>
		<ExportButton sensorIds={["7"]} />
		<CustomLineChart
			path="/api/sensor/7"
			title="Movement registered by PIR sensor over time"
			xLabel="Time"
			yLabel="People"
			color={COLORS.green}
			predictionColor={COLORS.blue}
		/>
		<BackButton />
	</>
);

export default PIRMovement;
