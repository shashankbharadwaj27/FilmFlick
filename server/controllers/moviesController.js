import connection from '../database/connection.js';

export async function handleGetTopRatedMovies(req,res){
    try{
        connection.query('SELECT movies.* FROM movies WHERE movies.movie_id>250 ORDER BY movies.imdb_rating DESC LIMIT 20',(err,results)=>{
            if(err)console.log(err);
            res.send(results)})
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
        connection.query('SELECT movies.*,directors.* FROM movies JOIN directors on movies.director_id=directors.director_id WHERE movie_id = ?',[movieId],(err,results)=>{
            if(err) console.error(err);
            res.send(results);
        })
    } 
    catch(err){
        console.error(err);
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
    // Search users
    const sql = `SELECT username, pfp_url FROM users WHERE username LIKE ? OR name LIKE ?`;
    connection.query(sql, [`%${query}%`,`%${query}%`], (err, results) => {
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
      JOIN movie_genres MG ON M.movie_id = MG.movie_id
      JOIN genres G ON MG.genre_id = G.id
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
        ...m,
        genre: m.genres?.split(',')[0] || 'Unknown',
        year: m.year || 'N/A',
      }));

      res.json({ results: formatted });
    });
  }
}


