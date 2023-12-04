import React, { useState } from "react";

import "../styles/LoginPage.css";

export default function LoginPage() {

    const [isLogin, setIsLogin] = useState<boolean>(true);

    const handleChangeMode = (event : any) => {
        event.preventDefault();
        event.stopPropagation();
        setIsLogin(!isLogin);
    }

	return (
		<div className="container mb-4 d-flex justify-content-center align-items-center">
            <div className="login-container">
                <form>
                    <div className="mb-3">
                        <label htmlFor="login-page-username" className="form-label">Login</label>
                        <input type="text" className="form-control" id="login-page-username"/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="login-page-password" className="form-label">Password</label>
                        <input type="password" id="login-page-password" className="form-control" aria-describedby="password-help-block"/>
                        { isLogin && <div id="password-help-block" className="form-text">
                            Your password must be 8-20 characters long, contain letters and numbers, and must not contain spaces, special characters, or emoji.
                        </div>}
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled>
                        { isLogin ? "Sign in" : "Sign up" }
                    </button>
                </form>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#" onClick={(event) => handleChangeMode(event)}> { isLogin ? "Sign up" : "Sign in" }</a>
                {isLogin && <a className="dropdown-item" href="#">Forgot password?</a>}
            </div>
        </div>
	);
}
