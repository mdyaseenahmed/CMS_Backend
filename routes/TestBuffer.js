const express=require("express")
const { default: mongoose } = require("mongoose")
const router =express.Router()
const requireAuth = require('../middlewares/checkAuth')
const Cert = mongoose.model('Cert')
const Pk = mongoose.model('Pk')
const fs = require('fs')
const CryptoJS = require("crypto-js");
let success;
let bytes;
let originalText
router.get('/certfiletest',requireAuth,async (req,res)=>{
    let data;
    let cert;
    let pkey;
    let id;
    try{
        data=await Cert.findOne({domain:req.body.domain,email:req.body.email})
        cert=data.cert
        id = data._id


    }catch(err){
        return res.json({error:"Couldn't fetch certificates"})
    }

    try{
        bytes  = CryptoJS.AES.decrypt(cert, process.env.SECRET_KEY);
        originalText = bytes.toString(CryptoJS.enc.Utf8);
        success = fs.writeFileSync("retencryp.crt",originalText)

    }catch(err){
        console.log(err)
    }

    console.log(data.originalText)

    




    
    
    return res.send("Success")

    
    
    
    
    
    
})

module.exports=router
