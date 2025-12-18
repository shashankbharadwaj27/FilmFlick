import * as tmdb from '../services/tmdb.js';

export async function handleGetPersonDetails(req, res) {
    const personId = req.params.id;

    try {
        const data = await tmdb.getPersonDetails(personId);
        res.json(data);
    } catch (error) {
        console.error('Get person details error:', error);
        res.status(500).json({ message: 'Failed to fetch person details' });
    }
}

export async function handleGetPersonCredits(req, res) {
    const personId = req.params.id;

    try {
        // Fetch actor's movie credits
        let personCredits = await queryDatabase(
            `SELECT movie_cast.*, movies.* FROM movie_cast 
            JOIN movies ON movie_cast.movie_id = movies.movie_id 
            WHERE movie_cast.actor_id = ?`,
            [personId]
        );

        // If no actor credits, try fetching director's movies
        if (personCredits.length === 0) {
            personCredits = await queryDatabase(
                `SELECT * FROM movies WHERE director_id = ?`, 
                [personId]
            );

            if (personCredits.length === 0) {
                return res.send({ message: 'No credits found' });
            }
        }

        return res.json(personCredits);

    } catch (err) {
        return res.status(err.statusCode || 500).json({ message: err.message });
    }
}