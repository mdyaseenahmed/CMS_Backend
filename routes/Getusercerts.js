const express=require("express")
const { default: mongoose } = require("mongoose")
const router =express.Router()
const requireAuth = require('../middlewares/checkAuth')
const Cert = mongoose.model('Cert')
const { validateCertKeyPair,validateSSL } = require('ssl-validator');


router.get('/user_certs',requireAuth,async(req,res)=>{
    let data
    try{
        data = await Cert.find({email:req.body.email})

    }catch(err){
        return res.json({error:"Couldn't fetch certificates"})
    }
    
    return res.send(data)
})

module.exports = router

