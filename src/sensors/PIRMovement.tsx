import React from "react";
import { COLORS } from "../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";

const PIRMovement = () => (
	<CustomLineChart
		path="/api/sensor/pir/movement"
		title="Movement registered by PIR sensor over time"
		legend="People"
		xLabel="People"
		yLabel="Time"
		color={COLORS.green}
	/>
);

export default PIRMovement;
