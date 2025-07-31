import express from 'express'
import { addproduct,getallproducts,editproduct ,deleteproduct,getselectproducts,getsearchproducts,welcomeadmin,loginuser,getadminorders,deleteorder,updateorder } from '../controlers/controler'
import { isauth,isadmin } from '../middleaware'

const router=express.Router()


router.post('/signin',loginuser)
router.post('/isadmin',isauth,isadmin,welcomeadmin)
router.post('/addproduct',addproduct)
router.get('/products',getallproducts)
router.post('/editproduct/:productid',editproduct)
router.delete('/deleteproduct/:productid',deleteproduct)
router.get('/selectproducts',getselectproducts)
router.get('/getsearchproducts',getsearchproducts)
router.get('/getadminorders',isauth,isadmin,getadminorders)
router.delete('/deleteorder/:orderid',isauth,isadmin,deleteorder)
router.post('/updateorder/:orderid',isauth,isadmin,updateorder)
export const adminrouter=router
