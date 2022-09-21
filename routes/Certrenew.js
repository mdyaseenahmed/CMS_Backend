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
let lastWeek = Math.floor(+new Date() / 1000) + 30 * 24 * 60 * 60
const nodemailer = require('nodemailer');
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

  let emailList = []


router.get('/certrenewcheck',requireAuth,async(req,res)=>{
    let id
    let data
    let certif
    let data3
    const filter = {};

    if(req.user.email!=="mongodb125@gmail.com"){
        return res.json({error:"Couldn't find any certificates"})

    }

    let dataArr=[]
    try{
        data3 = await Cert.find(filter)
        
        

    }catch(err){
        return res.json({error:"Couldn't find any certificates"})
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            // user: process.env.Email 
            // pass: process.env.Password
            user: process.env.EMAIL , // TODO: your gmail account
            pass: process.env.PASSWORD  // TODO: your gmail password
        }
    });

    
    console.log(data3.length)
    for(let i=0;i<data3.length;i++){

        id=data3[i]._id
        email=data3[i].email
        certif=data3[i].cert
        
        try{
            bytes  = CryptoJS.AES.decrypt(certif, process.env.SECRET_KEY);
            certif = bytes.toString(CryptoJS.enc.Utf8);
            

        }catch(err){
            return res.json({error:"Couldn't fetch certificate."})
        }

        

    pem.readCertificateInfo(certif, async function (err, data) {
        if (err) {
            throw err
        }
        endDate = data.validity.end/1000
        if(lastWeek>endDate){
            
            data3[i].email
            emailList.push({email:data3[i].email,id:data3[i]._id})

            let mailOptions = {
                from: 'team5cmstelstra@gmail.com', // TODO: email sender
                to: data3[i].email, // TODO: email receiver
                subject: `Your Certificate ${data3[i]._id} is about to expire!`,
                text: 'Your certificate has expired or is about to expire very soon, please renew it!',
                
            };
            
            try{
                success = await transporter.sendMail(mailOptions)
                
            }catch(err){
                console.log("Couldnt inform user")
            }
            

            
            
            //emailList.push({email:email,certid:id})
            //console.log(emailList)
            
            
        }
        

       
        
        
    })
    
    
        
    }
    
    
    return res.json({success:"Success!"})
        
    

})

module.exports = router

