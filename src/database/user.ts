import mongoose from "mongoose"
import {Schema} from 'mongoose'


const userschema=new Schema({
    username:String,
    password:String,
    email:String,
    adress:String, 
    telphone:Number,
    orders:[
      {type:Schema.Types.ObjectId,ref:'order'}
    ],
    favourites:[
      {type:Schema.Types.ObjectId,ref:'meal'} 
    ]
})

export const user=mongoose.model('user',userschema)