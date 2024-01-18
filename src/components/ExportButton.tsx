import React, { useState } from "react";
import download from "downloadjs";

import "../../styles/ExportButton.css";
import { getDayBefore, mergeDateAndTime } from "../globals/utils";

interface ExportButtonProps {
    sensorIds?: string[]
};

export default function ExportButton({ sensorIds }: ExportButtonProps) {
    const [exportStartDate, setExportStartDate] = useState<string>(getDayBefore(new Date()).toISOString().slice(0, 10));
    const [exportStartTime, setExportStartTime] = useState<string>(new Date().toISOString().slice(11, 16));
    const [exportEndDate, setExportEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [exportEndTime, setExportEndTime] = useState<string>(new Date().toISOString().slice(11, 16));
    const [exportInputError, setExportInputError] = useState<string>("");

    function startExport(source: "api" | "database") {
		async function exportFunc(startDate: string, endDate: string) {
            if (sensorIds) {
                await fetch("/api/export/export.csv", {
                    method: "POST",
                    headers: {
                        'Accept': 'text/csv',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'sensors': sensorIds,
                        'source': source,
                        'startDate': startDate,
                        'endDate': endDate
                    })
                }).then((response) => {
                    if (response.status !== 200) {
                        throw new Error("Unable to download exported file!");
                    }
                    response.blob().then((file) => download(file, "export.csv", "text/csv"));
                });
            } else {
                await fetch("/api/export/export.csv", {
                    method: "POST",
                    headers: {
                        'Accept': 'text/csv',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'source': source,
                        'startDate': startDate,
                        'endDate': endDate
                    })
                }).then((response) => {
                    if (response.status !== 200) {
                        throw new Error("Unable to download exported file!");
                    }
                    response.blob().then((file) => download(file, "export.csv", "text/csv"));
                });
            }
		}

        exportFunc(
            `${exportStartDate}T${exportStartTime}:00Z`,
            `${exportEndDate}T${exportEndTime}:00Z`
        );
	}

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
        // Unfortunately, actions using useState return old value right after update,
        // so we have to update the values for testing with event.target.value
        let startDateTime = mergeDateAndTime(exportStartDate, exportStartTime);
        let endDateTime = mergeDateAndTime(exportEndDate, exportEndTime);
        switch (type) {
            case "startDate":
                setExportStartDate(event.target.value);
                startDateTime = mergeDateAndTime(event.target.value, exportStartTime);
                break;
            case "startTime":
                setExportStartTime(event.target.value);
                startDateTime = mergeDateAndTime(exportStartDate, event.target.value);
                break;
            case "endDate":
                setExportEndDate(event.target.value);
                endDateTime = mergeDateAndTime(event.target.value, exportEndTime);
                break;
            case "endTime":
                setExportEndTime(event.target.value);
                endDateTime = new Date(`${exportEndDate}T${event.target.value}:00Z`);
                endDateTime = mergeDateAndTime(exportEndDate, event.target.value);
                break;
        }
        if (startDateTime > endDateTime) {
            setExportInputError("Start date cannot be before end date!");
        }
        else {
            setExportInputError("");
        }
    }

	return (
        <>
            <button type="button" className="btn export-button btn-outline-success" data-bs-toggle="modal" data-bs-target="#exportModal">
                <i className="fa fa-share-square-o" aria-hidden="true"></i>
                Export
            </button>

            <div className="modal fade" id="exportModal" tabIndex={-1} aria-labelledby="exportModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exportModalLabel">Export</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-center">
                            <h4>Please select datetime period:</h4>
                            <div className="d-flex justify-content-around">
                                <span><b>Start</b></span>
                                <span><b>End</b></span>
                            </div>
                            <div className="d-flex datetime-container justify-content-around">
                                <div className="row">
                                    <input
                                        type="date"
                                        className="form-control col-8"
                                        value={exportStartDate}
                                        onChange={(event) => handleChange(event, "startDate")}
                                    />
                                    <input
                                        type="time"
                                        className="form-control col-4"
                                        value={exportStartTime}
                                        onChange={(event) => handleChange(event, "startTime")}
                                    />
                                </div>
                                <div className="row">
                                    <input
                                        type="date"
                                        className="form-control col-8"
                                        value={exportEndDate}
                                        onChange={(event) => handleChange(event, "endDate")}
                                    />
                                    <input
                                        type="time"
                                        className="form-control col-4"
                                        value={exportEndTime}
                                        onChange={(event) => handleChange(event, "endTime")}
                                    />
                                </div>
                            </div>
                            <span className="text-danger">{exportInputError}</span>

                            <h4 className="mt-5">Please select export option:</h4>
                            <div className="d-flex justify-content-center align-items-center mt-2 mb-4">
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => startExport("api")}
                                    disabled={exportInputError !== ""}
                                >
                                    Export from API
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => startExport("database")}
                                    disabled={exportInputError !== ""}
                                >
                                    Export from Database
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-center">
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
	);
}
