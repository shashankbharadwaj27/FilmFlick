import { useEffect, useRef } from "react";
import axios from "axios";

const useDebouncedSearch = (queries, callback, delay = 500) => {
  const timeouts = useRef([]);

  useEffect(() => {
    // Clear previous timeouts
    timeouts.current.forEach((t) => clearTimeout(t));

    queries.forEach((query, index) => {
      if (!query.trim()) {
        callback(index, []); // Empty query: clear results
        return;
      }

      timeouts.current[index] = setTimeout(async () => {
        try {
          const base = import.meta.env.VITE_API_BASE_URL;
          const res = await axios.get(`${base}/movie/search/${query}`);
          callback(index, res.data || []);
        } catch (err) {
          console.error("Search error:", err);
          callback(index, []);
        }
      }, delay);
    });

    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, [queries, delay, callback]);
};

export default useDebouncedSearch;
