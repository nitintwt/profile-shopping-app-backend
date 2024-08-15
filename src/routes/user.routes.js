import { Router } from "express";
import { addToCart, cancelPurchase, checkProducInCart, deleteProductFromCart, getAllProducts, getCartProducts, getProductData, getPurchasedProducts, loginUser, logoutUser, placeOrder, registerUser } from "../controllers/user.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)
userRouter.route("/purchase").post( verifyUser ,placeOrder)
userRouter.route("/addToCart").post(addToCart)
userRouter.route("/purchasedProducts").get(verifyUser ,getPurchasedProducts)
userRouter.route("/cartProducts").get(getCartProducts)
userRouter.route("/deleteProductFromCart").delete(deleteProductFromCart)
userRouter.route("/cancelPurchase").post(verifyUser ,cancelPurchase)
userRouter.route("/logout").post(logoutUser)
userRouter.route("/products").get(getAllProducts)
userRouter.route("/productData").get(getProductData)
userRouter.route("/checkProductInCart").get(checkProducInCart)


export default userRouter
