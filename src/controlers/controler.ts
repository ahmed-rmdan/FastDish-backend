import { Request, Response, NextFunction } from 'express';
import { user} from '../database/user';
import {meal} from '../database/meal'
import bcrypt from 'bcrypt'
import token from 'jsonwebtoken'
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { console } from 'inspector';
import { order } from '../database/order';
import Stripe from 'stripe';
import { ExpressValidator, validationResult } from 'express-validator';
import {io} from '../index'
import { asyncWrapProviders } from 'async_hooks';

type meal={_id:string,imgeurl:string,price:number,name:string,ingredients:string,type:string,quantity:number}
type signupform={  username:string,
    password:string,
    email:string,
    adress:string,
    telphone:number,confirmpassword:string}
type loginform={
  username:string,
    password:string
}


export const addproduct=(req:Request,res:Response,next:NextFunction)=>{
   const name:string= req.body.name
   const price:number=req.body.price
   const ingredients:string=req.body.ingredients
   const imgeurl:string=req.body.imgeurl
   const type:string=req.body.type
   const newmeal=new meal({
    name:name,price:price,ingredients:ingredients,imgeurl:imgeurl,type
   })
   newmeal.save().then(result=>{
    console.log(result)
     res.status(200).json({ message: 'Done' })
   }).catch(error=>{
    console.log(error)
   })
}
export const editproduct=(req:Request,res:Response,next:NextFunction)=>{
    const id=req.params.productid
   const name:string= req.body.name
   const priceinput:string=req.body.price
   const ingredients:string=req.body.ingredients
   const imgeurl:string=req.body.imgeurl
   const type:string=req.body.type
   console.log('')
   console.log(req.body)
 
   meal.findById(id).then(product=>{
   
    console.log(name!=undefined&&name!=='')
      console.log(product)
    if(product===null){
        return;
    }
    if(name!==undefined&&name!==""){
 product.name=name
    }
       if(priceinput!==undefined&&priceinput!=='')
    product.price=Number(priceinput)
   if(ingredients!==undefined&&ingredients!=='')
    product.ingredients=ingredients
 if(imgeurl!==undefined&&imgeurl!=='')
    product.imgeurl=imgeurl
 if(type!==undefined&&type!=='')
    product.type=type
 return product.save()
   }).then(result=>{
  res.status(200).json({ message: 'Done' })
   }).catch(err=>{
    console.log(err)
   })

}

export const getallproducts=(req:Request,res:Response,next:NextFunction)=>{
 const meals=meal.find().then(meals=>{
 res.status(201).json(meals)
 })
 

}
export const deleteproduct=(req:Request,res:Response,next:NextFunction)=>{
 const id=req.params.productid
 meal.findByIdAndDelete(id).then(result=>{
   res.status(200).json({message:'meal deleted'})
 }).catch(error=>{
   console.log(error)
 })
}


export const getselectproducts=(req:Request,res:Response,next:NextFunction)=>{
   const type=req.query.type
 const meals=meal.find({type:type}).then(meals=>{
 res.status(201).json(meals)
 }).catch(err=>{
   console.log(err)
 } 
 )

}

export const getsearchproducts=(req:Request,res:Response,next:NextFunction)=>{
   const search=req.query.search
 meal.find({name:{$regex:search,$options: "i" }}).then(meals=>{
 res.status(201).json(meals)
 }).catch(err=>{
   console.log(err)
 } 
 )

}




export const  creatnewuser= async (req:Request,res:Response,next:NextFunction)=>{
const userdata:signupform=req.body
if (!userdata.username||!userdata.password||!userdata.email){
 return res.status(400).json({ message: 'Username and password are required' });
}
const founduser=await user.findOne({username:userdata.username})
if(founduser){
  return res.status(400).json({ message: 'Username already exisits' });
}
const foundemail=await user.findOne({email:userdata.email})
if (foundemail){
  return res.status(400).json({ message: 'Email already exisits' });
}
const errors=validationResult(req)
console.log(errors)
if(!errors.isEmpty()){
  return res.status(400).json({ message: 'validation error' ,errors:errors});
}
const bcryptpass= await bcrypt.hash(userdata.password,12)
const newuser=await new user({username:userdata.username,password:bcryptpass,telphone:userdata
  .telphone,email:userdata.email,adress:userdata.adress}).save()
if(!newuser){
  return res.status(400).json({ message: 'somthing bad' });
}
const jwt=token.sign({userid:newuser._id.toString(),email:newuser.email},'veryverystrong')
  return res.status(200).json({ message: 'signup succed',token:jwt });
}




