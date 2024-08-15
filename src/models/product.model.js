import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    imageLink:{
      type:String,
      required:true
    },
    name:{
      type:String,
      required:true
    },
    price:{
      type:String,
      required:true
    },
    type:{
      type:String
    }
  },
  {
    timestamps:true
  }
)

export const Product = mongoose.model("Product" , productSchema)