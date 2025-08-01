import express from 'express'
import bodyparser from 'body-parser'
import mongoose from 'mongoose'
import {adminrouter} from './router/admin'
import { setheaders } from './middleaware'
import { userrouter } from './router/user'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config();


const app=express()
app.use(helmet())



app.use(setheaders)
app.use(bodyparser.json())
app.use('/admin',adminrouter)
app.use('/user',userrouter)

mongoose.connect(process.env.MONGO_URI as string).then(result=>{
app.listen(Number(process.env.PORT) || 3000 )
})



