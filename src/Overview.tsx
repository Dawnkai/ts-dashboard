import React, { useEffect, useState } from 'react';
import temperature_icon from '../assets/temperature_icon.png';

import "../styles/Overview.css";

interface Fields {
    [key: string]: {
        title: string;
        value: string;
    };
};

export default function Overview() {
    const [fields, setFields] = useState<Fields>({});

    useEffect(() => {
        async function fetchData() {
            const response = await fetch("/api/overview");
            return response.json();
        }
        fetchData().then(resp => setFields(resp));
    }, []);

    return (
        <div className="container">
            <div className="row justify-content-evenly mb-4">
                <div className="col-3 card card-container">
                    {/* Temperatura (DHT-22) */}
                    <span className="card-title">{fields?.["field1"]?.["title"]}</span>
                    <div className="card-text card-content align-items-center justify-content-center">
                        <img src={temperature_icon} alt="temperature" className="card-icon"></img>
                        <span className="card-value">{fields?.["field1"]?.["value"]} °C</span>
                    </div>
                </div>
                <div className="col-3 card card-container">
                    {/* Wilgotność względna (DHT-22) */}
                    <span className="card-title">{fields?.["field2"]?.["title"]}</span>
                    <h5 className="card-text">{fields?.["field2"]?.["value"]} %</h5>
                </div>
                <div className="col-3 card card-container">
                    {/* Natężenie światła (BH-1750) */}
                    <span className="card-title">{fields?.["field3"]?.["title"]}</span>
                    <h5 className="card-text">{fields?.["field3"]?.["value"]} lx</h5>
                </div>
            </div>
            <div className="row justify-content-evenly mb-4">
                <div className="col-3 card card-container">
                    {/* Ciśnienie atm. (BMP-180) [hPa] */}
                    <span className="card-title">{fields?.["field4"]?.["title"]}</span>
                    <h5 className="card-text">{fields?.["field4"]?.["value"]} hPa</h5>
                </div>
                <div className="col-3 card card-container">
                    {/* Temp. grzejnika (DS18B20) [°C] */}
                    <span className="card-title">{fields?.["field5"]?.["title"]}</span>
                    <h5 className="card-text">{fields?.["field5"]?.["value"]} °C</h5>
                </div>
                <div className="col-3 card card-container">
                    {/* Temperatura (DS18B20) [°C] */}
                    <span className="card-title">{fields?.["field6"]?.["title"]}</span>
                    <h5 className="card-text">{fields?.["field6"]?.["value"]} °C</h5>
                </div>
            </div>
            <div className="row justify-content-evenly">
                <div className="col-3 card card-container">
                    {/* Ruch (PIR) */}
                    <span className="card-title">{fields?.["field7"]?.["title"]}</span>
                    <h5 className="card-text">{fields?.["field7"]?.["value"]} PIR</h5>
                </div>
                <div className="col-3 card card-container">
                    {/* Temperatura (BMP-180) [°C] */}
                    <span className="card-title">{fields?.["field8"]?.["title"]}</span>
                    <h5 className="card-text">{fields?.["field8"]?.["value"]} °C</h5>
                </div>
            </div>
        </div>
    );
}