export const loginuser=async (req:Request,res:Response,next:NextFunction)=>{
const userdata:loginform=req.body
console.log(userdata)
if (!userdata.username||!userdata.password){
 return res.status(401).json({ message: 'Username and password are required' });
}
const founduser=await user.findOne({username:userdata.username})
if(!founduser){
  return res.status(401).json({message: 'username is not correct' });
}
const checkpass=await bcrypt.compare(userdata.password,founduser.password as string)
if(!checkpass){
    return res.status(401).json({message: 'password is not correct' });
}
const jwt=token.sign({userid:founduser._id.toString(),email:founduser.email},'veryverystrong')

  return res.status(200).json({message: 'signin succed',token:jwt });

 }


 export const addfavourite=async (req:Request,res:Response,next:NextFunction)=>{
const userid=req.userid
if(!userid){
  return res.status(401).json({message:'un authorized'})
}
const mealid=req.params.mealid
if(!mealid){
return res.status(400).json({message:'somethimg went wrong'})
}
const curuser=await user.findById(userid)
if(!curuser){
  return res.status(400).json({message:'somethimg went wrong'})
}
const isexisit=curuser.favourites.includes(new ObjectId(mealid))
if(isexisit){
   return res.status(406).json({message:'product already exixit'})
}
  curuser.favourites.push(new ObjectId(mealid))

  await curuser.save()
  console.log(curuser)
  const favourites=await curuser.populate('favourites')
const favouriteesitems=await favourites.favourites

return res.status(200).json({message:'favourite added',favourites:favouriteesitems})

 }


  export const getfavourites=async (req:Request,res:Response,next:NextFunction)=>{
const userid=req.userid
if(!userid){
  return res.status(401).json({message:'un authorized'})
}
const curuser=await user.findById(userid)
if(!curuser){
  return res.status(400).json({message:'somethimg went wrong'})
}
const favourites=await curuser.populate('favourites')
const favouriteesitems=await favourites.favourites
res.status(200).json(favouriteesitems)

 }
 
  export const deletefavourite=async (req:Request,res:Response,next:NextFunction)=>{
    console.log('staaaaart')
const userid=req.userid
console.log(userid)
if(!userid){
  return res.status(401).json({message:'un authorized'})
}
const mealid=req.params.mealid
console.log(mealid)
if(!mealid){
  return res.status(400).json({message:'somethimg went wrong'})
}
console.log(mealid)
await user.updateOne({_id:userid},{$pull:{favourites:new ObjectId(mealid)}})

const curuser=await user.findById(userid).populate('favourites')
const favouriteesitems=await curuser?.favourites
res.status(200).json({message:'favouritedeleted',favourites:favouriteesitems})
 }


export const  continuepayment= async (req:Request,res:Response,next:NextFunction)=>{
res.status(200).json({message:'continue'})

}
 

export const  createorder= async (req:Request,res:Response,next:NextFunction)=>{
const orderdata=req.body
if(!orderdata){
  res.status(400).json('bodyproblem')
}
const userid=req.userid
if(!userid){
   res.status(401).json('autorizastionproblem')
}

const orderitems:meal[]=orderdata.items

const oderemeals=orderitems.map(elm=>{
  return {meal:new ObjectId(elm._id),quantity:elm.quantity}
})

let details:string=''
orderitems.forEach((elm,i)=>{
  // if(orderitems.length===(i+1)) return;
 details=details+`${elm.quantity} X ${elm.name}` 
 if((i+1)<orderitems.length)
 details=details + ' + '
})


const neworder=await new order({user:new ObjectId(userid),state:'Preparing',totalprice:orderdata.totalprice,meals:oderemeals,details
  ,address:orderdata.address,payment:'On Delivery'}).save()
console.log(neworder._id)
await user.findByIdAndUpdate(
  userid,
  {
    $push: {
      orders: {
        $each: [neworder._id],
        $position: 0 
      }
    }
  },
  { new: true }
)


res.status(200).json({message:'createorder'})

}



