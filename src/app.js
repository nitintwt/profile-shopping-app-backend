import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
  origin:process.env.CORS_ORIGIN,   // // kon se origin pe alow ka rahe hai 
  credentials:true,
}))

app.use(express.json({limit:"16kb"})) // we are limiting the json data which can come from frontend
app.use(express.urlencoded({limit:"16kb"})) // we are limiting the data that can come from url
app.use(cookieParser()) // to do CRUD operation on user browser cookies

app.get("/" , (req , res)=>{
  res.send("Server is running")
})

export {app}
