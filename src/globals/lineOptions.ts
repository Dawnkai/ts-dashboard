/**
 * Creates options for the line chart
 * @param title title of the line chart
 * @param xlabel x-axis label
 * @param ylabel y-axis label
 * @param ymin minimum value of y-axis
 * @param ymax maximum value of y-axis
 * @param color color of the line
 * @returns options for the line chart
 */
export const getOptions = (title: string, xlabel: string, ylabel: string, ymin?: number, ymax?: number, color?: string) => {
	return {
		responsive: true,
		plugins: {
			legend: {
				position: "top" as const,
				labels: {
					font: {
						size: 18,
						family: "Roboto",
					},
				},
			},
			title: {
				display: true,
				text: title,
			},
		},
		scales: {
			x: {
				display: true,
				title: {
					display: true,
					text: xlabel,
				},
				grid: {
					display: true,
				},
			},
			y: {
				display: true,
				title: {
					display: true,
					text: ylabel,
				},
				min: ymin,
				max: ymax,
			},
		},
		elements: {
			point: {
				radius: 5,
			},
		},
	};
};
