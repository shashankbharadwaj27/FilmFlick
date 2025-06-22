import { Router } from 'express';
import { 
  handleGetTopRatedMovies, 
  handleNewReleases, 
  handleGetMovieDetails, 
  handleGetMovieCredits, 
  handleSearchResults 
} from '../controllers/moviesController.js';

const moviesRouter=new Router();

moviesRouter.get('/top-rated',handleGetTopRatedMovies);

moviesRouter.get('/new-releases',handleNewReleases);

moviesRouter.get('/credits/:id',handleGetMovieCredits);

moviesRouter.get('/:id',handleGetMovieDetails);

moviesRouter.get('/search/:query',handleSearchResults);

export default moviesRouter;