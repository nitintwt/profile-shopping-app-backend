import dotenv from 'dotenv'
import { app } from './app.js'
import connectDB from './db/index.js'
import { purchaseEmailWorker } from './controllers/email.controller.js'

dotenv.config({path:'./.env'})

connectDB()
.then(()=>{
  app.listen(process.env.PORT || 4000 , ()=>{
    console.log( `SERVER IS RUNNING AT PORT: ${process.env.PORT}`)
  })
})
.catch((error)=>{
  console.log("MONGODB CONNECTION FAILED !!!" , error)
})