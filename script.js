const trending = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTUwM2Y3ZDc3Yzk5YzIxMDliMThkMDJkODhlMzZiOSIsInN1YiI6IjY1ZDlmOWRmNzJkODU1MDE2MmJiY2NhZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3v0fESxS9UBYaVMzt4u6GG-0mBUYBGKIAoQ0CvxWt2I'
  }
 };

  fetch('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&append_to_response=credits', trending)
    .then(response => response.json())
    .then(data =>{
        list=data.results;
        
        const slidesContainer = document.querySelector(".swiper-wrapper");
        list.forEach(movie => {
            const backgroundposter = movie.backdrop_path;
            const poster=movie.poster_path;
            const movieId = movie.id;
            const backgroundURL = `https://image.tmdb.org/t/p/w500${backgroundposter}`;
        
            // Create slide element
            const slide = document.createElement('div');
            slide.classList.add('swiper-slide');
        
            const backgroundImage=document.createElement('img');
            backgroundImage.classList.add('background-image');
            backgroundImage.src=`https://image.tmdb.org/t/p/w500${backgroundposter}`;

            const imageTag=document.createElement('a');
            imageTag.href=`movieDetails.html?id=${movieId}`;
            imageTag.classList.add('imageTag')

            const image=document.createElement('img');
            image.classList.add('poster-image');
            image.src=`https://image.tmdb.org/t/p/w500${poster}`;
            imageTag.appendChild(image)
            slide.appendChild(imageTag);
            slide.appendChild(backgroundImage);

            const details=document.createElement('div');
            details.classList.add('details');

            const title=movie.title
            const name=document.createElement('a');
            name.innerText=title;
            name.setAttribute("href",`movieDetails.html?id=${movieId}`)
            details.appendChild(name);

            const overview=movie.overview
            const description=document.createElement('p');
            description.innerText=overview;
            details.appendChild(description);

            slide.appendChild(details);
            // Append slide to slides container
            slidesContainer.appendChild(slide);
        });


      const movieSlides=[]
      list.forEach(movie => {
        if (movie.poster_path !== null) {
            const movieSlide = document.createElement('div');
            movieSlide.classList.add('swiper-slide');
  
            const profileLink = document.createElement('a');
            profileLink.href = "https://shashankbharadwaj27.github.io/FilmFlick/movieDetails.html?id=" + encodeURIComponent(movie.id);
  
            const img = document.createElement('img');
            img.src = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
            profileLink.appendChild(img);
  
            const name = document.createElement('p');
            name.textContent = movie.title;
  
            movieSlide.appendChild(profileLink);
            movieSlide.appendChild(name);
  
            movieSlides.push(movieSlide);
        }
    });
  
      const trendingMovieWrapper = document.querySelector('.Trending .swiper-wrapper');
      movieSlides.forEach(slide => trendingMovieWrapper.appendChild(slide));
  
      const trending_Swiper = new Swiper('.Trending .swiper', {
        slidesPerView: 7,
        centeredSlides: false,
        spaceBetween: 20,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }
      });
    })
    .catch(err => console.error(err));

const options3 = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTUwM2Y3ZDc3Yzk5YzIxMDliMThkMDJkODhlMzZiOSIsInN1YiI6IjY1ZDlmOWRmNzJkODU1MDE2MmJiY2NhZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3v0fESxS9UBYaVMzt4u6GG-0mBUYBGKIAoQ0CvxWt2I'
  }
};
            
