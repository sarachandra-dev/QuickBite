const {Router} = require('express');
const router = Router();

const { sendOtp } =
require('../service/authservice');

const emailRegex =
/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

router.post("/otp/send",(req,res)=>{
    const email = req.body.email;

    if(!emailRegex.test(email)){
        return res.status(400).json({ error: 'Invalid email address' });
    }

    sendOtp(req,res);
});

module.exports = router;
