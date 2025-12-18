import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../features/userDataSlice";
import { fetchUserInfo } from "../features/authSlice";
import alternatePoster from '../assets/poster_alternate.png'
const base = import.meta.env.VITE_API_BASE_URL;

const EditProfileModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [favourites, setFavourites] = useState([null, null, null, null, null]);
  const [searchQueries, setSearchQueries] = useState(["", "", "", "", ""]);
  const [searchResults, setSearchResults] = useState([[], [], [], [], []]);
  const [searchLoading, setSearchLoading] = useState([false, false, false, false, false]);
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const darkMode = useSelector((state) => state.darkMode.darkMode);

  const rawUserFavourites = useSelector((state) => state.userData.favourites);
  const userFavourites = Array.isArray(rawUserFavourites) ? rawUserFavourites : [];

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setLocation(user.location || "");

      const favMap = Array(5).fill(null);
      userFavourites?.forEach((fav, idx) => {
        favMap[idx] = fav;
      });
      setFavourites(favMap);
    }
  }, [user]);

  const handleSearch = async (index) => {
    const query = searchQueries[index].trim();
    if (!query) return;

    // Set loading state for this slot
    setSearchLoading((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });

    try {
      const res = await axios.get(`${base}/movie/search/${query}`);
      const results = Array.isArray(res?.data) ? res.data : [];
      setSearchResults((prev) => {
        const updated = [...prev];
        updated[index] = results;
        return updated;
      });
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults((prev) => {
        const updated = [...prev];
        updated[index] = [];
        return updated;
      });
    } finally {
      setSearchLoading((prev) => {
        const updated = [...prev];
        updated[index] = false;
        return updated;
      });
    }
  };

  const handleSelectMovie = (index, movie) => {
    const updated = [...favourites];
    updated[index] = movie;
    setFavourites(updated);

    // Clear search query & results
    setSearchQueries((prev) => {
      const updated = [...prev];
      updated[index] = "";
      return updated;
    });

    setSearchResults((prev) => {
      const updated = [...prev];
      updated[index] = [];
      return updated;
    });
  };

  const handleRemove = (index) => {
    const updated = [...favourites];
    updated[index] = null;
    setFavourites(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const profileData = {
        username: user.username,
        name,
        bio,
        location,
        favourites: favourites.map((f) => (f ? f.id : null)),
      };
      await dispatch(updateProfile(profileData)).unwrap();
      dispatch(fetchUserInfo(user?.username));
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 ${
        darkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-gray-900'
      }`}>
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            className={`w-full border rounded px-3 py-2 ${
              darkMode ? 'bg-[#2e3237] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Bio</label>
          <textarea
            className={`w-full border rounded px-3 py-2 ${
              darkMode ? 'bg-[#2e3237] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Your bio"
            value={bio}
            rows={3}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            className={`w-full border rounded px-3 py-2 ${
              darkMode ? 'bg-[#2e3237] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Favourites */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Favourite Movies (5 slots)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favourites.map((fav, idx) => (
              <div
                key={idx}
                className={`border rounded p-3 flex flex-col gap-2 ${
                  darkMode ? 'border-gray-600 bg-[#2e3237]' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="font-semibold text-sm">Slot {idx + 1}</div>
                {fav ? (
                  <div className="flex items-start gap-2">
                    <img
                      src={fav.poster_path ? `https://image.tmdb.org/t/p/w92${fav.poster_path}` : alternatePoster}
                      alt={fav.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{fav.title}</span>
                      <button
                        className="block text-red-500 text-xs hover:underline mt-1"
                        onClick={() => handleRemove(idx)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className={`flex-1 border rounded px-2 py-1 text-sm ${
                          darkMode ? 'bg-[#1E1E1E] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Search movie"
                        value={searchQueries[idx]}
                        onChange={(e) => {
                          const updated = [...searchQueries];
                          updated[idx] = e.target.value;
                          setSearchQueries(updated);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch(idx);
                          }
                        }}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => handleSearch(idx)}
                        disabled={searchLoading[idx]}
                        className={`px-3 py-1 text-sm rounded ${
                          darkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        } disabled:opacity-50`}
                      >
                        {searchLoading[idx] ? '...' : 'Search'}
                      </button>
                    </div>
                    {searchResults[idx]?.length > 0 && (
                      <ul className={`mt-2 max-h-48 overflow-y-auto border rounded ${
                        darkMode ? 'border-gray-600 bg-[#1E1E1E]' : 'border-gray-300 bg-white'
                      }`}>
                        {searchResults[idx].map((res) => (
                          <li
                            key={res.id}
                            className={`cursor-pointer text-sm px-2 py-2 flex items-center gap-2 ${
                              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                            onClick={() => handleSelectMovie(idx, res)}
                          >
                            <img
                              src={res.poster_path ? `https://image.tmdb.org/t/p/w92${res.poster_path}` : alternatePoster}
                              alt={res.title}
                              className="w-8 h-12 object-cover rounded"
                            />
                            <span>{res.title}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
          <button
            onClick={onClose}
            className={`px-4 py-2 border rounded ${
              darkMode 
                ? 'border-gray-600 hover:bg-gray-700 text-white' 
                : 'border-gray-300 hover:bg-gray-100 text-gray-900'
            }`}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;