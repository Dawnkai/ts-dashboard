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
 * When the user logs in, JWT token is saved to HTTP-only cookies,
 * which cannot be read on frontend using JS, instead loggedIn is set to "true" in local storage.
 * @returns True if user is logged in, false if not
 */
export function isLoggedIn() {
    const loggedIn = localStorage.getItem("loggedIn");
    return loggedIn === "true";
}

/**
 * When the user logs in, JWT token is saved to HTTP-only cookies,
 * which cannot be read on frontend using JS, set "loggedIn" to false to log him out.
 */
export async function logOut() {
    // This request will return a reponse which will force the browser to remove http-only token
    await fetch("api/logout", { method: "HEAD" });
    localStorage.removeItem("loggedIn");
}

export function getDayBefore(date: Date) {
    const dayBefore = new Date(date);
    dayBefore.setDate(date.getDate() - 1);
    return dayBefore;
}

export function mergeDateAndTime(date: string, time: string) {
    return new Date(`${date}T${time}:00Z`)
}
