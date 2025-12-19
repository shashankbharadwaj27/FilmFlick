import { queryDatabase } from '../database/connection.js';
import { createAccessToken, createRefreshToken, validateRefreshToken  } from '../middlewares/authentication.js';
import bcrypt from 'bcrypt';
import { getMovieDetails } from '../services/tmdb.js';

// Constants
const SALT_ROUNDS = 10;
const COOKIE_CONFIG = { httpOnly: true, secure: true, sameSite: 'Strict' };

const ACCESS_COOKIE_CONFIG = { 
  httpOnly: true, 
  secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
  sameSite: 'Strict',
  maxAge: 15 * 60 * 1000 // 15 minutes
};

const REFRESH_COOKIE_CONFIG = { 
  httpOnly: true, 
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/user' // Only sent to refresh endpoint
};

// Helper to remove sensitive fields
const sanitizeUser = (user) => {
  const { password, email, ...userData } = user;
  return userData;
};

// Helper for consistent error responses
const handleError = (res, status, message, error = null) => {
  if (error) console.error(message, error);
  res.status(status).json({ error: message });
};

// User Login
export async function handleUserLogin(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return handleError(res, 400, 'Username and password are required');
  }

  try {
    const users = await queryDatabase('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!users.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = createAccessToken(user.username);
    const refreshToken = createRefreshToken(user.username);


    // Store refresh token in database
    await queryDatabase(
        'INSERT INTO refresh_tokens (username, token, expires_at) VALUES (?, ?, ?)',
        [
            user.username,
            refreshToken,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from creation
        ]
    );

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_CONFIG);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_CONFIG);
    
    res.status(200).json({ 
      user: sanitizeUser(user),
    });

  } catch (error) {
    handleError(res, 500, 'Login failed', error);
  }
}

// User Signup
export async function handleUserSignUp(req, res) {
  const { username, password, name } = req.body;

  // Validate input
  if (!username || !password || !name) {
    return handleError(res, 400, 'Username, password, and name are required');
  }

  if (password.length < 8) {
    return handleError(res, 400, 'Password must be at least 6 characters');
  }

  try {
    // Check if user exists
    const existingUsers = await queryDatabase(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await queryDatabase(
      'INSERT INTO users (username, name, password) VALUES (?, ?, ?)',
      [username, name, hashedPassword]
    );

    // Fetch created user
    const newUsers = await queryDatabase(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    const newUser = newUsers[0];

    const accessToken = createAccessToken(newUser.username);
    const refreshToken = createRefreshToken(newUser.username);

    await queryDatabase(
        'INSERT INTO refresh_tokens (username, token, expires_at) VALUES (?, ?, ?)',
        [
            newUser.username,
            refreshToken,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ]
    );

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_CONFIG);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_CONFIG);

    res.status(201).json({ 
      user: sanitizeUser(newUser),
    });

  } catch (error) {
    handleError(res, 500, 'Signup failed', error);
  }
}

// Verify Authentication - Check if user has valid access token
export async function handleVerifyAuth(req, res) {
  try {
    // req.user is set by validateAccessToken middleware
    const { username } = req.user;

    // Fetch fresh user data from database
    const users = await queryDatabase(
      'SELECT username, name, pfp_url, bio, location, created_at FROM users WHERE username = ?',
      [username]
    );

    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ 
      user: users[0] 
    });
  } catch (error) {
    handleError(res, 500, 'Verification failed', error);
  }
}

//Handle Refresh Token
export async function handleRefreshToken(req, res) {
    try {
        // req.refreshToken is set by validateRefreshToken middleware
        const { username, token } = req.refreshToken;

        // Check if refresh token exists in database (not revoked)
        const tokens = await queryDatabase(
            'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (!tokens.length) {
            return res.status(401).json({ 
                error: 'Refresh token revoked or expired'
            });
        }

        // Generate new access token
        const newAccessToken = createAccessToken(username);

        // Set new access token cookie
        res.cookie('accessToken', newAccessToken, ACCESS_COOKIE_CONFIG);

        res.status(200).json({ 
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        handleError(res, 500, 'Token refresh failed', error);
    }
}

// User Logout
export async function handleUserLogout(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            // Revoke refresh token from database
            await queryDatabase(
                'DELETE FROM refresh_tokens WHERE token = ?',
                [refreshToken]
            );
        }
        
        // Clear both cookies
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
            
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/user'
        });
        
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        handleError(res, 400, 'Logout failed', error);
    }
}

// Get User Info
export async function getUserInfo(req, res) {
  const { username } = req.body;

  if (!username) {
    return handleError(res, 400, 'Username is required');
  }

  try {
    const users = await queryDatabase(
      'SELECT username, name, pfp_url, bio, location, created_at FROM users WHERE username = ?',
      [username]
    );

    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(users[0]);
  } catch (error) {
    handleError(res, 500, 'Failed to fetch user info', error);
  }
}

