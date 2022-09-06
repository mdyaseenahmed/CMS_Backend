const mongoose = require('mongoose');
const {check, validationResult} = require('express-validator');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = mongoose.model('User');

router.post('/signin', async (req, res) => {
    const {email,password} = req.body

    if(!email || !password){
        return res.status(422).send({error:"Email and Password required"})

    }
    let foundUser

    try{
        foundUser = await User.findOne({email:email})
    }catch(err){
        const error = new Error('User Does Not Exist');
        error.code = 400;
        return res.status(error.code).json({error:error.message});
    }

    if (!foundUser) {
        return res.status(400).json({error:'Incorrect Email or Password'});
    }

    let isValidPassword;

    try {
        isValidPassword = await bcrypt.compare(
            req.body.password,
            foundUser.password
        );
    } catch (err) {
        console.log(err);
        const error = new Error('Incorrect Email or Password');
        error.code = 422;
        return res.status(400).json({error:error.message});
    }

    if (!isValidPassword) {
        const error = new Error('Incorrect Email or Password');
        error.code = 422;
        return res.status(400).json({error:error.message});
    }
   
    let token;
    try {
        token = jwt.sign(
            {email: foundUser.email, userId: foundUser._id},
            process.env.SECRET_KEY,
            {expiresIn: 1 * 24 * 60 * 60}
            
        );
        
    } catch (err) {
        const error = new Error("User couldn't be logged in");
        error.code = 422;
        return res.status(400).json({error:error.message});
    }

    return res.status(200).json({
        userId: foundUser._id,
        email: foundUser.email,
        token: token,
    });






})

module.exports = router;
