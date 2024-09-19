import React from "react";

const PostOperations = ({ fetchPosts, refreshToken, handleLogout, posts }) => {
    return (
        <div>
            <h1>Post Operations</h1>
            <button onClick={fetchPosts}>Fetch Posts</button>
            <button onClick={refreshToken}>Refresh Token</button>
            <button onClick={handleLogout}>Logout</button>
            <ul>
                {posts.map((post, index) => (
                    <li key={index}>{post.title}</li>
                ))}
            </ul>
        </div>
    );
};

export default PostOperations;

