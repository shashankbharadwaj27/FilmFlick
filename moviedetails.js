const urlParameters=new URLSearchParams(window.location.search);
const movieId=urlParameters.get('id');
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTUwM2Y3ZDc3Yzk5YzIxMDliMThkMDJkODhlMzZiOSIsInN1YiI6IjY1ZDlmOWRmNzJkODU1MDE2MmJiY2NhZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3v0fESxS9UBYaVMzt4u6GG-0mBUYBGKIAoQ0CvxWt2I'
    }
};

fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, options)
    .then(response => response.json())
    .then(data => { 
        console.log(data);
        const foreposter=data.poster_path;
        const movieId = data.id;
        const movieTitle=data.title;
        
        const spoken_languages=data.spoken_languages;
        const langCode = spoken_languages[0].english_name; 
        const lang=spoken_languages[langCode] || langCode;

        const date=data.release_date;
        year=date.split("-");

        const time=data.runtime;

        const overview=data.overview;

        const movieLink = `https://shashankbharadwaj27.github.io/FilmFlick/moviespage.html?id=${movieId}`;

        const container=document.querySelector(".moviecontainer");
        const details=container.querySelector(".movieDetails")

        const foreground=document.querySelector("#foregroundPoster");
        foreground.src = `https://image.tmdb.org/t/p/w500${foreposter}`;

        const movieName=document.querySelector("#movieName");
        movieName.innerHTML=`${movieTitle} . (${year[0]})\n`;

        const description=details.querySelector("#description");
        description.innerHTML=`${overview}`;

        const runtimeLang=details.querySelector("#runtimeLang");
        runtimeLang.innerHTML=`${time} minutes | ${lang}`
        
    })
    .catch(err => console.error(err));

document.addEventListener("DOMContentLoaded", function() {
    const options1 = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTUwM2Y3ZDc3Yzk5YzIxMDliMThkMDJkODhlMzZiOSIsInN1YiI6IjY1ZDlmOWRmNzJkODU1MDE2MmJiY2NhZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3v0fESxS9UBYaVMzt4u6GG-0mBUYBGKIAoQ0CvxWt2I'
        }
    };

    fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`, options1)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const castMembers = data.cast;
            const crewMembers=data.crew;
            const slides = [];
            const crewSlides=[]

            let director = document.getElementById('directorLink');
            for (let i = 0; i < crewMembers.length; i++) {
                if (crewMembers[i].job === 'Director') {
                    director.textContent+=` ${crewMembers[i].name}`;
                    director.href = "https://shashankbharadwaj27.github.io/FilmFlick//personProfile.html?id=" + encodeURIComponent(crewMembers[i].id);
                    break;
                }
            }

            castMembers.forEach(castMember => {
                if (castMember.profile_path !== null) {
                    const castSlide = document.createElement('div');
                    castSlide.classList.add('swiper-slide');
                            
                    const profileLink = document.createElement('a');
                    profileLink.href = "https://shashankbharadwaj27.github.io/FilmFlick//personProfile.html?id=" + encodeURIComponent(castMember.id);

                    const img = document.createElement('img');
                    img.src = 'https://image.tmdb.org/t/p/w500' + castMember.profile_path;
                    profileLink.appendChild(img);

                    const name = document.createElement('p');
                    name.textContent = castMember.name;

                    const role=document.createElement('p');
                    role.textContent=`(${castMember.character})`;


                    castSlide.appendChild(profileLink);
                    castSlide.appendChild(name);
                    castSlide.appendChild(role);

                    slides.push(castSlide);
                }
            });

            const swiperWrapper = document.querySelector('.cast .swiper-wrapper');
            slides.forEach(slide => swiperWrapper.appendChild(slide));

            const swiper = new Swiper('.cast .swiper', {
                slidesPerView: 5,
                centeredSlides: false,
                spaceBetween: 20,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                }
            });
            
            crewMembers.forEach(crewMember => {
                if (crewMember.profile_path !== null) {
                    const crewSlide = document.createElement('div');
                    crewSlide.classList.add('swiper-slide');

                    const profileLink = document.createElement('a');
                    profileLink.href = "https://shashankbharadwaj27.github.io/FilmFlick//personProfile.html?id=" + encodeURIComponent(crewMember.id);

                    const img = document.createElement('img');
                    img.src = 'https://image.tmdb.org/t/p/w500' + crewMember.profile_path;
                    profileLink.appendChild(img);

                    const name = document.createElement('p');
                    name.textContent = crewMember.name;

                    const role=document.createElement('p');
                    role.textContent=`(${crewMember.job})`;

                    crewSlide.appendChild(profileLink);
                    crewSlide.appendChild(name);
                    crewSlide.appendChild(role);

                    crewSlides.push(crewSlide);
                }
            });

            const crewSwiperWrapper = document.querySelector('.crew .swiper-wrapper');
            crewSlides.forEach(slide => crewSwiperWrapper.appendChild(slide));

            const crewSwiper = new Swiper('.crew .swiper', {
                slidesPerView: 5,
                centeredSlides: false,
                spaceBetween: 20,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                }
            });
        })

        .catch(error => console.error('Error:', error));
});