import React from "react";
import download from "downloadjs";

import "../../styles/ExportButton.css";

interface ExportButtonProps {
    sensorIds?: string[]
};

export default function ExportButton({ sensorIds }: ExportButtonProps) {
    function startExport() {
		async function exportFunc() {
            if (sensorIds) {
                await fetch("/api/export/export.csv", {
                    method: "POST",
                    headers: {
                        'Accept': 'text/csv',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 'sensors': sensorIds })
                }).then((response) => {
                    if (response.status !== 200) {
                        throw new Error("Unable to download exported file!");
                    }
                    response.blob().then((file) => download(file, "export.csv", "text/csv"));
                });
            }
            await fetch("/api/export/export.csv", {
                method: "POST",
                headers: {
                    'Accept': 'text/csv',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            }).then((response) => {
                if (response.status !== 200) {
                    throw new Error("Unable to download exported file!");
                }
                response.blob().then((file) => download(file, "export.csv", "text/csv"));
            });
		}

        exportFunc();
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
                        <div className="modal-body">
                            Please select export option:
                            <div className="d-flex justify-content-center align-items-center mt-4">
                                <button type="button" className="btn btn-success">Export from API</button>
                                <button type="button" className="btn btn-success" onClick={() => startExport()}>Export from Database</button>
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-start">
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
	);
}
