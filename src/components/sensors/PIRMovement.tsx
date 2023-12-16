import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";

const PIRMovement = () => (
	<>
		<CustomLineChart
			path="/api/sensor/7"
			title="Movement registered by PIR sensor over time"
			xLabel="Time"
			yLabel="People"
			color={COLORS.green}
		/>
		<BackButton />
	</>
);

export default PIRMovement;
