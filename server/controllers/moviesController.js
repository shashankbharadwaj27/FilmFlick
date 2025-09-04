import connection from '../database/connection.js';

export async function handleGetTopRatedMovies(req,res){
    try{
      connection.query(
        `SELECT movies.* 
        FROM movies 
        ORDER BY movies.imdb_rating DESC 
        LIMIT 20`
        ,(err,results)=>{
          if(err)console.log(err);
          res.send(results)
        }
      )
    }
    catch(err){
        console.error(err);
    }
}

export async function handleNewReleases(req,res){
    try{
        connection.query('SELECT * FROM movies ORDER BY release_date DESC LIMIT 25',(err,results)=>{
            if (err) {
                console.error('Error fetching new releases:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.send(results);
        })
    }
    catch(err){
        console.error(err);
    }
}

export async function handleGetMovieDetails(req,res){
    const movieId=req.params.id
    try{
      connection.query(
        `SELECT 
          movies.movie_id,
          movies.tmdb_id AS movie_tmdb_id,
          movies.imdb_link,
          movies.title,
          movies.runtime,
          movies.description,
          movies.release_date,
          movies.imdb_rating,
          movies.poster,
          movies.director_id,
          directors.tmdb_id AS director_tmdb_id,
          directors.name AS director_name,
          directors.bio AS director_bio
        FROM movies
        JOIN directors ON movies.director_id = directors.director_id
        WHERE movie_id = ?`,
        [movieId],
        (err, results) => {
          if (err) throw err;
          res.send(results);
        }
      );
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
}

export async function handleGetMovieCredits(req,res){
    const movieId=req.params.id;
    try{
        connection.query('SELECT movie_cast.character_name,actors.* FROM movie_cast JOIN actors ON movie_cast.actor_id=actors.id WHERE movie_id= ?',[movieId],(err,results)=>{
            if(err) console.error(err);
            res.send(results);
        })
    }catch(err){console.error(err)}
}

export function handleSearchResults(req, res) {
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
      res.json({ users: results });
    });
  } else {
    // Search movies
    let sql = `
      SELECT M.movie_id, M.title, M.poster, M.release_date,
             GROUP_CONCAT(DISTINCT G.name) AS genres,
             YEAR(M.release_date) AS year
      FROM movies M
      LEFT JOIN movie_genres MG ON M.movie_id = MG.movie_id
      LEFT JOIN genres G ON MG.genre_id = G.id
      WHERE M.title LIKE ?
    `;
    const params = [`%${query}%`];

    if (genre) {
      sql += ` AND G.name = ?`;
      params.push(genre);
    }

    if (year) {
      sql += ` AND YEAR(M.release_date) = ?`;
      params.push(Number(year));
    }

    sql += ` GROUP BY M.movie_id ORDER BY M.release_date DESC`;

    connection.query(sql, params, (err, results) => {
      if (err) {
        console.error('Movie search error:', err);
        return res.status(500).json({ error: 'Error fetching movies' });
      }

      const formatted = results.map((m) => ({
        movie_id: m.movie_id,
        title: m.title,
        poster: m.poster,
        release_date: m.release_date || 'N/A',
        genre: m.genres?.split(',')[0] || 'Unknown',
        year: m.year || 'N/A',
      }));

      res.json({ results: formatted });
    });
  }
}
