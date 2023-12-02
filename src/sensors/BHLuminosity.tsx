import React from "react";
import { COLORS } from "../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";

const BHLuminosity = () => (
	<CustomLineChart
		path="/api/sensor/bh/luminosity"
		title="Luminosity registered by BH-1750 sensor over time"
		legend="Luminosity"
		xLabel="Luminosity [lx]"
		yLabel="Time"
		color={COLORS.orange}
	/>
);

export default BHLuminosity;
