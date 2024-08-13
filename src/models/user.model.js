import mongoose, { mongo, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name:{
      type: String,
      required:true,
      lowercase:true,
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

export const User = mongoose.model("User" , userSchema)