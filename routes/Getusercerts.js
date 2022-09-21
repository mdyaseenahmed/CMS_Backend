const express=require("express")
const { default: mongoose } = require("mongoose")
const router =express.Router()
const requireAuth = require('../middlewares/checkAuth')
const Cert = mongoose.model('Cert')
const Pk = mongoose.model('Pk')
const CryptoJS = require("crypto-js");
const { validateCertKeyPair,validateSSL } = require('ssl-validator');
const timestamp = require('unix-timestamp');
let currentDate = Date.now()
var pem = require('pem')
let endDate
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

    
    console.log(data3.length)
    for(let i=0;i<data3.length;i++){

        id=data3[i]._id
        certif=data3[i].cert
    
        try{
            bytes  = CryptoJS.AES.decrypt(data3[i].cert, process.env.SECRET_KEY);
            data3[i].cert = bytes.toString(CryptoJS.enc.Utf8);
            

        }catch(err){
            return res.json({error:"Couldn't fetch certificate."})
        }

        
/*

        try{
            data=await validateSSL(certif)
        }catch(err){
            console.log("Certificate expired")
        }
        */
        
        //data.certInfo.validity.end=timeConverter(data.certInfo.validity.end)
    pem.readCertificateInfo(data3[i].cert, function (err, data) {
        if (err) {
            throw err
        }
        endDate = data.validity.end
        if(currentDate>endDate){
            data.validity.start="expired"
            data.validity.end="expired"
        }
        else{
            
            data.validity.start=timeConverter(data.validity.start/1000)
            data.validity.end=timeConverter(data.validity.end/1000)
        }
        let certinfo={
            id:data3[i]._id,
            country:data.country,
            state:data.state,
            locality:data.locality,
            organization:data.organization,
            organizationUnit:data.organizationUnit,
            commonName:data.commonName,
            start:data.validity.start,
            end:data.validity.end
        }
        
        
        dataArr.push(certinfo)
        if(i==data3.length-1){
            return res.send(dataArr)
        }
        
        
    })
        
    }
    
        
    

})

module.exports = router

