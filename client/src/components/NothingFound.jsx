import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const movieQuotes = [
  "No movies found. As Rick said in Casablanca, 'We'll always have Paris' — but maybe not this title.",
  "Just like Inception, this result is a dream within a dream — and there's nothing here.",
  "No results yet — maybe try a different genre? Even The Godfather started with a search for justice.",
  "Oops! No hits. This search might be more mysterious than The Prestige.",
  "It seems this film hasn't been cast yet. Try again — after all, life finds a way — Jurassic Park.",
];

const randomQuote = movieQuotes[Math.floor(Math.random() * movieQuotes.length)];


function NothingFound({ message = "No users found", showBackLink = true }) {
  const darkMode = useSelector((state) => state.darkMode.darkMode);

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      {/* Optional image or icon */}
      {/* <FiUserX className="text-6xl mb-4 text-gray-400" /> */}
      {/* <img src={image} alt="No users" className="w-48 h-48 mb-4" /> */}

      <h2 className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-black"}`}>
        {message}
      </h2>
      <p className={`text-sm mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        {randomQuote}
      </p>

      {showBackLink && (
        <Link
          to="/"
          className="text-blue-600 hover:underline text-sm font-medium transition duration-150"
        >
          Back to Home
        </Link>
      )}
    </div>
  );
}

export default NothingFound;
