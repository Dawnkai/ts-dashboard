import React, { useEffect, useState } from 'react';
import air_pressure_icon from '../assets/air_pressure_icon.png';
import humidity_icon from '../assets/humidity_icon.png';
import luminosity_icon from '../assets/luminosity_icon.png';
import movement_icon from '../assets/movement_icon.png';
import temperature_icon from '../assets/temperature_icon.png';
import { useNavigate } from "react-router-dom";

import "../styles/Overview.css";

interface Fields {
    [key: string]: {
        title: string;
        value: string;
    };
};

export default function Overview() {
    const [fields, setFields] = useState<Fields>({});
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const response = await fetch("/api/overview");
            return response.json();
        }
        setLoading(true);
        fetchData().then(resp => {
            setFields(resp);
            setLoading(false);
        });
    }, []);

    return (
        <div className="container mb-4">
            {
                loading ?
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
                :
                <>
                    <div className="row justify-content-evenly mb-4">
                        <div className="col-3 card card-container justify-content-center" onClick={() => navigate("/example-sensor")}>
                            {/* Temperatura (DHT-22) */}
                            <span className="card-title">{fields?.["field1"]?.["title"]}</span>
                            <div className="card-text card-content align-items-center justify-content-center">
                                <img src={temperature_icon} alt="temperature" className="card-icon"></img>
                                <span className="card-value">
                                    <span className="sensor-value">{fields?.["field1"]?.["value"]}</span> °C
                                </span>
                            </div>
                        </div>
                        <div className="col-3 card card-container justify-content-center" onClick={() => navigate("/example-sensor")}>
                            {/* Wilgotność względna (DHT-22) */}
                            <span className="card-title">{fields?.["field2"]?.["title"]}</span>
                            <div className="card-text card-content align-items-center justify-content-center">
                                <img src={humidity_icon} alt="humidity" className="card-icon"></img>
                                <span className="card-value">
                                    <span className="sensor-value">{fields?.["field2"]?.["value"]}</span> %
                                </span>
                            </div>
                        </div>
                        <div className="col-3 card card-container justify-content-center" onClick={() => navigate("/example-sensor")}>
                            {/* Natężenie światła (BH-1750) */}
                            <span className="card-title">{fields?.["field3"]?.["title"]}</span>
                            <div className="card-text card-content align-items-center justify-content-center">
                                <img src={luminosity_icon} alt="luminosity" className="card-icon"></img>
                                <span className="card-value">
                                    <span className="sensor-value">{fields?.["field3"]?.["value"]}</span> lx
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-evenly mb-4">
                        <div className="col-3 card card-container justify-content-center" onClick={() => navigate("/example-sensor")}>
                            {/* Ciśnienie atm. (BMP-180) [hPa] */}
                            <span className="card-title">{fields?.["field4"]?.["title"]}</span>
                            <div className="card-text card-content align-items-center justify-content-center">
                                <img src={air_pressure_icon} alt="pressure" className="card-icon"></img>
                                <span className="card-value">
                                    <span className="sensor-value">{fields?.["field4"]?.["value"]}</span> hPa
                                </span>
                            </div>
                        </div>
                        <div className="col-3 card card-container justify-content-center" onClick={() => navigate("/example-sensor")}>
                            {/* Temp. grzejnika (DS18B20) [°C] */}
                            <span className="card-title">{fields?.["field5"]?.["title"]}</span>
                            <div className="card-text card-content align-items-center justify-content-center">
                                <img src={temperature_icon} alt="temperature" className="card-icon"></img>
                                <span className="card-value">
                                    <span className="sensor-value">{fields?.["field5"]?.["value"]}</span> °C
                                </span>
                            </div>
                        </div>
                        <div className="col-3 card card-container justify-content-center" onClick={() => navigate("/example-sensor")}>
                            {/* Temperatura (DS18B20) [°C] */}
                            <span className="card-title">{fields?.["field6"]?.["title"]}</span>
                            <div className="card-text card-content align-items-center justify-content-center">
                                <img src={temperature_icon} alt="temperature" className="card-icon"></img>
                                <span className="card-value">
                                    <span className="sensor-value">{fields?.["field6"]?.["value"]}</span> °C
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-evenly">
                        <div className="col-3 card card-container justify-content-center" onClick={() => navigate("/example-sensor")}>
                            {/* Ruch (PIR) */}
                            <span className="card-title">{fields?.["field7"]?.["title"]}</span>
                            <div className="card-text card-content align-items-center justify-content-center">
                                <img src={movement_icon} alt="movement" className="card-icon"></img>
                                <span className="card-value">
                                    <span className="sensor-value">{fields?.["field7"]?.["value"]}</span> PIR
                                </span>
                            </div>
                        </div>
                        <div className="col-3 card card-container justify-content-center" onClick={() => navigate("/example-sensor")}>
                            {/* Temperatura (BMP-180) [°C] */}
                            <span className="card-title">{fields?.["field8"]?.["title"]}</span>
                            <div className="card-text card-content align-items-center justify-content-center">
                                <img src={temperature_icon} alt="temperature" className="card-icon"></img>
                                <span className="card-value">
                                    <span className="sensor-value">{fields?.["field8"]?.["value"]}</span> °C
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            }
        </div>
    );
}
