const express = require('express')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const {ObjectId} = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const router = express.Router()
const {check, validationResult} = require('express-validator');
router.post('/signup',[
    check('firstName').ltrim().not().isEmpty().withMessage('First name required.'),
    check('lastName').ltrim().not().isEmpty().withMessage('Last name required.'),
    check('department').ltrim().not().isEmpty().withMessage('Department is required.'),
    check('userType').ltrim().not().isEmpty().withMessage('User Type is required').matches(/\b(admin|regular)\b/).withMessage("Invalid User Type"),
    check('email').not().isEmpty().withMessage("Email is required").isEmail().withMessage("Enter a valid email"),
    check('password').not().isEmpty().isLength({min:7}).withMessage('Password must have a number and be of minimum length 7').matches(/\d/).withMessage("Password must have a number and be of minimum length 7")




]

,async (req,res)=>{
    const errs = validationResult(req)
    if(errs.errors.length!==0){
        const err=new Error(errs.errors[0].msg)
        err.code = 422
        return res.status(err.code).json({error:err.message})
    }
    let emailExist

    try{
        emailExist = await User.find({email:req.body.email})

        
    }catch(err){
        const error = new Error("Hmmmm wonder what went wrong");
        error.code = 422;
        return res.status(error.code).json({error:error.message});
        
    }

    if(emailExist.length !== 0){
        const error = new Error("Email already exists")
        error.code = 422
        return res.status(error.code).json({error:error.message})
    }

    let hashPass
    try{
        console.log(req.body.password)
        hashPass = await bcrypt.hash(req.body.password,13)


    }catch(err){
        console.log(err)
        const error = new Error('Hashing error');
        error.code = 422;
        return res.status(error.code).json({error:error.message});

    }

    let Id = ObjectId();

    const newUser = new User({
        _id: Id,
        password: hashPass,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        department: req.body.department,
        userType: req.body.userType

    })

    let token

    try{
        token=jwt.sign(
            {userEmail:newUser.email, userId: newUser._id},
            process.env.SECRET_KEY, {expiresIn: 1*24*60*60}

        )
    }catch(err){
        const error=new Error("Error with JWT")
        error.code=422
        return res.status(error.code).json({error:error.message})
    }

    try{
        await newUser.save()
        
    }catch(err){
        console.log(err)
        const error = new Error("Sign up Failed")
        error.code=500
        return res.status(error.code).json({error:error.message})
    }

    return res.json({
        userId:newUser._id,
        email: newUser.email,
        token:token
    })


})

module.exports = router

