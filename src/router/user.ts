import express from 'express'
import { creatnewuser,loginuser,addfavourite,getfavourites,deletefavourite,continuepayment,createorder,getorders,stripecheckout} from '../controlers/controler'
import { isauth } from '../middleaware'
import { body } from 'express-validator'
const router=express.Router()

router.post('/signup',[body('username').trim().isEmpty().isLength({min:5})],creatnewuser)
router.post('/signin',loginuser)
router.post('/addfavourite/:mealid',isauth,addfavourite)
router.get('/getfavourites',isauth,getfavourites)
router.post('/deletefavourite/:mealid',isauth,deletefavourite)
router.get('/continuepayment',isauth,continuepayment)
router.post('/createorder',isauth,createorder)
router.get('/getorders',isauth,getorders)
router.post('/stripecheckout',isauth,stripecheckout)


export const userrouter=router
