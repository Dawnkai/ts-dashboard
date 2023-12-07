import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendLoginRequest } from "./globals/utils";
import { LoginRequest, LoginResponse } from "./globals/interfaces";

import "../styles/LoginPage.css";

export default function LoginPage() {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [formData, setFromData] = useState<LoginRequest>({
        "user_login": "",
        "user_password": ""
    });
    const [error, setError] = useState<string>("");

    const handleChangeMode = (event : any) => {
        event.preventDefault();
        event.stopPropagation();
        setIsLogin(!isLogin);
    }

    const handleSubmit = (event : any) => {
        event.preventDefault();
        event.stopPropagation();
        sendLoginRequest(isLogin, formData).then(
            (response) => {
                response.json().then(
                    (body : LoginResponse) => {
                        if (response.status === 200 || response.status === 201) {
                            localStorage.setItem("token", body.token);
                            navigate("/");
                        }
                        else {
                            setError(body.msg);
                        }
                    }
                )
            }
        ).catch(
            (reason) => {
                console.log(reason);
            }
        )
    }

    const handleChange = (event : any) => {
        const { name, value } = event.target;
        setFromData({
            ...formData,
            [name]: value
        })
    }

    const formValid = () => {
        if (formData.user_login.length > 0 && formData.user_password.length > 0) {
            return true;
        }
        return false;
    }

	return (
		<div className="container mb-4 d-flex justify-content-center align-items-center">
            <div className="login-container">
                <form>
                    <div className="mb-3">
                        <label htmlFor="login-page-username" className="form-label">Login</label>
                        <input
                            type="text"
                            className="form-control"
                            id="login-page-username"
                            name="user_login"
                            onChange={(event) => handleChange(event)}
                            value={formData.user_login}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="login-page-password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="login-page-password"
                            className="form-control"
                            aria-describedby="password-help-block"
                            name="user_password"
                            onChange={(event) => handleChange(event)}
                            value={formData.user_password}
                        />
                        { isLogin && <div id="password-help-block" className="form-text">
                            Your password must be 8-20 characters long, contain letters and numbers, and must not contain spaces, special characters, or emoji.
                        </div>}
                    </div>
                    { error.length > 0 && <div className="mb-3 mt-3 alert alert-danger" role="alert">
                        {error}
                    </div> }
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        onClick={(event) => handleSubmit(event)}
                        disabled={!formValid()}
                    >
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
