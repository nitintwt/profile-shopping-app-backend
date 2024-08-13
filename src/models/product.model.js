import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    mageLink:{
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
    }
  },
  {
    timestamps:true
  }
)

export const Product = mongoose.model("Product" , productSchema)