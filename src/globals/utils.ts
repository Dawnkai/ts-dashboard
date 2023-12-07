import { LoginRequest } from './interfaces';

/**
 * Make a login/register request to the server
 * @param {boolean} isLogin True if this is a login request, false if it's a register request
 * @param {LoginRequest} formData Dict containing user login and password
 * @returns Response from the server
 */
export async function sendLoginRequest(isLogin : boolean, formData : LoginRequest) {
    if (isLogin) {
        const response = await fetch(
            "api/login", {
                method: "POST",
                body: JSON.stringify(formData),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            }
        );
        return response;
    }
    const response = await fetch(
        "/api/register", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }
    );
    return response;
}

/**
 * When the user logs in, JWT token is saved to localStorage,
 * therefore if it's present - the user is logged in.
 * @returns True if token is present (user is logged in), false if not
 */
export function isLoggedIn() {
    const token = localStorage.getItem("token");
    return token ? true : false;
}

/**
 * When the user logs in, JWT token is saved to localStorage,
 * this function will extract it.
 * @returns JWT token present in localStorage
 */
export function getJWTToken() {
    return localStorage.getItem("token");
}

/**
 * When the user logs in, JWT token is saved to localStorage,
 * this function will remove it (which will effectively log him out, as login functions
 * depend on it).
 */
export function logOut() {
    localStorage.removeItem("token");
}
