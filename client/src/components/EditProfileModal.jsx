import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector,useDispatch } from "react-redux";
import { updateProfile } from "../features/userDataSlice";
import { getUserInfo } from "../features/authSlice";
const base = import.meta.env.VITE_API_BASE_URL;

const EditProfileModal = ({onClose}) => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [favourites, setFavourites] = useState([null, null, null, null]);
  const [searchQueries, setSearchQueries] = useState(["", "", "", ""]);
  const [searchResults, setSearchResults] = useState([[], [], [], []]);
  const [activeSearch, setActiveSearch] = useState([false, false, false, false]);
  const dispatch = useDispatch();
  
  const {user} = useSelector(state=>state.auth)
  console.log('hello')

  const rawUserFavourites = useSelector(state => state.userData.favourites);
  const userFavourites = Array.isArray(rawUserFavourites) ? rawUserFavourites : [];


  useEffect(() => {
      if (user) {
          setName(user.name || "");
          setBio(user.bio || "");
          setLocation(user.location || "");
          
          const favMap = Array(4).fill(null);
          userFavourites?.forEach((fav, idx) => {
              favMap[idx] = fav;
          });
          setFavourites(favMap);
      }
  }, [user]);

  // Debounced search effect for all 4 search inputs
  useEffect(() => {
    const timers = searchQueries.map((query, idx) => {
      if (!query.trim()) {
        // Clear results if query is empty
        setSearchResults((prev) => {
          const updated = [...prev];
          updated[idx] = [];
          return updated;
        });
        return null;
      }

      return setTimeout(async () => {
        try {
          const res = await axios.get(`${base}/movie/search/${query}`);
          const results = res.data.results || [];
          console.log(res)
          setSearchResults((prev) => {
            const updated = [...prev];
            updated[idx] = results;
            return updated;
          });
        } catch (err) {
          console.error("Search failed:", err);
        }
      }, 1000);
    });

    return () => {
      timers.forEach((t) => t && clearTimeout(t));
    };
  }, [searchQueries]);

  const handleSelectMovie = (index, movie) => {
    const updated = [...favourites];
    updated[index] = movie;
    setFavourites(updated);

    // Hide search dropdown and clear search query & results
    setActiveSearch((prev) => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });

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

  const handleSave = async(e) => {
    e.preventDefault();
    try{
        const profileData = {
          username : user.username,
          name,
          bio,
          location,
          favourites: favourites.map((f) => (f ? f.movie_id : null)),
        };
        await dispatch(updateProfile(profileData)).unwrap();
        dispatch(getUserInfo(user?.username));
        onClose();
        window.location.reload();
    } catch (err) {
    console.error("Failed to update:", err);
  }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Bio</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Your bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Favourites */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {favourites.map((fav, idx) => (
            <div
              key={idx}
              className="border border-gray-300 rounded p-3 flex flex-col gap-2"
            >
              <div className="font-semibold">Favourite Slot {idx + 1}</div>
              {fav ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{fav.title}</span>
                  <button
                    className="text-red-500 text-sm hover:underline"
                    onClick={() => handleRemove(idx)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    className="w-full border border-gray-200 px-2 py-1 rounded text-sm"
                    placeholder="Search movie"
                    value={searchQueries[idx]}
                    onChange={(e) => {
                      const updated = [...searchQueries];
                      updated[idx] = e.target.value;
                      setSearchQueries(updated);

                      const active = [...activeSearch];
                      active[idx] = true;
                      setActiveSearch(active);
                    }}
                    onFocus={() => {
                      const active = [...activeSearch];
                      active[idx] = true;
                      setActiveSearch(active);
                    }}
                    autoComplete="off"
                  />
                  {activeSearch[idx] && searchResults[idx]?.length > 0 && (
                    <ul className="mt-2 min-h-40 max-h-40 overflow-y-auto border border-gray-200 rounded bg-white z-10 relative">
                      {searchResults[idx].map((res) => (
                        <li
                          key={res.movie_id}
                          className="cursor-pointer text-sm hover:bg-gray-100 px-2 py-1"
                          onClick={() => handleSelectMovie(idx, res)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleSelectMovie(idx, res);
                            }
                          }}
                        >
                          {res.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose} 
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
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
