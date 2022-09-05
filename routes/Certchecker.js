const express=require("express")
const { default: mongoose } = require("mongoose")
const router =express.Router()
const requireAuth = require('../middlewares/checkAuth')
const Cert = mongoose.model('Cert')
const { validateCertKeyPair,validateSSL } = require('ssl-validator');




router.get('/certexpiry',requireAuth,async (req,res)=>{
    let data;
    let certif
    try{
        data=await Cert.findOne({domain:req.body.domain,email:req.body.email})
        certif=data.cert
    }catch(err){
        console.log(err)   
        res.send("Failed")
    }
    data=await validateSSL(certif)
    
    res.send(data)

    
    
    
    
    
    
})

module.exports=router
