// passwordReset
// mongodb+srv://passwordReset:passwordReset@passwordreset.wm93n9s.mongodb.net/

module.exports = router;
var express = require('express');
const mongoose = require('mongoose')
const nodemailer = require('nodemailer');
var router = express.Router();
const { dburl } = require('./../Config/dbConfig')
const { userModel } = require('./../Schema/user')
const { hashPassword, hashCompare, createToken, decodeToken, validate, roleAdmin } = require('./../Auth/auth');
const { hash } = require('bcryptjs');


mongoose.connect(dburl)

let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: "pmverifiy@gmail.com",
    pass: "ecihfzsbaqqfhczz",
  },
})

const sendMail = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    // console.log('Mail sent successfully')
  } catch (error) {
    console.log(error)
  }
}

// creating user details
router.post('/signup', async (req, res) => {
  // console.log('called API')
  try {
    // console.log('called try block')
    req.body.email = (req.body.email).toLowerCase()
    let user = await userModel.findOne({ email: req.body.email })
    // console.log(user)
    if (!user) {
      req.body.password = await hashPassword(req.body.password)
      req.body.email = (req.body.email).toLowerCase()
      // console.log(req.body.email)
      await userModel.create(req.body)
      res.status(200).send({ message: 'User details successfully created' })
    }
    else {
      res.status(400).send({ message: `User with ${req.body.email} already exists` })
    }
  }
  catch (error) {
    // console.log(error)
    res.status(500).send({ message: "Internal Server Error", error })
  }
});

//get all user details
router.get('/all', async (req, res) => {
  try {
    let user = await userModel.find()
    res.status(200).send({ data: user })
  }
  catch (err) {
    // console.log(error)
    res.status(500).send({ message: "Internal Server Error", error })
  }
})

//login 
router.post('/login', async (req, res) => {
  try {
    req.body.email = (req.body.email).toLowerCase()
    let user = await userModel.findOne({ email: req.body.email })
    console.log(req.body.password)
    console.log(user.password)
    if (user) {
      // if(req.body.password===user.password)
      if (await hashCompare(req.body.password, user.password)) {
        //creating a token
        let token = await createToken({
          name: user.name,
          email: user.email,
        })
        res.status(200).send({ message: 'login successfully', token })
      }
      else {
        res.status(400).send({ message: `Enter vaild credentials` })
      }
    }
    else {
      res.status(400).send({ message: `User with ${req.body.email} does not exists` })
    }
  }
  catch (error) {
    // console.log(error)
    res.status(500).send({ message: "Internal Server Error", error })
  }
})

//send email to verify
router.put('/sendEmail/:id', async (req, res) => {
  try {
    let x = (Math.floor((Math.random() * 1000000))).toString()
    let user = await userModel.findById({ _id: req.params.id }, { __v: 0 })
    // console.log(user.email)
    user.verifyCode = x
    if (user) {
      const mailOptions = {
        from: {
          name: 'Password Reset',
          address: "pmverifiy@gmail.com"
        }, // sender address
        to: user.email, // list of receivers
        subject: "Password Reset", // Subject line
        html: `<p>Hi ${user.name}</p><p>Your OTP for passwprd reset is given below</p><p>Verification Code : <strong>${x}</strong></p>`, // html body
      }
      sendMail(transporter, mailOptions)
      await userModel.updateOne({ _id: req.params.id }, { $set: { verifyCode: x } }, req.body, { runValidators: true })
      res.status(201).send({ message: 'MailSent', data: req.body.email })
    }
    else {
      res.status(400).send({ message: 'user doesnt exists to update' })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'Internal server error' })
  }
})

//verify the code
router.post('/check/:id', async (req, res) => {
  try {
    let user = await userModel.findById({ _id: req.params.id }, { __v: 0 })
    if (user) {
      // console.log(user)
      await userModel.updateOne({ _id: req.params.id }, { $set: { verificationCode: req.body.verificationCode } })
      if (req.body.verificationCode===user.verifyCode) {
        console.log(`verified`)
        res.status(200).send({ message: 'Verified' })
      }
      else{
        res.status(400).send({ message: 'Invalid code' })
      }
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'Internal server error' })
  }
})

//Edit user details
router.put('/reset/:id', async (req, res) => {
  try {
    let user = await userModel.findById({ _id: req.params.id }, { __v: 0 })
    if (user) {
      req.body.password = await hashPassword(req.body.password)
      await userModel.updateOne({ _id: req.params.id }, { $set: { password: req.body.password } }, req.body, { runValidators: true })
      res.status(201).send({ message: 'Password successfully Changed'})
    }
    else {
      res.status(400).send({ message: 'user doesnt exists to update' })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'Internal server error' })
  }
})

module.exports = router;




