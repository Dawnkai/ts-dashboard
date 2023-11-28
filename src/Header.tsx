import React from 'react';

import "../styles/Header.css";

export default function Header() {
    return (
      <div className="d-flex w-100 justify-content-between mt-4 mb-4">
        <div className="title-container d-flex flex-column">
            <h1 className="main-title">TTN Dashboard</h1>
            <h3 className="page-title">Overview</h3>
        </div>
        <div className="nav-menu d-flex align-items-baseline">
            <button className="btn btn-outline-primary nav-menu-btn">
                <i className="fa fa-user-circle-o login-icon" aria-hidden="true"></i>
            </button>
        </div>
      </div>
    );
}
