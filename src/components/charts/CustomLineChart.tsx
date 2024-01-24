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
	predictionColor: string;
};

function pad(number: number) {
	return number < 10 ? "0" + number : number;
}

// Create data for the chart in the x axis
function processLabels(array: string[]) {
	return array.map((entry, index, array) => {
		const date = new Date(entry);
		const hours = pad(date.getHours());
		const minutes = pad(date.getMinutes());
		const timeString = `${hours}:${minutes}`;

		if (index === 0 || (array[index - 1] && new Date(array[index - 1]).toDateString() !== date.toDateString())) {
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
}

type SelectProps = {
	setSelectedModel: (value: string) => void;
};

const Select = ({ setSelectedModel }: SelectProps) => {
	return (
		<select className="form-select col" aria-label="Model selection" onChange={(e) => setSelectedModel(e.target.value)} defaultValue="">
			<option value="">Select model</option>
			<option value="KNN">KNN</option>
			<option value="CatBoost">CatBoost</option>
			<option value="XGBoost">XGBoost</option>
			<option value="Prophet">Prophet</option>
		</select>
	);
};

/**
 * Component for displaying a line chart
 * @param {string} path Path to fetch data from API
 * @param {string} title Title of the chart
 * @param {string} legend Legend of the chart
 * @param {string} yLabel Label of the y-axis
 * @param {string} xLabel Label of the x-axis
 * @param {string} color Color of the line
 * @param {string} predictionColor Color of the prediction line
 * @returns
 */
const CustomLineChart = ({ path, title, yLabel, xLabel, color, predictionColor }: LineProps) => {
	const [labels, setLabels] = useState<string[]>([]);
	const [measurements, setMeasurements] = useState([]);
	const [predictions, setPredictions] = useState([]);

	const [loading, setLoading] = useState<boolean>(true);
	const [loadingPrediction, setLoadingPrediction] = useState<boolean>(false);

	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [selectedModel, setSelectedModel] = useState<string>("");

	const modelSelection = () => {
		const handleStartDate = (event: React.ChangeEvent<HTMLInputElement>) => {
			setStartDate(new Date(event.target.value));
		};

		const handleEndDate = (event: React.ChangeEvent<HTMLInputElement>) => {
			setEndDate(new Date(event.target.value));
		};

		const handlePredict = async () => {
			setLoadingPrediction(true);
			if (selectedModel === "") {
				alert("Please select a model!");
				setLoadingPrediction(false);
				return;
			}
			if (startDate === null || endDate === null) {
				alert("Please select a date range!");
				setLoadingPrediction(false);
				return;
			}
			if (startDate > endDate) {
				alert("Start date cannot be before end date!");
				setLoadingPrediction(false);
				return;
			}
			const response = await fetch(`${path}/predict`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					startDate: startDate.toISOString().split(".")[0] + "Z",
					endDate: endDate.toISOString().split(".")[0] + "Z",
					algorithm: selectedModel,
				}),
			});
			if (response.status !== 200) {
				alert("There was an error while fetching the data.");
				setLoadingPrediction(false);
				return;
			}
			const data = await response.json();
			setPredictions(data[1]);
			setLabels(processLabels(data[0]));
			setLoadingPrediction(false);
		};

		return (
			<div className="row align-items-center">
				<Select setSelectedModel={setSelectedModel} />
				<div className="mb-3 col">
					<label className="form-label" htmlFor="startDate">
						From:
					</label>
					<input className="form-control" type="date" name="startDate" id="startDate" onChange={handleStartDate} />
				</div>
				<div className="mb-3 col">
					<label className="form-label" htmlFor="endDate">
						To:
					</label>
					<input className="form-control" type="date" name="endDate" id="endDate" onChange={handleEndDate} />
				</div>
				{loadingPrediction ? (
					<div className="d-flex justify-content-center">
						<div className="spinner-border" role="status">
							<span className="sr-only">Loading...</span>
						</div>
					</div>
				) : (
					<input type="button" value="Predict" className=" col btn btn-outline-success" onClick={handlePredict} />
				)}
			</div>
		);
	};

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
			const entryValues = resp.map((entry: Entry) => entry.value);
			const entryLabels = resp.map((entry: Entry) => new Date(entry.timestamp));
			setLabels(processLabels(entryLabels));
			setMeasurements(entryValues);
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

	if (!measurements.map) {
		return <span className="d-flex justify-content-center">There was an error loading the data.</span>;
	}

	// console.log("MEASUREMENTS: ", measurements);
	// console.log("PREDICTIONS: ", predictions);
	// console.log("LABELS: ", processedLabels);

	// Set min and max values for the y axis as min and max values from the data with a margin of 5%
	let min = measurements.length > 0 ? Math.min(...measurements) : 0;
	min = min - min * 0.05;
	let max = measurements.length > 0 ? Math.max(...measurements) : 0;
	max = max + max * 0.05;

	const datasets = [
		{
			label: "Measurements",
			data: measurements,
			borderColor: color,
			backgroundColor: color,
		},
	];

	if (predictions.length > 0) {
		datasets.push({
			label: "Predictions",
			data: predictions,
			borderColor: predictionColor,
			backgroundColor: predictionColor,
		});
	}

	// Create data for the chart in the y axis
	const data = {
		labels,
		datasets: datasets,
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
			<div className="mt-4 ">{modelSelection()}</div>
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