fetch('https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1', options3)
  .then(response => response.json())
  .then(data => {
    const results=data.results;
      
    const movieSlides=[]
    results.forEach(movie => {
      if (movie.poster_path !== null) {
          const movieSlide = document.createElement('div');
          movieSlide.classList.add('swiper-slide');

          const profileLink = document.createElement('a');
          profileLink.href = "https://shashankbharadwaj27.github.io/FilmFlick/movieDetails.html?id=" + encodeURIComponent(movie.id);

          const img = document.createElement('img');
          img.src = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
          profileLink.appendChild(img);

          const name = document.createElement('p');
          name.textContent = movie.title;

          movieSlide.appendChild(profileLink);
          movieSlide.appendChild(name);

          movieSlides.push(movieSlide);
      }
    });

    const topMovieWrapper = document.querySelector('.Top-rated .swiper-wrapper');
    movieSlides.forEach(slide => topMovieWrapper.appendChild(slide));

    const top_ratedSwiper = new Swiper('.Top-rated .swiper', {
      slidesPerView: 7,
      centeredSlides: false,
      spaceBetween: 20,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }
    });
  })
  .catch(err => console.error(err));

const options1 = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTUwM2Y3ZDc3Yzk5YzIxMDliMThkMDJkODhlMzZiOSIsInN1YiI6IjY1ZDlmOWRmNzJkODU1MDE2MmJiY2NhZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3v0fESxS9UBYaVMzt4u6GG-0mBUYBGKIAoQ0CvxWt2I'
  }
};
          
fetch('https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1', options1)
  .then(response => response.json())
  .then(data => {
    results=data.results;

    const movieSlides=[]
    results.forEach(movie => {
      if (movie.poster_path !== null) {
        const movieSlide = document.createElement('div');
        movieSlide.classList.add('swiper-slide');

          const profileLink = document.createElement('a');
          profileLink.href = "https://shashankbharadwaj27.github.io/FilmFlick/movieDetails.html?id=" + encodeURIComponent(movie.id);

          const img = document.createElement('img');
          img.src = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
          profileLink.appendChild(img);

          const name = document.createElement('p');
          name.textContent = movie.title;

          movieSlide.appendChild(profileLink);
          movieSlide.appendChild(name);

          movieSlides.push(movieSlide);
      }
    });

    const nowShowingWrapper = document.querySelector('.nowShowing .swiper-wrapper');
    movieSlides.forEach(slide => nowShowingWrapper.appendChild(slide));

    const nowShowingSwiper = new Swiper('.nowShowing .swiper', {
      slidesPerView: 7,
      centeredSlides: false,
      spaceBetween: 20,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }
    });
  })
  .catch(err => console.error(err));
          
const viewMoreLinks=document.querySelectorAll('.viewMore');
viewMoreLinks.forEach(link=>{
    link.addEventListener("click",(event)=>{
        event.preventDefault();
        let section='';
        if(link.parentNode.parentNode.classList.contains('Trending')){
          section='popular';
        }
        else if(link.parentNode.parentNode.classList.contains('Top-rated')){
          section='top_rated';
        }
        else{
          section='now_playing';
        }
        fetchMovies(section);
    })
})
    
function fetchMovies(section){
  if(section==='popular'){
    fetch(`https://api.themoviedb.org/3/movie/${section}?language=en-US&page=1&append_to_response=credits`)
      .then(response=>response.json())
      .then(data=>{
       console.log(data);
       const movieIds =data.results.map(movie=>movie.id);
       const moviesParam = encodeURIComponent(JSON.stringify(movieIds));
       window.location.href = `https://shashankbharadwaj27.github.io/FilmFlick/displaypage.html?section=${section}&movies=${moviesParam}`;
  })
      .catch(error => console.error('Error fetching movies:', error));
  }
  else{
    fetch(`https://api.themoviedb.org/3/movie/${section}?language=en-US&page=1`)
      .then(response=>response.json())
      .then(data=>{
        console.log(data);
        const movieIds =data.results.map(movie=>movie.id);
        const moviesParam = encodeURIComponent(JSON.stringify(movieIds));
        window.location.href = `https://shashankbharadwaj27.github.io/FilmFlick/displaypage.html?section=${section}&movies=${moviesParam}`;
      })
      .catch(error => console.error('Error fetching movies:', error));
  }
}
    