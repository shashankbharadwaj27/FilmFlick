import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Scrollbar, A11y } from 'swiper/modules';
import {Link} from 'react-router-dom'
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function MovieSwiper({ movies }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardHeight = windowWidth <= 480 ? '140px' : '300px';
  const cardWidth = windowWidth <= 480 ? '70px' : '200px';

  return (
    <div>
      <Swiper
        direction={'horizontal'}
        slidesPerView={4}
        spaceBetween={20}
        mousewheel={{ forceToAxis: true }}
        modules={[Mousewheel, Scrollbar, A11y]}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 4 },
        }}
        // No need for navigation here
      >
        {movies.map((movie) => (
          <SwiperSlide
            key={movie.movie_id}
            className="hover:brightness-110 hover:-translate-y-1 transition-all ease-in-out delay-100"
          >
            <Link to={`/movie/${movie.movie_id}`}
              className="relative rounded-md "
              style={{ height: cardHeight, width: cardWidth }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                alt={movie.title}
                className="z-0 h-full w-full rounded-md object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
              {windowWidth > 480 && (
                <div className="absolute bottom-4 left-4 text-left">
                  <h1 className="text-lg font-semibold text-white line-clamp-1">
                    {movie.title}
                  </h1>
                  <p className="mt-2 text-sm text-gray-300 line-clamp-3">
                    {movie.description}
                  </p>
                </div>
              )}
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <style>
        {`
          .swiper-button-next, .swiper-button-prev {
            color: black; /* Default color */
          }
          .dark .swiper-button-next, .dark .swiper-button-prev {
            color: white; /* Dark mode color */
          }
        `}
      </style>
    </div>
    
  );
}

export default MovieSwiper;
