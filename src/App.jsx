import React, { useState } from "react";
import axios from "axios";

function App() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");

    // Set the access token in sessionStorage
    const setAccessToken = (token) => {
        sessionStorage.setItem("accessToken", token);
    };

    const getAccessToken = () => {
        return sessionStorage.getItem("accessToken");
    };

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/login`,
                { username, password },
                { withCredentials: true }
            );
            setAccessToken(response.data.accessToken);
            setError("");
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
            setError("");
            setPosts([]);
        } catch (err) {
            setError("Failed to log out");
        }
    };

    return (
        <div className="App">
            <h1>Auth System</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!getAccessToken() ? (
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                </form>
            ) : (
                <>
                    <button onClick={fetchPosts}>Fetch Posts</button>
                    <button onClick={refreshToken}>Refresh Token</button>
                    <button onClick={handleLogout}>Logout</button>
                    <ul>
                        {posts.map((post, index) => (
                            <li key={index}>{post.title}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default App;
