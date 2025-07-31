import { Request, Response, NextFunction } from 'express';
import token from 'jsonwebtoken'
import { JwtPayload } from 'jsonwebtoken';
import { user } from './database/user';
export const setheaders=(req:Request,res:Response,next:NextFunction)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,PUT,PATCH')
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')
    if (req.method === 'OPTIONS') {
    return res.sendStatus(200); 
  }
    next()
}


export const isauth=(req:Request,res:Response,next:NextFunction)=>{
const authheader=req.get('Authorization')
if(!authheader){
  return res.status(401).json({message:'not loggedin'})
}
const tokenheader=authheader?.split(' ')[1]
try{
const dectoken=token.verify(tokenheader as string,'veryverystrong') as JwtPayload
req.userid=dectoken.userid
}catch(error){
return res.status(401).json({message:'not loggedin'})
}



next()
}

export const  isadmin= async (req:Request,res:Response,next:NextFunction)=>{

  const userid=req.userid
  console.log(userid)
if(!userid){
  return res.status(401).json({message:'somethimg went wrong'})
}
const curuser=await user.findById(userid)
if(!curuser){
  return res.status(400).json({message:'somethimg went wrong'})
}
const useruser=curuser.username
if(useruser==='admin'){
return next()
}

 return res.status(406).json({message:'you are not the admin'})

}