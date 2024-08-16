import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from '../utils/ApiResponse.js'
import { generateAccessandRefreshToken } from "../utils/generateAccessandRefreshToken.js"
import { Product } from "../models/product.model.js"
import { tryCatch } from "bullmq"

const registerUser= asyncHandler (async ( req , res)=>{
   const {name , email , password}= req.body

  if (!email.endsWith('@gmail.com')){
    return res.status(408).json(
      new ApiError(408 , "Enter a valid Email")
    )
  }

  if(password.length < 8){
    return res.status(407).json(
       new ApiError(407 , "Password should be atleast 8 character long ")
    )
  }

  // we are checking if email already exists or not
  const userExist = await User.findOne({email})

  if (userExist){
    return res.status(409).json(
      new ApiError(409 , "Email already exists")
    )
  }

  // saving user data into db
  const user = await User.create({ name , email , password})

  // checking if the user data saved in db successfully or not
  const userCreated = await User.findById(user?._id).select("-password")

  if(!userCreated){
    return res.status(500).json(
     new ApiError(500 , "Something went wrong while registering User. Please try again.")
    )
  }

  return res.status(201).json(
    new ApiResponse(200 , userCreated , "User registered Successfully")
  )
})

const loginUser =asyncHandler(async(req , res)=>{
  const {email , password}= req.body

  if (!email.endsWith('@gmail.com')){
    return res.status(408).json(
      new ApiError(408 , null ,"Enter a valid Email")
    )
  }

  const user = await User.findOne({email})

  // we are checking if user email already exists or not
  // if the email is not in db , means the user has not registered
  if(!user){
    return res.status(404).json(
      new ApiError(404 ,null , "User does not exists")
    )
  }

  const isPasswordValid = await user.isPasswordCorrect(password)
  if(!isPasswordValid){
    return res.status(401).json(
      new ApiError(401 , null, "Passoword incorrect")
    )
  }

  const {accessToken , refreshToken}= await generateAccessandRefreshToken(user._id)

  // loggedUser have user data , except password and refresh token. We don't want that response carry sensitive data
  const loggedUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly : true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken" , accessToken , options)
  .cookie("refreshToken" , refreshToken , options)
  .cookie("userData" , loggedUser)
  .json(
    new ApiResponse(200 ,loggedUser , "User logged in successfully")
  )
})

