urlParams=new URLSearchParams(window.location.search);
personId=urlParams.get('id');

const detailsContainer=document.querySelector('.detailsContainer');
const profile=document.querySelector('#profile');
const details=document.querySelector('#details');

const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTUwM2Y3ZDc3Yzk5YzIxMDliMThkMDJkODhlMzZiOSIsInN1YiI6IjY1ZDlmOWRmNzJkODU1MDE2MmJiY2NhZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3v0fESxS9UBYaVMzt4u6GG-0mBUYBGKIAoQ0CvxWt2I'
    }
  };
  
  fetch(`https://api.themoviedb.org/3/person/${personId}?language=en-US`, options)
    .then(response => response.json())
    .then(data =>{
        var profilePath=data.profile_path;
        var  image=document.createElement('img');
        image.src=`https://image.tmdb.org/t/p/w500${profilePath}`;
        profile.appendChild(image);

        var name=document.querySelector("#name");
        name.textContent=data.name;
        details.appendChild(name);

        var bio=document.querySelector("#bio");
        bio.textContent=data.biography;
        details.appendChild(bio);

        var knowMore = document.querySelector("#knowMore");
        var p = document.createElement('p');
        p.textContent = "know more on ";
        var IMDB = document.createElement('a');
        IMDB.textContent = "IMDB";
        IMDB.target="_main";
        IMDB.style.color="black";
        IMDB.href = `https://www.imdb.com/name/${data.imdb_id}/`;
        p.appendChild(IMDB);
        p.style.color="black";
        details.appendChild(p); 
    })
    .catch(err => console.error(err));

const filmographyApi = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTUwM2Y3ZDc3Yzk5YzIxMDliMThkMDJkODhlMzZiOSIsInN1YiI6IjY1ZDlmOWRmNzJkODU1MDE2MmJiY2NhZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3v0fESxS9UBYaVMzt4u6GG-0mBUYBGKIAoQ0CvxWt2I'
    }
  };
  
  fetch(`https://api.themoviedb.org/3/person/${personId}/movie_credits?language=en-US`, filmographyApi)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        var cast = data.cast;
        var crew = data.crew;
        filmography = document.querySelector(".filmography");

        function createMovieElement(movie) {
            if (movie.poster_path !== null && movie.poster_path!==undefined) {
                const movieSlide = document.createElement('div');
                movieSlide.classList.add('movieSlide');

                poster = document.createElement('a');
                poster.href = "https://shashankbharadwaj27.github.io/FilmFlick/movieDetails.html?id=" + encodeURIComponent(movie.id);
                img = document.createElement('img');
                img.src = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
                poster.appendChild(img);
                movieSlide.appendChild(poster);

                const name = document.createElement('p');
                name.textContent = movie.title;
                movieSlide.appendChild(name);

                filmography.appendChild(movieSlide);
            }
        }
        cast.forEach(createMovieElement);
        crew.forEach(createMovieElement)
    })
    .catch(err => console.error(err));
