import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import moviesRouter from './routes/movieRoute.js';
import userRoute from './routes/userRoute.js';
import cookieParser from 'cookie-parser';
import castRoute from './routes/castRoute.js'
import reviewRoute from './routes/reviewRoute.js';
import cors from 'cors';
const PORT=process.env.PORT; 
const app=express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/',async (req,res)=>res.send('WELCOME TO FILMFLICK'))
app.use('/api/movie',moviesRouter);
app.use('/api/person',castRoute);
app.use('/api/user',userRoute); 
app.use('/api/review',reviewRoute);


app.listen(PORT,()=>console.log(`server started at  http://localhost:${PORT}`));  