// Handle User Movie Log
export async function handleUserMovieLog(req, res) {
  const { username, movie, rating, date, review, rewatch, spoilers } = req.body;

  if (!username || !movie.id || !rating) {
    return handleError(res, 400, 'Missing required fields');
  }

  try {
    const result = await queryDatabase(
      `INSERT INTO user_reviews (username, movie_id, rating, review_date, review_text, rewatch, spoilers) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, movie.id, rating, date, review, rewatch || false, spoilers || false]
    );

    const reviews = await queryDatabase(
      'SELECT * FROM user_reviews WHERE review_id = ?',
      [result.insertId]
    );

    res.status(201).json(reviews[0]);
  } catch (error) {
    handleError(res, 500, 'Failed to log movie', error);
  }
}

// Get User Favorites
export async function handleGetUserFavourites(req, res) {
  const { username } = req.params;

  if (!username) {
    return handleError(res, 400, 'Username is required');
  }

  try {
    const favourites = await queryDatabase(
      `SELECT uf.* FROM user_favourites uf 
       WHERE uf.username = ?`,
      [username]
    );
    const results = await Promise.all(
      favourites.map( async (favourite)=>{
        const response = await getMovieDetails(favourite.movie_id);
        return {...favourite, ...response};
      })
    )

    res.status(200).json(results);
  } catch (error) {
    handleError(res, 500, 'Failed to fetch favorites', error);
  }
}

// Get User Followers
export async function handleGetUserFollowers(req, res) {
  const { username } = req.params;

  if (!username) {
    return handleError(res, 400, 'Username is required');
  }

  try {
    const results = await queryDatabase(
      `SELECT u.username, u.name, u.pfp_url FROM followers f 
       JOIN users u ON f.follower_username = u.username 
       WHERE f.following_username = ?`,
      [username]
    );

    res.status(200).json(results);
  } catch (error) {
    handleError(res, 500, 'Failed to fetch followers', error);
  }
}

// Get User Following
export async function handleGetUserFollowing(req, res) {
  const { username } = req.params;

  if (!username) {
    return handleError(res, 400, 'Username is required');
  }

  try {
    const results = await queryDatabase(
      `SELECT u.username, u.name, u.pfp_url FROM followers f 
       JOIN users u ON f.following_username = u.username 
       WHERE f.follower_username = ?`,
      [username]
    );

    res.status(200).json(results);
  } catch (error) {
    handleError(res, 500, 'Failed to fetch following', error);
  }
}

// Get Profile Info (with optimized queries)
export async function handleGetProfileInfo(req, res) {
  const { username } = req.params;

  if (!username) {
    return handleError(res, 400, 'Username is required');
  }

  try {
    // Fetch all data in parallel
    const [userInfo, reviews, favourites, followers, following] = await Promise.all([
      queryDatabase(
        `SELECT username, name, pfp_url, bio, location, gender, created_at FROM users WHERE username = ?`,
        [username]
      ),
      queryDatabase(
        `SELECT ur.* FROM user_reviews ur 
         WHERE ur.username = ?
         ORDER BY ur.review_date DESC`,
        [username]
      ),
      queryDatabase(
        `SELECT uf.* FROM user_favourites uf 
         WHERE uf.username = ?`,
        [username]
      ),
      queryDatabase(
        `SELECT u.username, u.name, u.pfp_url FROM followers f 
         JOIN users u ON f.follower_username = u.username 
         WHERE f.following_username = ?`,
        [username]
      ),
      queryDatabase(
        `SELECT u.username, u.name, u.pfp_url FROM followers f 
         JOIN users u ON f.following_username = u.username 
         WHERE f.follower_username = ?`,
        [username]
      ),
    ]);
    const populated_reviews = await Promise.all(
      reviews.map(async (review)=>{
        const response = await getMovieDetails(review.movie_id);
        return {...review, ...response} 
      }
    ))
    const populated_favs = await Promise.all(
      favourites.map( async (favourite)=>{
        const response = await getMovieDetails(favourite.movie_id);
        return {...favourite, ...response};
      })
    )
    res.status(200).json({
      userInfo: userInfo[0] || {},
      reviews : populated_reviews,
      favourites : populated_favs,
      followers,
      following,
      stats: {
        reviewCount: reviews.length,
        favouriteCount: favourites.length,
        followerCount: followers.length,
        followingCount: following.length,
      }
    });
  } catch (error) {
    handleError(res, 500, 'Failed to fetch profile', error);
  }
}

// Follow User
export async function handleFollowRequest(req, res) {
  const { userToFollow, loggedInUser } = req.body;

  if (!userToFollow || !loggedInUser) {
    return handleError(res, 400, 'Missing required fields');
  }

  if (userToFollow === loggedInUser) {
    return handleError(res, 400, 'Cannot follow yourself');
  }

  try {
    // Check if already following
    const existing = await queryDatabase(
      'SELECT * FROM followers WHERE follower_username = ? AND following_username = ?',
      [loggedInUser, userToFollow]
    );

    if (existing.length) {
      return res.status(409).json({ error: 'Already following this user' });
    }

    // Insert follow
    await queryDatabase(
      'INSERT INTO followers (follower_username, following_username) VALUES (?, ?)',
      [loggedInUser, userToFollow]
    );

    // Return followed user's info
    const users = await queryDatabase(
      'SELECT username, name, pfp_url, bio FROM users WHERE username = ?',
      [userToFollow]
    );

    res.status(201).json(users[0]);
  } catch (error) {
    handleError(res, 500, 'Failed to follow user', error);
  }
}

// Unfollow User
export async function handleUnfollowRequest(req, res) {
  const { userToUnfollow, loggedInUser } = req.body;

  if (!userToUnfollow || !loggedInUser) {
    return handleError(res, 400, 'Missing required fields');
  }

  try {
    // Check if follow exists
    const existing = await queryDatabase(
      'SELECT * FROM followers WHERE follower_username = ? AND following_username = ?',
      [loggedInUser, userToUnfollow]
    );

    if (!existing.length) {
      return res.status(404).json({ error: 'Not following this user' });
    }

    // Delete follow
    await queryDatabase(
      'DELETE FROM followers WHERE follower_username = ? AND following_username = ?',
      [loggedInUser, userToUnfollow]
    );

    const users = await queryDatabase(
      'SELECT username, name, pfp_url, bio FROM users WHERE username = ?',
      [userToUnfollow]
    );

    res.status(200).json(users[0]);
  } catch (error) {
    handleError(res, 500, 'Failed to unfollow user', error);
  }
}

// Get Friends Latest Activity (optimized query)
export async function handleGetFriendsLatestActivity(req, res) {
  const { following } = req.body;

  const usernames = following?.map(user => user.username);
  if (!usernames?.length) {
    return res.status(400).json({ error: 'No users to fetch activity for' });
  }

  try {
    const placeholders = usernames.map(() => '?').join(', ');

    const query = `
      SELECT ur.*
      FROM user_reviews ur
      JOIN (
        SELECT username, MAX(review_date) AS latest_review
        FROM user_reviews
        WHERE username IN (${placeholders})
        GROUP BY username
      ) latest
        ON ur.username = latest.username
       AND ur.review_date = latest.latest_review
      ORDER BY ur.review_date DESC
    `;

    const rows = await queryDatabase(query, usernames);
    const populated_results = await Promise.all(
      rows.map(async (row)=>{
        const response = await getMovieDetails(row.movie_id);
        return {...row, ...response};
      })
    )
    res.status(200).json(populated_results);
  } catch (error) {
    handleError(res, 500, 'Failed to fetch activity', error);
  }
}


// Update Profile
export async function handleUpdateProfile(req, res) {
  const { username, name, bio, location, favourites } = req.body;

  if (!username || !name) {
    return handleError(res, 400, 'Username and name are required');
  }

  if (!Array.isArray(favourites) || favourites.length > 5) {
    return handleError(res, 400, 'Favourites must be an array with max 5 items');
  }

  try {
    // Update user info
    await queryDatabase(
      'UPDATE users SET name = ?, bio = ?, location = ? WHERE username = ?',
      [name, bio || null, location || null, username]
    );

    // Delete old favorites
    await queryDatabase('DELETE FROM user_favourites WHERE username = ?', [username]);

    // Insert new favorites
    const filteredFavourites = favourites.filter(id => id != null);
    
    if (filteredFavourites.length > 0) {
      const values = filteredFavourites
        .map(movieId => [username, movieId]);
      
      // Use parameterized query instead of string concatenation
      for (const [user, movieId] of values) {
        await queryDatabase(
          'INSERT INTO user_favourites (username, movie_id) VALUES (?, ?)',
          [user, movieId]
        );
      }
    }

    // Fetch updated favorites
    const updatedFavourites = await queryDatabase(
      'SELECT movie_id FROM user_favourites WHERE username = ?',
      [username]
    );

    res.status(200).json({
      username,
      name,
      bio,
      location,
      favourites: updatedFavourites.map(fav => fav.movie_id)
    });
  } catch (error) {
    handleError(res, 500, 'Failed to update profile', error);
  }
}