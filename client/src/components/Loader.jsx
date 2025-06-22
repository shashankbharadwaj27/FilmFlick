import React from 'react';
import '../App.css';
import { useSelector } from 'react-redux';

const Loader = () => {
  const darkMode = useSelector(state => state.darkMode.darkMode);

  return (
    <div className={`flex flex-col items-center justify-evenly h-screen min-h-[200px] `}>
      <div className= {` shapes ${darkMode?'dark':''}`}></div>
    </div>
  );
};

export default Loader;

