import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {
                    // Call /auth/me to verify token with server
                    const res = await api.get("/auth/me");
                    setUser(res.data);
                } catch (e) {
                    console.error("Session invalid:", e);
                    logout();
                }
            }
            setLoading(false);
        };
        verifyToken();
    }, [token]);

    const login = async (username, password) => {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        const res = await api.post("/auth/login", formData);
        const newToken = res.data.access_token;

        localStorage.setItem("token", newToken);
        setToken(newToken);
        return true;
    };

    const register = async (username, email, password) => {
        await api.post("/auth/register", { username, email, password });
        return true;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
