import React, { useState, useEffect } from "react";
import { fetchRedditPosts, fetchTweets } from "../api";

const Posts = () => {
    const [redditPosts, setRedditPosts] = useState([]);
    const [tweets, setTweets] = useState([]);

    useEffect(() => {
        // Fetch Reddit Posts
        fetchRedditPosts("earthquake", 5).then(data => setRedditPosts(data));

        // Fetch Tweets
        fetchTweets("earthquake", 5).then(data => setTweets(data));
    }, []);

    return (
        <div>
            <h2>Reddit Posts</h2>
            <ul>
                {redditPosts.map((post, index) => (
                    <li key={index}>
                        <a href={post.url} target="_blank" rel="noopener noreferrer">{post.title}</a>
                    </li>
                ))}
            </ul>

            <h2>Latest Tweets</h2>
            <ul>
                {tweets.map((tweet, index) => (
                    <li key={index}>{tweet.text}</li>
                ))}
            </ul>
        </div>
    );
};

export default Posts;
