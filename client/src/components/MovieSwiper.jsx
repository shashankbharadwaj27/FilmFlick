import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, A11y } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Memoized movie card
const MovieCard = React.memo(({ movie, isMobile }) => (
  <Link
    to={`/movie/${movie.id}`}
    className="relative rounded-md overflow-hidden group block h-full w-full"
    aria-label={`View ${movie.title}`}
  >
    <img
      src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
      alt={movie.title}
      className="h-full w-full object-cover group-hover:brightness-110 transition-brightness duration-200"
      loading="lazy"
      decoding="async"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
    
    {!isMobile && (
      <div className="absolute bottom-4 left-4 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <h3 className="text-lg font-semibold text-white line-clamp-1">{movie.title}</h3>
        {movie.overview && (
          <p className="mt-2 text-sm text-gray-200 line-clamp-3">{movie.overview}</p>
        )}
      </div>
    )}
  </Link>
));
MovieCard.displayName = 'MovieCard';

const MovieSwiper = React.memo(({ movies = [] }) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  // Debounced resize handler
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Memoize breakpoint configuration
  const breakpoints = useMemo(() => ({
    320: { slidesPerView: 1, spaceBetween: 12 },
    480: { slidesPerView: 2, spaceBetween: 12 },
    768: { slidesPerView: 3, spaceBetween: 16 },
    1024: { slidesPerView: 4, spaceBetween: 20 },
    1280: { slidesPerView: 5, spaceBetween: 20 },
  }), []);

  const isMobile = useMemo(() => windowWidth <= 480, [windowWidth]);

  if (!movies || movies.length === 0) {
    return (
      <div className="text-gray-500 py-8">
        No movies available.
      </div>
    );
  }

  return (
    <Swiper
      modules={[Mousewheel, A11y]}
      direction="horizontal"
      spaceBetween={20}
      mousewheel={{ forceToAxis: true }}
      breakpoints={breakpoints}
      grabCursor
      a11y={{
        enabled: true,
        notificationClass: 'swiper-notification',
        containerMessage: 'Carousel',
        containerRoleDescriptionMessage: 'carousel',
        itemRoleDescriptionMessage: 'slide',
        slideRole: 'group',
      }}
      className="rounded-lg"
    >
      {movies.map((movie) => (
        <SwiperSlide
          key={movie.id}
          className="rounded-md overflow-hidden"
          style={{ height: '300px' }}
        >
          <MovieCard movie={movie} isMobile={isMobile} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
});
MovieSwiper.displayName = 'MovieSwiper';

export default MovieSwiper;