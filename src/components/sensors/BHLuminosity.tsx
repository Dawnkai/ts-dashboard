import React from "react";
import { COLORS } from "../../globals/colors";
import CustomLineChart from "../charts/CustomLineChart";
import BackButton from "../BackButton";

const BHLuminosity = () => (
	<>
		<CustomLineChart
			path="/api/sensor/3"
			title="Luminosity registered by BH-1750 sensor over time"
			xLabel="Time"
			yLabel="Luminosity [lx]"
			color={COLORS.orange}
		/>
		<BackButton />
	</>
);

export default BHLuminosity;
