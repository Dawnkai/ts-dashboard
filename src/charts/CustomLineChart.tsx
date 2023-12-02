import React, { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { getOptions } from "../globals/lineOptions";

interface Entry {
	timestamp: string;
	value: number;
	id: number;
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type LineProps = {
	path: string;
	title: string;
	legend: string;
	yLabel: string;
	xLabel: string;
	color: string;
};

/**
 * Component for displaying a line chart
 * @param {string} path Path to fetch data from API
 * @param {string} title Title of the chart
 * @param {string} legend Legend of the chart
 * @param {string} yLabel Label of the y-axis
 * @param {string} xLabel Label of the x-axis
 * @param {string} color Color of the line
 * @returns
 */
const CustomLineChart = ({ path, title, legend, yLabel, xLabel, color }: LineProps) => {
	const [entries, setEntries] = useState<Entry[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	const PATH: string = path;

	useEffect(() => {
		async function fetchData() {
			const response = await fetch(PATH);
			return response.json();
		}
		setLoading(true);
		fetchData().then((resp) => {
			console.log(resp);
			setEntries(resp);
			setLoading(false);
		});
	}, []);

	const min = entries.length > 0 ? Math.min(...entries.map((entry) => entry.value)) - 0.05 : 0;
	const max = entries.length > 0 ? Math.max(...entries.map((entry) => entry.value)) + 0.05 : 0;

	const options = getOptions(title, yLabel, xLabel, min, max);

	const labels = entries.map((entry) => {
		const date = new Date(entry.timestamp);
		const hours = date.getHours().toString();
		const minutes = date.getMinutes().toString();
		const seconds = date.getSeconds().toString();
		return `${date.toLocaleDateString()}, ${hours}:${minutes}:${seconds}`;
	});

	const data = {
		labels,
		datasets: [
			{
				label: legend,
				data: entries.map((entry) => entry.value),
				borderColor: color,
				backgroundColor: color,
			},
		],
	};

	return loading ? (
		<div className="d-flex justify-content-center">
			<div className="spinner-border" role="status">
				<span className="sr-only">Loading...</span>
			</div>
		</div>
	) : (
		<Line data={data} options={options} />
	);
};

export default CustomLineChart;
