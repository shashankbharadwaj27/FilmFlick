// server/services/tmdbService.js
import dotenv from 'dotenv'
dotenv.config();
import axios from 'axios';
import NodeCache from 'node-cache';
import http from 'http';
import https from 'https';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Request deduplication map (prevents duplicate concurrent requests)
const pendingRequests = new Map();

// Optimized HTTP agents with connection pooling
const httpAgent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 10000,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 60000,
});

const httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 10000,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 60000,
});

const tmdbApi = axios.create({
    baseURL: TMDB_BASE_URL,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY}`
    },
    timeout: 10000,
    httpAgent,
    httpsAgent,
});

// Add response interceptor for better error handling
tmdbApi.interceptors.response.use(
    response => response,
    error => {
        // Log network errors specifically
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            console.warn(`Network error (${error.code}): ${error.config?.url}`);
        }
        throw error;
    }
);

// Retry only on specific network errors with shorter delays
async function withRetry(fn, maxRetries = 2) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            // Only retry on connection errors, not API errors
            if (!['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code)) {
                throw error;
            }
            
            // Don't retry on last attempt
            if (attempt === maxRetries) break;
            
            // Short delay: 200ms, 400ms
            const delay = 200 * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}

// Deduplicate concurrent requests
async function deduplicatedRequest(cacheKey, fn) {
    // Return from cache if available
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    
    // If request is already pending, wait for it
    if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey);
    }
    
    // Create promise for this request
    const promise = withRetry(fn)
        .then(data => {
            cache.set(cacheKey, data);
            pendingRequests.delete(cacheKey);
            return data;
        })
        .catch(error => {
            pendingRequests.delete(cacheKey);
            throw error;
        });
    
    // Store pending request
    pendingRequests.set(cacheKey, promise);
    return promise;
}

// Search movies
export async function searchMovies(query, year = '', page = 1) {
    const cacheKey = `search:${query}:${page}`;
    return deduplicatedRequest(cacheKey, () =>
        tmdbApi.get(`/search/movie`, {
            params: { 
                query, 
                include_adult: false, 
                language: 'en-US', 
                page,
                year 
            }
        }).then(r => r.data)
    );
}

// Get movie details
export async function getMovieDetails(tmdbId) {
    const cacheKey = `movie:${tmdbId}`;
    return deduplicatedRequest(cacheKey, () =>
        tmdbApi.get(`/movie/${tmdbId}`, {
            params: { 
                append_to_response: 'credits', 
                language: 'en-US' 
            }
        }).then(r => r.data)
    );
}

// Get popular movies
export async function getPopularMovies(page = 1) {
    const cacheKey = `popular:${page}`;
    return deduplicatedRequest(cacheKey, () =>
        tmdbApi.get(`/movie/popular`, {
            params: { language: 'en-US', page }
        }).then(r => r.data)
    );
}

// Get top rated movies
export async function getTopRatedMovies(page = 1) {
    const cacheKey = `toprated:${page}`;
    return deduplicatedRequest(cacheKey, () =>
        tmdbApi.get(`/movie/top_rated`, {
            params: { language: 'en-US', page }
        }).then(r => r.data)
    );
}

// Get movie credits
export async function getMovieCredits(tmdbId) {
    const cacheKey = `credits:${tmdbId}`;
    return deduplicatedRequest(cacheKey, () =>
        tmdbApi.get(`/movie/${tmdbId}/credits`, {
            params: { language: 'en-US' }
        }).then(r => r.data)
    );
}

// Get person details
export async function getPersonDetails(personId) {
    const cacheKey = `person:${personId}`;
    return deduplicatedRequest(cacheKey, () =>
        tmdbApi.get(`/person/${personId}`, {
            params: { 
                append_to_response: 'credits', 
                language: 'en-US' 
            }
        }).then(r => r.data)
    );
}

// Get new releases
export async function getNewReleases() {
    const cacheKey = 'new_releases';
    return deduplicatedRequest(cacheKey, () =>
        tmdbApi.get(`/movie/now_playing`, {
            params: { language: 'en-US', page: 1 }
        }).then(r => r.data)
    );
}

// Optional: Clear cache (useful for testing or manual refresh)
export function clearCache(pattern) {
    if (pattern) {
        cache.keys().forEach(key => {
            if (key.includes(pattern)) cache.del(key);
        });
    } else {
        cache.flushAll();
    }
}