import {configureStore} from '@reduxjs/toolkit';
import darkModeReducer from '../features/darkModeSlice';
import moviesSliceReducer from '../features/moviesSlice';
import reviewSlice from '../features/reviewSlice';
import authSliceReducer from '../features/authSlice';
import targetUserSlice from '../features/targetUserSlice';
import socialSliceReducer from '../features/socialSlice';
import userDataReducer from '../features/userDataSlice'

const store = configureStore({
    reducer:{
        darkMode:darkModeReducer,
        movies:moviesSliceReducer,
        review:reviewSlice,
        auth:authSliceReducer,
        targetUser:targetUserSlice,
        social:socialSliceReducer,
        userData:userDataReducer
    }
})

export default store;