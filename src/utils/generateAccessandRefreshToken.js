import { User } from "../models/user.model.js"
import { ApiError } from "./ApiError.js"

export const generateAccessandRefreshToken = async (userDbId)=>{
   try {
    const user = await User.findById(userDbId)

    // generating and access and refresh token using the method we have created in the user schema file
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    // saving the refresh token in db
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave:false})
    return {accessToken , refreshToken}
   } catch (error) {
    return resizeBy.status(500).json(
      new ApiError(500 , "Something went wrong while generating access and refresh token")
    )
   }
}