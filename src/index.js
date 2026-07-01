const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');

const { sendOtp } =
require('../service/authservice');


const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('../routes/auth');


const User = require('../models/Users');
const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.use(express.static('public'));


app.use(express.json());
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/api/cart', (req, res) => {
  res.render('cart');
});


app.get('/api/home', (req, res) => {
  res.render('home');
});

app.get('/api/profile', (req, res) => {
  res.render('profile');
});

app.get('/api/settings', (req, res) => {
  res.render('settings');
});

app.get('/api/menu', (req, res) => {
  res.render('menu');
});

app.get('/api/forgot', (req, res) => {
  res.render('forgot');
});

app.get('/api/login', (req, res) => {
  res.render('login');
});

app.get('/api/signup', (req, res) => {
  res.render('signup');
});

app.post('/api/signup', async (req, res) => {

  const data ={
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  }
  const existingUser = await User.findOne({ email: data.email });

  if(existingUser){
    return res.send(`
        <script>
            alert("User already exists 😒");
            window.location.href='/api/signup';
        </script>
    `);
}else{

  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  data.password = hashedPassword;

  const userdata = await User.insertMany(data);

  console.log(userdata);

  return res.redirect('/api/menu');
}
});

app.post('/api/login', async (req, res) => {
  try{
    const check = await User.findOne({ email: req.body.email });
    if(!check){
      return res.send(`
        <script>
            alert("User not found 😒");
            window.location.href='/api/login';
        </script>
    `);
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, check.password);

    if(!isPasswordValid){
      return res.send(`
        <script>
            alert("Invalid password 😒");
            window.location.href='/api/login';
        </script>
    `);
    }else{
      res.redirect('/api/menu');
    }
  }catch(err){
    return res.send(`
        <script>
            alert("User not found 😒");
            window.location.href='/api/login';
        </script>
    `);

  }
});

app.post('/api/forgot', async (req, res) => {

  try {

    const check =
    await User.findOne({
      email: req.body.email
    });

    if (!check) {

      return res.status(404).json({
        success:false,
        message:"You are not a registered member. Please register first"
      });

    }

    await sendOtp(req, res);

  }

  catch (err) {

    console.log(err);

    return res.status(500).json({
      success:false,
      message:"Something went wrong ❌"
    });

  }

});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});