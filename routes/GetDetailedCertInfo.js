const express=require("express")
const { default: mongoose } = require("mongoose")
const router =express.Router()
const requireAuth = require('../middlewares/checkAuth')
const Cert = mongoose.model('Cert')
const Pk = mongoose.model('Pk')
const CryptoJS = require("crypto-js");
var pem = require('pem')
const fs = require('fs')
const {ObjectId} = require('mongodb');
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



  


router.post('/getcertinfo',requireAuth,async(req,res)=>{
    let id = ObjectId()
    let id2 = id
    id = "./"+id
   /* try{
        success = fs.rmSync(id, { recursive: true, force: true });
        
    }catch(err){
        return res.json({error:"Couldn't get certificate details."})
    }*/
    

    try{
        success=fs.mkdirSync(id)
    }catch(err){
        console.log(err)
        return res.json({error:"Couldn't get certificate details."})

    }
    let pub
    let data
    let certif
    let bytes
    let pk

    let dataArr=[]
    try{
        data = await Cert.findOne({_id:req.body.id})
        certif=data.cert
        
        

    }catch(err){
        console.log("hey")
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

    

    pem.readCertificateInfo(certif, function (err, data) {
        if (err) {
            console.log(err)
            return res.json({error:"Couldn't get certificate details."})
        }

        pem.getPublicKey(certif,function(err,keys){
            if(err){
                console.log(err)
                return res.json({error:"Couldn't get certificate details."})
    
            }
    
            try{
                success = fs.writeFileSync(id+"/"+id2+"public.key", keys.publicKey)
            }catch(err){
                console.log("Write Failed")
            }
    
            try{
                pub = fs.readFileSync(id+"/"+id2+"public.key",{encoding:"utf-8"})
                
    
            }catch(err){
                console.log(err)
                return res.json({error:"Couldn't get certificate details. 2"})
            }
    
            try{
                success = fs.rmSync(id, { recursive: true, force: true });
                
            }catch(err){
                return res.json({error:"Couldn't get certificate details."})
            }

            data.validity.start=timeConverter(data.validity.start/1000)
            data.validity.end=timeConverter(data.validity.end/1000)
            let dataf = {cert_info:data,pub:pub,cert:certif}
            return res.json(dataf)
    
        })

        

        
        
        
            
        
    })
        
    
    
        
    
})

module.exports = router

