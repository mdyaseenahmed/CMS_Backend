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


router.get('/user_certs',requireAuth,async(req,res)=>{
    let id
    let data
    let certif
    let data3

    let dataArr=[]
    try{
        data3 = await Cert.find({email:req.user.email})
        
        

    }catch(err){
        return res.json({error:"Couldn't find any certificates"})
    }

    

    for(let i=0;i<data3.length;i++){

        id=data3[i]._id
        certif=data3[i].cert
    
        try{
            bytes  = CryptoJS.AES.decrypt(certif, process.env.SECRET_KEY);
            certif = bytes.toString(CryptoJS.enc.Utf8);
            

        }catch(err){
            return res.json({error:"Couldn't fetch certificate."})
        }

        


        try{
            data=await validateSSL(certif)
        }catch(err){
            console.log(err)
        }
        
        
        //data.certInfo.validity.end=timeConverter(data.certInfo.validity.end)
        data.certInfo.validity.start=timeConverter(data.certInfo.validity.start/1000)
        data.certInfo.validity.end=timeConverter(data.certInfo.validity.end/1000)
        let certinfo={
            id:id,
            country:data.certInfo.country,
            state:data.certInfo.state,
            locality:data.certInfo.locality,
            organization:data.certInfo.organization,
            organizationUnit:data.certInfo.organizationUnit,
            commonName:data.certInfo.commonName,
            start:data.certInfo.validity.start,
            end:data.certInfo.validity.end
        }
        
        dataArr.push(certinfo)
        
    }
    
        
    return res.send(dataArr)
})

module.exports = router

