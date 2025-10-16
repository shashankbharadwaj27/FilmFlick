import {queryDatabase} from '../database/connection.js';
import {createUserToken} from '../middlewares/authentication.js';
import decodeToken from '../services/auth.js';
import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import mysql from 'mysql';

// User Login
export async function handleUserLogin(req, res) {
    const { username, password } = req.body;
    try {
        const user = await queryDatabase('SELECT * FROM users WHERE username = ?', [username]);
        if (!user.length) {
            return res.status(400).json({ message: "Username doesn't exist" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user[0].password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        const token = createUserToken(user[0].username);
        res.cookie('Token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
        const { password: _, email, ...userData } = user[0];
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ error: 'An internal error occurred' });
    }
}

// User Logout
export async function handleUserLogout(req, res) {
    try {
        res.cookie('Token', '', { maxAge: 1 });
        res.status(200).send('Logout successful');
    } catch (error) {
        res.status(400).json({ error: 'An error occurred while logging out' });
    }
}

// User Signup
export async function handleUserSignUp(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, name } = req.body;
    try {
        const userExists = await queryDatabase('SELECT * FROM users WHERE username = ?', [username]);
        if (userExists.length) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await queryDatabase('INSERT INTO users (username, name, password) VALUES (?, ?, ?)', [username, name, hashedPassword]);

        const newUser = await queryDatabase('SELECT * FROM users WHERE username = ?', [username]);
        const token = createUserToken(username);
        res.cookie('Token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });

        const { password: _, ...userData } = newUser[0];
        res.status(201).json({ user: userData, token });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function getUserInfo(req,res) {
    const {username} = req.body;
    try{
        const user = await queryDatabase('SELECT * FROM users WHERE username = ?', [username]);
        res.status(200).json(user);
    }catch(err){
        res.json({error: 'Failed to fetch user info'});
    }
    
}
// Handle User Movie Log
export async function handleUserMovieLog(req, res) {
    const logDetails = req.body;
    try {
        const result = await queryDatabase(
            'INSERT INTO user_reviews(username, movie_id, rating, review_date, review_text, rewatch, spoilers) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [logDetails.username, logDetails.movie.movie_id, logDetails.rating, logDetails.date, logDetails.review, logDetails.rewatch, logDetails.spoilers]
        );

        const [insertedLog] = await queryDatabase('SELECT * FROM user_reviews WHERE review_id = ?', [result.insertId]);
        res.status(200).json(insertedLog);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while logging the movie' });
    }
}

export async function handleGetUserFavourites(req,res){
    const username = req.params.username;
    try {
        const results = await queryDatabase(
            'SELECT uf.*,movies.* FROM user_favourites uf JOIN movies ON uf.movie_id = movies.movie_id JOIN users ON uf.username = users.username WHERE uf.username = ?',
            [username]
        );
        res.status(200).json(results);
    }catch(err){
        res.status(500).json({error:'An error occurred while fetching favourites' });
    }
}

export async function handleGetUserFollowers(req, res) {
    const username = req.params.username;
    try {
        const results = await queryDatabase(
            'SELECT users.* FROM followers JOIN users ON followers.follower_username = users.username WHERE followers.following_username = ?',
            [username]
        );
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while fetching followers' });
    }
}

export async function handleGetUserFollowing(req, res) {
    const username = req.params.username;
    try {
        const results = await queryDatabase(
            'SELECT users.* FROM followers JOIN users ON followers.following_username = users.username WHERE followers.follower_username = ?',
            [username]
        );
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while fetching following users' });
    }
}


// Get Profile Info
export async function handleGetProfileInfo(req, res) {
    const username = req.params.username;
    try {
        const userInfo = await queryDatabase(`
            SELECT username, name, pfp_url, bio, location, gender, created_at
            FROM users 
            WHERE username = ?
        `, [username]);

        const reviews = await queryDatabase(
            'SELECT user_reviews.*,movies.* FROM user_reviews JOIN movies on user_reviews.movie_id = movies.movie_id WHERE user_reviews.username = ?',
            [username]
        );

        const favourites = await queryDatabase(
            'SELECT uf.*,movies.* FROM user_favourites uf JOIN movies ON uf.movie_id = movies.movie_id JOIN users ON uf.username = users.username WHERE uf.username = ?',
            [username]
        );

        const followers = await queryDatabase(
            'SELECT users.* FROM followers JOIN users ON followers.follower_username = users.username WHERE followers.following_username = ?',
            [username]
        );

        const following = await queryDatabase(
            'SELECT users.* FROM followers JOIN users ON followers.following_username = users.username WHERE followers.follower_username = ?',
            [username]
        );

        const response = {
            userinfo: userInfo.length ? userInfo[0] : {}, 
            reviews,
            favourites,
            followers,
            following
        };
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching profile information' });
    }
}

export async function handleFollowRequest(req, res) {
    const { userToFollow, loggedInUser } = req.body;
    try {
        // Check if already following
        const existingFollow = await queryDatabase(
            'SELECT * FROM followers WHERE follower_username=? AND following_username=?',
            [loggedInUser, userToFollow]
        );

        if (existingFollow.length > 0) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        // Insert follow relationship
        await queryDatabase(
            'INSERT INTO followers(follower_username, following_username) VALUES(?, ?)',
            [loggedInUser, userToFollow]
        );

        // Return followed user's info
        const newFollowing = await queryDatabase(
            'SELECT * FROM users WHERE username=?',
            [userToFollow]
        );
        res.status(200).json(newFollowing);
    } catch (err) {
        res.status(500).send('Error occurred while following the user');
    }
}

export async function handleUnfollowRequest(req, res) {
    const { userToUnfollow, loggedInUser } = req.body;
    try {
        // Check if follow relationship exists
        const existingFollow = await queryDatabase(
            'SELECT * FROM followers WHERE follower_username=? AND following_username=?',
            [loggedInUser, userToUnfollow]
        );

        if (existingFollow.length === 0) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        // Delete follow relationship
        await queryDatabase(
            'DELETE FROM followers WHERE follower_username=? AND following_username=?',
            [loggedInUser, userToUnfollow]
        );

        const unfollowedUser = await queryDatabase(
            'SELECT * FROM users WHERE username=?',
            [userToUnfollow]
        );
        res.status(200).json(unfollowedUser);
    } catch (err) {
        res.status(500).send('Error occurred while unfollowing the user');
    }
}

export async function handleGetFriendsLatestActivity(req, res) {
    const { following } = req.body;

    // Map the usernames from the 'following' array
    const usernames = following?.map(user => user.username);
    if (!usernames || usernames.length === 0) {
        return res.status(400).json({ message: 'No usernames provided.' });
    }

    try {
        // Create a placeholder string for the 'IN' clause based on the number of usernames
        const placeholders = usernames.map(() => '?').join(', ');

        const query = `
            SELECT ur.*, m.*
            FROM user_reviews ur
            JOIN (
                SELECT username, MAX(review_date) AS latest_review_date
                FROM user_reviews
                WHERE username IN (${placeholders})
                GROUP BY username
            ) latest_reviews ON ur.username = latest_reviews.username 
                            AND ur.review_date = latest_reviews.latest_review_date
            JOIN (
                SELECT username, review_date, MAX(review_id) AS latest_review_id
                FROM user_reviews
                WHERE username IN (${placeholders})
                GROUP BY username, review_date
            ) latest_ids ON ur.username = latest_ids.username
                        AND ur.review_date = latest_ids.review_date
                        AND ur.review_id = latest_ids.latest_review_id
            JOIN movies m ON m.movie_id = ur.movie_id;
        `;

        // Execute the query with the usernames as the parameters
        const rows = await queryDatabase(query, [...usernames, ...usernames]); // pass usernames twice for both IN clauses
        res.json(rows);
    } catch (error) {
        console.error('Error fetching latest reviews:', error);
        res.status(500).json({ message: 'Error fetching the latest movie reviews', error });
    }
}

export async function handleUpdateProfile(req,res){

    const { username, name, bio, location, favourites } = req.body; 
    // favourites expected to be an array of up to 4 movie IDs (integers)
    if (!Array.isArray(favourites) || favourites.length > 4) {
        return res.status(400).json({ message: 'Favourites must be an array with max 4 items' });
    }
    try {
        // Update user profile info
        await queryDatabase(
            `UPDATE users SET name = ?, bio = ?, location = ? WHERE username = ?`,
            [name, bio, location, username]
        );

        // Delete old favourites for user
        await queryDatabase(`DELETE FROM user_favourites WHERE username = ?`, [username]);

        // Insert new favourites
        const filteredFavourites = favourites.filter(movie_id => movie_id !== null);

        if (filteredFavourites.length > 0) {
        const values = filteredFavourites
            .map(movie_id => `(${mysql.escape(username)}, ${mysql.escape(movie_id)})`)
            .join(', ');

        const sql = `INSERT INTO user_favourites (username, movie_id) VALUES ${values}`;
        await queryDatabase(sql);
        }
        const updatedFavourites = await queryDatabase(
            `SELECT m.* FROM user_favourites uf JOIN movies m on uf.movie_id = m.movie_id WHERE username = ?`,
            [username]
        );

        // Send updated profile back
        res.json({
            username,
            name,
            bio,
            location,
            favourites: updatedFavourites.map(fav => fav.movie_id)
        });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
}