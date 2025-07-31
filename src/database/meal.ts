import mongoose from "mongoose"
import {Schema} from 'mongoose'

const mealschema=new Schema({
    name:String,
    type:String,
    price:Number,
    ingredients:String,
    imgeurl:String
})

export const meal=mongoose.model('meal',mealschema)