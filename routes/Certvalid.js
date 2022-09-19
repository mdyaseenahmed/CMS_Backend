const express=require("express")
const { default: mongoose } = require("mongoose")
const router =express.Router()
const requireAuth = require('../middlewares/checkAuth')
const Cert = mongoose.model('Cert')
const Pk = mongoose.model('Pk')
const { validateCertKeyPair,validateSSL } = require('ssl-validator');




router.get('/certvalid',requireAuth,async (req,res)=>{
    let data;
    let cert;
    let pk;
    let id;

    try{
        data = await Pk.findOne({pk:req.body.pk})
        pk = data.pk 
        id = data.certId
    }catch(err){

        return res.json({error:"Couldn't fetch Private Key"})
    }

    try{
        bytes  = CryptoJS.AES.decrypt(pk, process.env.SECRET_KEY);
        pk = bytes.toString(CryptoJS.enc.Utf8);
        

    }catch(err){
        return res.json({error:"Couldn't fetch certificate."})
    }



    try{
        data=await Cert.findOne({_id:id})
        cert=data.cert
        


    }catch(err){
        return res.json({error:"Couldn't fetch certificates"})
    }

    


    try{
        bytes  = CryptoJS.AES.decrypt(cert, process.env.SECRET_KEY);
        cert = bytes.toString(CryptoJS.enc.Utf8);
        

    }catch(err){
        return res.json({error:"Couldn't fetch certificate."})
    }

    




    try{
        data=await validateCertKeyPair(cert,pk)
    }catch(err){
        console.log(err)
        const error = new Error("Validation Failed")
        error.code=422
        return res.status(error.code).json(error.message)

    }
    
    return res.send(data)

    
    
    
    
    
    
})

module.exports=router
