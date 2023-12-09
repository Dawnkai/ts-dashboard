export interface LoginRequest {
    user_login: string,
    user_password: string
};

export interface LoginResponse {
    token: string,
    msg: string
};
