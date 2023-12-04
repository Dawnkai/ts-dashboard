import React from "react";

import "../styles/LoginDropdown.css"

export default function LoginDropdown() {
	return (
		<div className="dropdown">
            <button
                className="btn btn-outline-primary login-btn"
                type="button"
                id="dropdown-menu-button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <i className="fa fa-user-circle-o login-icon" aria-hidden="true"></i>
            </button>
            <div className="dropdown-menu login-dropdown" aria-labelledby="dropdown-menu-button">
                <form className="px-4 py-3">
                    <div className="mb-3">
                        <label htmlFor="login-form-username" className="form-label">Login</label>
                        <input type="email" className="form-control" id="login-form-username" placeholder="User"/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="login-form-password" className="form-label">Password</label>
                        <input type="password" className="form-control" id="login-form-password" placeholder="Password"/>
                    </div>
                    <div className="mb-3">
                        <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="login-form-remember"/>
                            <label className="form-check-label" htmlFor="login-form-remember">
                                Remember me
                            </label>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Sign in</button>
                </form>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">Sign up</a>
                <a className="dropdown-item" href="#">Forgot password?</a>
            </div>
		</div>
	);
}
