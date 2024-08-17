import { User } from "../models/user.model.js";
import nodemailer from 'nodemailer';
import { ApiError } from '../utils/ApiError.js'
import { Worker } from "bullmq";
import dotenv from 'dotenv'

dotenv.config({
  path:'./.env'
})


const purchaseEmailWorker = new Worker("shipper-email-queue" , async (job)=>{
   const data = job.data
   try {
    const user = await User.findById(data.userId)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });
    const mailConfigs = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Shipper:Ordered Placed`,
      text: `Hello ${user.name}.You have succefully placed your order. Your order will reach at your address,${user?.address},within 1 week.`
    };

    transporter.sendMail(mailConfigs, function (error, info) {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent successfully:', info);
      }
    });
   } catch (error) {
    console.error('Job failed:', error);
   }
}, {
  connection: {
    host:process.env.AIVEN_HOST,
    port:process.env.AIVEN_PORT,
    username:process.env.AIVEN_USERNAME,
    password:process.env.AIVEN_PASSWORD ,
  },
  limiter: {
    max: 50,
    duration: 10 * 1000
  }
})

export {purchaseEmailWorker}