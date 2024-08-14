import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from '../utils/ApiResponse.js'
import { generateAccessandRefreshToken } from "../utils/generateAccessandRefreshToken.js"

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
  .json(
    new ApiResponse(200 ,loggedUser , "User logged in successfully")
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
  const {email , productId}= req.body
  try {
    const user = await User.findOne({email})
    user.productsInCart= productId
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
  const email = req.query.email

  if (!email.endsWith('@gmail.com')){
    return res.status(408).json(
      new ApiError(408 , null ,"Enter a valid Email")
    )
  }

  const user = await User.findOne({email})
  try {
    return res.status(200).json(
      new ApiResponse(200 , user?.productsInCart , "Fetched cart products data successfully")
    )
  } catch (error) {
    return res.status(500).json(
      new ApiError(500 , null , "Something went wrong while fetching cart products data")
    )
  }
})

const deleteProductFromCart =asyncHandler (async (req , res)=>{
  const {email , productId}= req.body

  if (!email.endsWith('@gmail.com')){
    return res.status(408).json(
      new ApiError(408 , null ,"Enter a valid Email")
    )
  }
  try {
    // $pull removes all instances of a value from an array
    await User.findOneAndUpdate({email} , {$pull:{productsInCart:productId}})
    return res.status(200).json(
      new ApiResponse(200 , "Product removed from cart successfully")
    )
  } catch (error) {
    return res.status(500).json(
      new ApiError(500 , null , "Something went wrong while removing product from cart")
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

export {registerUser , loginUser ,placeOrder , addToCart , deleteProductFromCart , cancelPurchase , getCartProducts , getPurchasedProducts}