export const  getorders= async (req:Request,res:Response,next:NextFunction)=>{
   type user={username:string,
    password:string,
    email:string,
    adress:string,
    telphone:number,_id:ObjectId, favourites:ObjectId[],orders:ObjectId[]}
 type order={address:string,details:string,totalprice:number,state:string,_id:string,username:string,
                          payment:string,meals:{quantity:string,meal:ObjectId}[],user:user     
                          }
const userid=req.userid
if(!userid){
 return   res.status(401).json('autorizastionproblem')
}

const populateuser=await user.findById(userid).populate('orders')

if(!populateuser){
  res.status(401).json('autorizastionproblem')
}
const userorders=populateuser?.orders as unknown as order[]
const filterorders=userorders.map(order=>{
  return {address:order.address,state:order.state,totalprice:order.totalprice,details:order.details,_id:order._id}
})


res.status(200).json({message:'getorder',data:filterorders,userid})


}

export const  welcomeadmin= async (req:Request,res:Response,next:NextFunction)=>{

res.status(200).json({message:'welcome admin'})


}



export const  getadminorders= async (req:Request,res:Response,next:NextFunction)=>{
console.log('sadasdadsadsa')
 type user={username:string,
    password:string,
    email:string,
    adress:string,
    telphone:number,_id:string, favourites:string[],orders:string[]}

    type order={user:user,address:string,details:string,totalprice:number,
      updatedAt:string,createdAt:string
      ,state:string,_id:string ,payment:string
      ,meals:{quantity:number,meal:string,_id:string}[]    
                          }


const allorders=await order.find().populate('user').sort({createdAt:-1}) as unknown as order[];


console.log(allorders)


if(!allorders) {
return  res.status(400).json('somthing bad happend')
} 

  


res.status(200).json({message:'getadminorders',data:allorders})

}



export const  deleteorder= async (req:Request,res:Response,next:NextFunction)=>{
const orderid=req.params.orderid
if(!orderid){
  res.status(400).json({message:'url problem'})
}
await order.findByIdAndDelete(orderid)
res.status(200).json({message:'order deleted'})

}


export const  updateorder= async (req:Request,res:Response,next:NextFunction)=>{

const updatevalue= req.body.update
const orderid=req.params.orderid

const curorder=await order.findById(orderid)
console.log(curorder)
if(!curorder){
  return res.status(400)
}
curorder!.state=updatevalue
await curorder.save()

if(!curorder.user){
  return res.status(404)
}
 type user={username:string,
    password:string,
    email:string,
    adress:string,
    telphone:number,_id:ObjectId, favourites:ObjectId[],orders:ObjectId[]}
    type order={address:string,details:string,totalprice:number,state:string,_id:string,username:string,
                          payment:string,meals:{quantity:string,meal:ObjectId}[],user:user     
                          }
const userorders=await order.find({user:curorder.user}).populate('user').sort({createdAt:-1})  as unknown as order[]
 
const filterorders=userorders.map(order=>{
  return {address:order.address,state:order.state,totalprice:order.totalprice,details:order.details,_id:order._id}
})

 io.to(curorder.user.toString()).emit("getorders", { orders: filterorders });
res.status(200).json({message:'order updated'})


}



export const  stripecheckout= async (req:Request,res:Response,next:NextFunction)=>{
const items:meal[]=req.body
if(!items){
  console.log('assasdsadsa')
  res.status(400).json({message:'missing items'})
}
console.log('letsgo')
const stripemeals=items.map(meal=>{
  return  {price_data:{
      currency:'USD',
      product_data:{name:`${meal.name}`},
      unit_amount:(meal.price/50)*100
    },quantity:meal.quantity}
})
const stripe=await new Stripe(process.env.sectetstripe as string)
const payment=await stripe.checkout.sessions.create({
  line_items: stripemeals
  ,
  mode:'payment',
  success_url:'https://fastdish.netlify.app/stripesucced',
  cancel_url:'https://fastdish.netlify.app/stripfailed'
})
const paymenturl= payment.url

res.status(200).json({url:paymenturl})

}

