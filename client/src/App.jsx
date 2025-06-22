import React, { useState } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Container from './components/Container';
import Header from './components/Header';
import { useSelector } from 'react-redux';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails'
import Loader from './components/Loader';
import PersonProfile from './pages/PersonProfile';
import UserProfile from './pages/UserProfile';
import Journal from './pages/Journal';
import Review from './pages/Review';
import SearchResults from './pages/SearchResults';
import LoggedInUserProfile from './pages/LoggedInUserProfile';
import Footer from './components/Footer';

function App() {

  const darkMode = useSelector((state) => state.darkMode.darkMode);

  return (
    <BrowserRouter>
        <div className={` transition ease-in-out delay-350 ${darkMode?'bg-[#1E1E1E] ':'bg-white '}`}>
          <Header/>
          <Container>
            <Routes>
              <Route path="/" element={<Home/>} />
              <Route path='/movie/:movieId' element={<MovieDetails/>} />
              <Route path='/user/login' element={<Login/>} />
              <Route path='/user/Signup' element={<Signup/>} />
              <Route path='/profile' element={<LoggedInUserProfile/>}/>
              <Route path='/search' element={<SearchResults/>} />
              <Route path='/person/:personId' element={<PersonProfile/>}/>
              <Route path='/:username/profile' element={<UserProfile/>}/>
              <Route path='/:username/:tab' element={<Journal/>}/>
              <Route path='/:username/review/:reviewId' element={<Review/>} />
            </Routes>
          </Container>
          <Footer/>
        </div>
    </BrowserRouter>
  );
}



export default App