const logoutUser= asyncHandler (async (req , res)=>{
  const userId = req.body.userDbId
  await User.findByIdAndUpdate(userId , {$set:{refreshToken:undefined}}, {new:true})

  const options ={
    httpOnly:false,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("RefreshToken", options)
  .clearCookie("userData")
  .json(
    new ApiResponse(200 , "User logged out successfully")
  )

})

const placeOrder =asyncHandler  (async (req , res)=>{
  const {email , productId , address}= req.body

  if (!email.endsWith('@gmail.com')){
    return res.status(408).json(
      new ApiError(408 , null ,"Enter a valid Email")
    )
  }

  try {
    const user = await User.findOne({email})
    user.address= address
    user.productsPurchased = productId
    await user.save()
    return res.status(200).json(
      new ApiResponse(200 , "Your purchase was successfull")
    )
  } catch (error) {
    return res.status(500).json(
      new ApiError (500 , null , "Something went wrong while booking your product")
    )
  }
})

const addToCart =asyncHandler (async(req , res)=>{
  const {userId , productId}= req.body
  try {
    const user = await User.findById(userId)
    user.productsInCart.push(productId)
    await user.save()
    return res.status(200).json(
      new ApiResponse(200 , "Product added to cart successfully")
    )
  } catch (error) {
    return res.status(500).json(
      new ApiError(500 , null , "Something went wrong while adding product to cart")
    )
  }
})

const getPurchasedProducts = asyncHandler(async (req , res)=>{
  const email = req.query.email

  if (!email.endsWith('@gmail.com')){
    return res.status(408).json(
      new ApiError(408 , null ,"Enter a valid Email")
    )
  }

  const user = await User.findOne({email})
  try {
    return res.status(200).json(
      new ApiResponse(200 , user?.productsPurchased , "Fetched purchased products data successfully")
    )
  } catch (error) {
    return res.status(500).json(
      new ApiError(500 , null , "Something went wrong while fetching purchased products data")
    )
  }
})

const getCartProducts = asyncHandler(async (req , res)=>{
  const {userId} = req.query

  const user = await User.findById(userId)

  
  const getUniqueProducts = (products) => {
    // acc is an empty object , product is current value from products array
    const uniqueProductsMap = products.reduce((acc, product) => {
     // We add the product to the acc object using product._id as the key.
     //If the same product._id appears again, it will replace the previous one in the acc object. This keeps only the last occurrence of each product.
      acc[product._id] = product
      return acc
    }, {})
    // convert object to array
    return Object.values(uniqueProductsMap)
  }
  
  const uniqueProducts = getUniqueProducts(user.productsInCart)
  
  try {
    return res.status(200).json(
      new ApiResponse(200 , uniqueProducts , "Fetched cart products data successfully")
    )
  } catch (error) {
    return res.status(500).json(
      new ApiError(500 , null , "Something went wrong while fetching cart products data")
    )
  }
})

const checkProducInCart = asyncHandler (async (req , res)=>{
  const {productId , userId}= req.query

  const user = await User.findOne({_id:userId , productsInCart:{$in:[productId]}})
  if(user){
    return res.status(200).json(
      new ApiResponse (200 , true , "Product checking done")
    )
  } else {
    return res.status(200).json(
      new ApiResponse(200 , false , "Product checking done")
    )
  }
})

const countOfProductsInCart = asyncHandler (async (req , res)=>{
  const {userId , productId}= req.query

  try {
    const user = await User.findById(userId)
    const count = user.productsInCart.filter((id) => id.toString() === productId).length;
    return res.status(200).json(
      new ApiResponse(200 , count , "Product count fetched successfully")
    )
  } catch (error) {
    return res.status(500).json(
      new ApiError (500 , error , "Something went wrong while fetching product count")
    )
  }
})

const deleteProductFromCart =asyncHandler (async (req , res)=>{
  const {userId , productId}= req.query
  
  try {
    // $pull removes all instances of a value from an array
    await User.findByIdAndUpdate(userId , {$pull:{productsInCart:productId}})
    return res.status(200).json(
      new ApiResponse(200 , "Product removed from cart successfully")
    )
  } catch (error) {
    return res.status(500).json(
      new ApiError(500 , error , "Something went wrong while removing product from cart")
    )
  }
})

const cancelPurchase = asyncHandler  (async (req , res)=>{
  const {email , productId}= req.body
  try {
    await User.findOneAndUpdate({email}, {$pull:{productsPurchased:productId}})
    return res.status(200).json(
      new ApiResponse(200 , "Purchase cancelled successfully")
    )
  } catch (error) {
    return res.status(500).json(
      new ApiError(500, null , "Something went wrong cancelling purchase")
    )
  }
})

const getAllProducts = asyncHandler (async (req , res)=>{
  const products = await Product.find()

  res.status(200).json(
    new ApiResponse(200 , products , "Products fetched successfully")
  )
})

const getProductData = asyncHandler (async (req , res)=>{
  const productId = req.query.productId

  try {
    const product = await Product.findById(productId)
    return res.status(200).json(
      new ApiResponse(200 , product , "Product data fetched successfully")
    )
  } catch (error) {
    return res.status(500).json(
      new ApiError(500 , error , "Something went wrong while fetching product data")
    )
  }
})

const decreaseProductQuantity = asyncHandler (async (req , res)=>{
  const {userId , productId}= req.query
  try {
    const user = await User.findById(userId)

    // Find the index of the first occurrence of the productId in the array
    const index = user.productsInCart.indexOf(productId)

    if (index !== -1) {
      // Remove one occurrence of the productId using splice
      user.productsInCart.splice(index, 1)

      // Save the updated user document
      await user.save()

      return res.status(200).json(
        new ApiResponse(200, "Product quantity decreased successfully")
      )
    } 
  } catch (error) {
    return res.status(500).json(
      new ApiError (500 , error , "Something went wrong while decreasing product quantity")
    )
  }
})

export {registerUser , loginUser ,placeOrder , addToCart , deleteProductFromCart , cancelPurchase , getCartProducts , getPurchasedProducts , logoutUser , getAllProducts , getProductData , checkProducInCart , countOfProductsInCart , decreaseProductQuantity}