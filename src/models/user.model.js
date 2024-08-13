import mongoose, { mongo, Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
  {
    name:{
      type: String,
      required:true,
      trim:true
    },
    email:{
      type: String,
      required:true,
    },
    password:{
      type:String,
      required:true
    },
    refreshToken:{
      type:String,
      required:true
    },
    address:{
      type:String
    },
    productsPurchased:[
      {
        type: Schema.Types.ObjectId,
        ref:"Product"
      }
    ],
    productsInCart:[
      {
        type: Schema.Types.ObjectId,
        ref:"Product"
      }
    ]
  },
  {
    timestamps:true
  }
)

// encrypting user password just before saving it in db
userSchema.pre("save" , async function(next){
  if(!this.isModified("password")) return next()  // if the passoword is not modified , save directly without encrypting

  this.password = await bcrypt.hash(this.password , 10)  //password encrypted
  next() 
})

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password , this.password)
}

userSchema.methods.generateAccessToken =  function (){
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken =  function(){
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User" , userSchema)