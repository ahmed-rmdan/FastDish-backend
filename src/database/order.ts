import mongoose from "mongoose"
import {Schema} from 'mongoose'


const ordershema=new Schema({
   user:{type:Schema.Types.ObjectId,ref:'user'},
   state:String,
    meals:[
       {meal:{type:Schema.Types.ObjectId,ref:'meal'},quantity:Number}
    ],
    address:String,
    totalprice:Number,
    details:String,
    payment:String
},{ timestamps: true })

export const order=mongoose.model('order',ordershema)