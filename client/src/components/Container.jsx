import React from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'


function Container({children}) {
  const darkMode = useSelector((state) => state.darkMode.darkMode);
  return (
    <main className={`container mt-4 mx-auto transition ease-in-out delay-350 p-4 w-full max-w-6xl h-full min-h-screen ${darkMode?'bg-[#2E3237]':'bg-[#AAABAD]'} rounded-xl  center`}>
      {children}
    </main>
  )
}

export default Container
