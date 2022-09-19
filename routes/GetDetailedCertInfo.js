const express=require("express")
const { default: mongoose } = require("mongoose")
const router =express.Router()
const requireAuth = require('../middlewares/checkAuth')
const Cert = mongoose.model('Cert')
const Pk = mongoose.model('Pk')
const CryptoJS = require("crypto-js");
const { validateCertKeyPair,validateSSL } = require('ssl-validator');
const timestamp = require('unix-timestamp');
function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }


router.get('/getcertinfo',requireAuth,async(req,res)=>{
    
    let data
    let certif
    let bytes
    let pk

    let dataArr=[]
    try{
        data = await Cert.findOne({_id:req.body.id})
        certif=data.cert
        
        

    }catch(err){
        return res.json({error:"Couldn't find any certificates"})
    }

    try{
        bytes  = CryptoJS.AES.decrypt(certif, process.env.SECRET_KEY);
        certif = bytes.toString(CryptoJS.enc.Utf8);
        

    }catch(err){
        return res.json({error:"Couldn't fetch certificate."})
    }

    try{
        data = await Pk.findOne({certId:req.body.id})
        pk = data.pk 
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
        data=await validateCertKeyPair(certif,pk)
    }catch(err){
        return res.json({error:"Couldn't find any certificates"})
    }

    data.certInfo.validity.start=timeConverter(data.certInfo.validity.start/1000)
    data.certInfo.validity.end=timeConverter(data.certInfo.validity.end/1000)
        
    
    
        
    return res.send(data)
})

module.exports = router

