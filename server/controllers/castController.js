import {queryDatabase} from '../database/connection.js';

export async function handleGetPersonDetails(req, res) {
    const personId = req.params.id;

    try {
        // Try fetching person details from the actors table
        let personDetails = await queryDatabase(`SELECT * FROM actors WHERE id = ?`, [personId]);

        // If not found in actors, try in directors
        if (personDetails.length === 0) {
            personDetails = await queryDatabase(`SELECT * FROM directors WHERE director_id = ?`, [personId]);

            if (personDetails.length === 0) {
                return res.status(404).json({ message: 'Person not found' });
            }
        }

        return res.json(personDetails[0]);

    } catch (err) {
        return res.status(err.statusCode || 500).json({ message: err.message });
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