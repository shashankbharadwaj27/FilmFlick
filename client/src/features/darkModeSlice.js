import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  darkMode: localStorage.getItem('darkMode') === 'true'
};

const darkModeSlice = createSlice({
  name: "darkMode",
  initialState,
  reducers: {
    setDarkMode: (state) => {
      state.darkMode = true;
      localStorage.setItem('darkMode', 'true');
    },
    setLightMode: (state) => {
      state.darkMode = false;
      localStorage.setItem('darkMode', 'false');
    }
  }
});

export const { setDarkMode, setLightMode } = darkModeSlice.actions;

export default darkModeSlice.reducer;
