import * as tmdb from '../services/tmdb.js';
import connection from '../database/connection.js'

export async function handleGetTopRatedMovies(req,res){
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdb.getTopRatedMovies(page);
    res.json(data.results);
  } catch (error) {
    console.error('Get top rated error:', error);
    res.status(500).json({ message: 'Failed to fetch top rated movies' });
  }
}

export async function handleNewReleases(req,res){
  try {
    const data = await tmdb.getNewReleases();
    res.json(data.results);
  } catch (error) {
    console.error('Get new releases error:', error);
    res.status(500).json({ message: 'Failed to fetch new releases' });
  }
}

export async function handleGetMovieDetails(req,res){
  try {
    const { movieId } = req.params;
    const movie = await tmdb.getMovieDetails(movieId);
    res.json(movie);
  } catch (error) {
    console.error('Get movie details error:', error);
    res.status(500).json({ message: 'Failed to fetch movie details' });
  }
}

export async function handleGetMovieCredits(req,res){
  try {
    const { movieId } = req.params;
    const credits = await tmdb.getMovieCredits(movieId);
    res.json(credits);
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ message: 'Failed to fetch movie credits' });
  }
}

export async function handleSearchResults(req, res) {
  const { genre, year, category = 'movie' } = req.query;
  const query = req.params.query?.trim();

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  if (category === 'user') {
    // Search users by username or name
    const sql = `SELECT username, pfp_url FROM users WHERE username LIKE ? OR name LIKE ?`;
    connection.query(sql, [`%${query}%`, `%${query}%`], (err, results) => {
      if (err) {
        console.error('User search error:', err);
        return res.status(500).json({ error: 'Error fetching users' });
      }
      res.json([...results ]);
    });
  } else {
    // Search movies
    try{
      const response = await tmdb.searchMovies(query, year, 1);
      const results = response.results;
      res.json([...results]);
    }catch(error){
      console.error('Search movie error:', error);
      res.status(500).json({ message: 'Failed to search movie' });
    }
  }
}
