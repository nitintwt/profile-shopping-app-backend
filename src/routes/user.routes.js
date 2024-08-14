import { Router } from "express";
import { addToCart, cancelPurchase, deleteProductFromCart, getCartProducts, getPurchasedProducts, loginUser, placeOrder, registerUser } from "../controllers/user.controller.js";

const userRouter = Router()

userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)
userRouter.route("/purchase").post(placeOrder)
userRouter.route("/addToCart").post(addToCart)
userRouter.route("/purchasedProducts").get(getPurchasedProducts)
userRouter.route("/cartProducts").get(getCartProducts)
userRouter.route("/deleteProductFromCart").delete(deleteProductFromCart)
userRouter.route("/cancelPurchase").post(cancelPurchase)


export default userRouter
