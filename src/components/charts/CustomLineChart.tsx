import React, { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Plugin } from "chart.js";
import { Line } from "react-chartjs-2";
import zoomPlugin from "chartjs-plugin-zoom";

import "../../../styles/Chart.css";
import { Icon } from "@iconify/react";

// Set the interval for showing the x axis labels
const INTERVAL = 2;

interface Entry {
	timestamp: string;
	value: number;
	id: number;
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

type LineProps = {
	path: string;
	title: string;
	yLabel: string;
	xLabel: string;
	color: string;
};

function pad(number: number) {
	return number < 10 ? "0" + number : number;
}

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
const CustomLineChart = ({ path, title, yLabel, xLabel, color }: LineProps) => {
	const [entries, setEntries] = useState<Entry[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	const chartRef = useRef<ChartJS | null>(null);

	// Functions for zooming used in the buttons
	const resetZoom = () => {
		if (chartRef.current) {
			const chartInstance = chartRef.current as ChartJS;
			chartInstance.resetZoom();
		}
	};

	const zoomIn = () => {
		if (chartRef.current) {
			const chartInstance = chartRef.current as ChartJS;
			chartInstance.zoom(1.1);
		}
	};

	const zoomOut = () => {
		if (chartRef.current) {
			const chartInstance = chartRef.current as ChartJS;
			chartInstance.zoom(0.9);
		}
	};

	const PATH: string = path;

	function fetchData() {
		async function fetchFunc() {
			const response = await fetch(PATH);
			return response.json();
		}

		fetchFunc().then((resp) => {
			setEntries(resp);
			if (loading) setLoading(false);
		});
	}

	useEffect(() => {
		setLoading(true);
		fetchData();
		// Periodic fetching of data from backend (every 15 minutes)
		const refetchFunc = setInterval(() => fetchData(), 900000);
		// Return timeout teardown to stop it when component is destroyed
		return () => clearInterval(refetchFunc);
	}, []);

	if (!entries.map) {
		return <span className="d-flex justify-content-center">There was an error loading the data.</span>;
	}

	// Create data for the chart in the x axis
	const labels = entries.map((entry, index, array) => {
		const date = new Date(entry.timestamp);
		const hours = pad(date.getHours());
		const minutes = pad(date.getMinutes());
		const timeString = `${hours}:${minutes}`;

		if (index === 0 || (array[index - 1] && new Date(array[index - 1].timestamp).toDateString() !== date.toDateString())) {
			// Show date on first entry or when the date changes
			return `${date.toLocaleDateString()}, ${timeString}`;
		} else if (index % INTERVAL === 0) {
			// Replace 'n' with your desired interval
			// Show time at regular intervals
			return timeString;
		}
		// Return null or an empty string for other entries
		return "";
	});

	const values = entries.map((entry) => entry.value);

	// Set min and max values for the y axis as min and max values from the data with a margin of 5%
	let min = entries.length > 0 ? Math.min(...values) : 0;
	min = min - min * 0.05;
	let max = entries.length > 0 ? Math.max(...values) : 0;
	max = max + max * 0.05;

	// Create data for the chart in the y axis
	const data = {
		labels,
		datasets: [
			{
				label: "Measurements",
				data: values,
				borderColor: color,
				backgroundColor: color,
			},
		],
	};

	// Set options for the chart
	const options = {
		plugins: {
			title: {
				display: true,
				text: title,
			},
			legend: {
				position: "top" as const,
				labels: {
					font: {
						size: 18,
						family: "Roboto",
					},
				},
			},
			zoom: {
				zoom: {
					wheel: {
						enabled: true,
					},
					mode: "xy",
					drag: {
						enabled: true,
						backgroundColor: "rgba(255, 94, 94, 0.2)",
						borderColor: "rgba(255, 94, 94, 0.4)",
						borderWidth: 1,
						modifierKey: "ctrl",
					},
				},
				pan: {
					enabled: true,
					mode: "xy",
				},
			},
		},
		scales: {
			x: {
				display: true,
				title: {
					display: true,
					text: xLabel,
				},
				grid: {
					display: true,
				},
			},
			y: {
				display: true,
				title: {
					display: true,
					text: yLabel,
				},
				min: min,
				max: max,
			},
		},
		elements: {
			point: {
				radius: 5,
			},
		},
	};

	return loading ? (
		<div className="d-flex justify-content-center">
			<div className="spinner-border" role="status">
				<span className="sr-only">Loading...</span>
			</div>
		</div>
	) : (
		<>
			<Line ref={chartRef as any} data={data} options={options as any} className="mb-3 " />
			<div>
				<div className="col justify-content-evenly pull-left">
					<div className="m-1 ">
						<span className="fw-bold ">Click and drag</span> - pan area
					</div>
					<div className="m-1 ">
						<span className="fw-bold ">Mouse wheel</span> - zoom in and out
					</div>
					<div className="m-1 ">
						<span className="fw-bold ">Ctrl + drag over area</span> - zoom to selected area
					</div>
				</div>
				<div className="col justify-content-evenly pull-right">
					<button className="btn btn-outline-primary" onClick={zoomIn}>
						<span>Zoom In</span>
						<Icon icon="solar:magnifer-zoom-in-bold-duotone" width={24} height={24} />
					</button>
					<button className="btn btn-outline-primary" onClick={zoomOut}>
						<span>Zoom Out</span>
						<Icon icon="solar:magnifer-zoom-out-bold-duotone" width={24} height={24} />
					</button>
					<button className="btn btn-outline-primary" onClick={resetZoom}>
						<span>Reset zoom</span>
						<Icon icon="solar:close-circle-bold-duotone" width={24} height={24} />
					</button>
				</div>
			</div>
		</>
	);
};

export default CustomLineChart;
