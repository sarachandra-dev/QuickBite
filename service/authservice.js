const { response } = require('express');
const User = require('../src/config');
const dotenv = require('dotenv');
dotenv.config();



const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }

});



async function sendEmail(email, otp){

    try{

        const info =
        await transporter.sendMail({

            from: process.env.EMAIL,

            to: email,

            subject: 'Your OTP',

            html: `
            <p>Your OTP is:
            <b>${otp}</b></p>

            <p>
            This OTP is valid for 30 minutes.
            </p>
            `
        });

        console.log("OTP SENT");
        console.log(info.response);

    }

    catch(error){

        console.log(error);
    }
}


const sendOtp = async (req, res) => {

    const { email } = req.body;

    try {

        if(!email){

            return res.status(400).json({
                success:false,
                message: "Email is required"
            });
        }

        const emailRegex =
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if(!emailRegex.test(email)){

            return res.status(400).json({
                success:false,
                message: "Invalid"
            });
        }

        const user =
        await User.findOne({ email });

        const currentTimestamp =
        parseInt(Date.now() / 1000);

        if(
            user &&
            user.otpExpires &&
            user.otpExpires > currentTimestamp
        ){

            return res.status(400).json({
                success:false,
                message:"OTP already sent"
            });

        }

        const otp =
        Math.floor(1000 + Math.random() * 9000);

        await sendEmail(email, otp);

        if(user){

            user.otp = otp;

            user.otpExpires =
            currentTimestamp + 1800;

            await user.save();

        }

        else{

            await User.create({

                email,

                otp,

                otpExpires:
                currentTimestamp + 1800,

                createdAt:
                currentTimestamp,

                updatedAt:
                currentTimestamp
            });
        }

        res.status(200).json({
        success:true,
        message:"OTP sent successfully ✅"
        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({
            success:false,
            message:"Failed to send OTP"
        });
    }
};

module.exports = {sendOtp};