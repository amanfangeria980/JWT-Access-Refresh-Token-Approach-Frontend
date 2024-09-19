// App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, useNavigate } from "react-router-dom";
import PostOperations from "./PostOperations";

function App() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const navigate = useNavigate();

    // Set the access token in sessionStorage
    const setAccessToken = (token) => {
        sessionStorage.setItem("accessToken", token);
        setIsLoggedIn(true);
    };

    const getAccessToken = () => {
        return sessionStorage.getItem("accessToken");
    };

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        if (isLoggedIn) return; // Prevent multiple login attempts

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/login`,
                { username, password },
                { withCredentials: true }
            );
            setAccessToken(response.data.accessToken);
            setError("");
            navigate("/posts"); // Ensure navigation after successful login
        } catch (err) {
            setError("Login failed. Please check your credentials.");
        }
    };

    // Fetch posts (protected route)
    const fetchPosts = async () => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            setError("No access token found, please log in");
            return;
        }

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/posts`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            setPosts(response.data);
            setError("");
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError("Unauthorized. Please log in.");
            } else {
                setError("Failed to fetch posts");
            }
        }
    };

    // Refresh token
    const refreshToken = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/token`,
                {},
                { withCredentials: true }
            );
            setAccessToken(response.data.accessToken);
            setError("");
        } catch (err) {
            setError("Failed to refresh token");
        }
    };

    // Logout
    const handleLogout = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
                withCredentials: true,
            });
            sessionStorage.removeItem("accessToken");
            setIsLoggedIn(false); // Update login state
            setPosts([]);
            setError("");
            navigate("/");
        } catch (err) {
            setError("Failed to log out");
        }
    };

    useEffect(() => {
        if (getAccessToken()) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <div className="App">
                        <h1>Auth System</h1>
                        {error && <p style={{ color: "red" }}>{error}</p>}
                        {!isLoggedIn ? (
                            <form onSubmit={handleLogin}>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <button type="submit">Login</button>
                            </form>
                        ) : (
                            <PostOperations
                                fetchPosts={fetchPosts}
                                refreshToken={refreshToken}
                                handleLogout={handleLogout}
                                posts={posts}
                            />
                        )}
                    </div>
                }
            />
            <Route
                path="/posts"
                element={
                    <PostOperations
                        fetchPosts={fetchPosts}
                        refreshToken={refreshToken}
                        handleLogout={handleLogout}
                        posts={posts}
                    />
                }
            />
        </Routes>
    );
}

export default App;
