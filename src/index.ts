import express from 'express'
import bodyparser from 'body-parser'
import mongoose from 'mongoose'
import {adminrouter} from './router/admin'
import { setheaders } from './middleaware'
import { userrouter } from './router/user'
import helmet from 'helmet'
import dotenv from 'dotenv'
import {Server} from 'socket.io'
import JWT, { JwtPayload } from 'jsonwebtoken'
dotenv.config();


const app=express()
app.use(helmet())

let io:Server;

app.use(setheaders)
app.use(bodyparser.json())
app.use('/admin',adminrouter)
app.use('/user',userrouter)

mongoose.connect(process.env.MONGO_URI as string).then(result=>{
const server=app.listen(Number(process.env.PORT) || 3000 )

     io = new Server(server, {
      cors: { origin: "*" },
    });

    io.on('connection', (socket) => {

        const token=socket.handshake.auth.token
      const dectoken=JWT.verify(token as string,'veryverystrong') as JwtPayload
     const userid:string=dectoken.userid
       socket.on('joinUserRoom',async ()=>{
       console.log(userid)
        socket.join(userid) 
        console.log(socket.rooms)
       })
      
   
          socket.on("disconnect", () => {
        console.log(" disconnected:", socket.id);
      });
    
    

    });
  })

export {io};





