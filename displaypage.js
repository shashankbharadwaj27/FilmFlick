urlParams=new URLSearchParams(window.location.search);
        section=urlParams.get('section');
        var moviesParam = urlParams.get('movies');


        // Converting the moviesParam string back to an array of movie IDs
        var movieIds = JSON.parse(decodeURIComponent(moviesParam));
        console.log(movieIds)
        container=document.querySelector('.container');
        heading=document.querySelector('#heading');
        if(section==='popular'){
            heading.textContent='Trending';
          }
          else if(section='Top-rated'){
            heading.textContent='Top rated';
          }
          else{
            heading.textContent='Now showing';
          }

        options3 = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTUwM2Y3ZDc3Yzk5YzIxMDliMThkMDJkODhlMzZiOSIsInN1YiI6IjY1ZDlmOWRmNzJkODU1MDE2MmJiY2NhZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3v0fESxS9UBYaVMzt4u6GG-0mBUYBGKIAoQ0CvxWt2I'
            }
        };
        movieIds.forEach(movieId=>{

            fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,options3)
            .then(response=>response.json())
            .then(data=>{
                console.log(data);
                movieSlide=document.createElement('div');
                movieSlide.classList.add('movieSlide');

                movieLink=`https://shashankbharadwaj27.github.io/FilmFlick/movieDetails.html?id=${movieId}`;
                var poster=document.createElement('a');
                poster.href=movieLink;
                var img=document.createElement('img')
                img.src='https://image.tmdb.org/t/p/w500'+data.backdrop_path;
                poster.appendChild(img);
                movieSlide.appendChild(poster);

                var name=document.createElement('p');
                name.textContent=data.title;
                movieSlide.appendChild(name);

                container.appendChild(movieSlide);
            })
        })