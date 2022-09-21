const express=require("express")
const { default: mongoose } = require("mongoose")
const router =express.Router()
const requireAuth = require('../middlewares/checkAuth')
const Cert = mongoose.model('Cert')
const Pk = mongoose.model('Pk')
const fs = require('fs')
const openssl = require('openssl-nodejs')
const {ObjectId} = require('mongodb');
var pem = require('pem')
const CryptoJS = require("crypto-js");
const {check, validationResult} = require('express-validator');
const nodemailer = require('nodemailer');




router.post('/createselfsigned',requireAuth,[

    check('commonName').not().isEmpty().withMessage('Common Name Required.').isURL({require_protocol:false}).withMessage("Invalid URL"),
    check('basicConstraints').not().isEmpty().withMessage('Basic constraints Required.').contains("CA:true").withMessage("Invalid Parameters"),
    check('countryName').optional({checkFalsy:true}).isISO31661Alpha2().withMessage("Invalid country code. ISO 3166-1 alpha-2 standard followed."),
    check('days').isNumeric({no_symbols:true}).withMessage("Days needs to be a number without any symbols.")
    
],async(req,res)=>{

    const errs = validationResult(req)

    if(errs.errors.length!==0){
        const err=new Error(errs.errors[0].msg)
        err.code = 422
        return res.status(err.code).json({error:err.message})
    }

    let key 
    let pub
    let cert
    let ciphertext
    let pk
    let altN = []
    const {
        keyBitSize,
        days,
        csrSignAlgo,
        countryName,
        stateOrProvinceName,
        localityName,
        organizationName,
        organizationalUnitName,
        commonName,
        emailAddress,
        basicConstraints,
        keyUsage,
        basicConstraintsCA,
        altNames
    } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            // user: process.env.Email 
            // pass: process.env.Password
            user: process.env.EMAIL , // TODO: your gmail account
            pass: process.env.PASSWORD  // TODO: your gmail password
        }
    });

    
    let id = ObjectId()
    let id2 = id
    id = "./"+id
    let success

    try{
        success=fs.mkdirSync(id)
    }catch(err){
        return res.json({error:"Couldn't create certificate."})

    }
        

    let extData = ""
    if (typeof altNames !== 'undefined' && altNames.length > 0) {
        altN = altNames
    }
    

    if(basicConstraints!=""){
        extData+=`basicConstraints = ${basicConstraints}\n`
        

    }
    if(keyUsage!=""){
        extData+=`keyUsage = ${keyUsage}\n`
    }
    if(basicConstraintsCA!=""){
        extData+=`basicConstraints = ${basicConstraintsCA}\n`
    }
    extData+=`subjectKeyIdentifier = hash\nauthorityKeyIdentifier = keyid,issuer:always\n`

    try{
        success = fs.writeFileSync(id+"/myext.conf", extData)
    }catch(err){
        console.log("Write Failed")
    }

    



    pem.createCertificate({ country:countryName,state:stateOrProvinceName,locality:localityName,altNames:altN,organization:organizationName,organizationUnit:organizationalUnitName,commonName:commonName,emailAddress:emailAddress,keyBitsize:keyBitSize,hash:csrSignAlgo,days:days,selfSigned:true,extFile:id+'/myext.conf' }, async function (err, keys) {
        if (err) {
            console.log(err)
          return res.json({error:"Couldn't create certificate."})
        }

        
        try{
            success = fs.writeFileSync(id+"/"+id2+".crt", keys.certificate)
        }catch(err){
            console.log("Write Failed")
        }

        try{
            success = fs.writeFileSync(id+"/"+id2+".key", keys.serviceKey)
        }catch(err){
            console.log("Write Failed")
        }

        try{
            success = fs.writeFileSync(id+"/"+id2+".csr", keys.csr)
        }catch(err){
            console.log("Write Failed")
        }
        
        try{
             ciphertext = CryptoJS.AES.encrypt(keys.certificate, process.env.SECRET_KEY).toString();
             cipherkey = CryptoJS.AES.encrypt(keys.serviceKey,process.env.SECRET_KEY).toString()
             cipherconf = CryptoJS.AES.encrypt(extData,process.env.SECRET_KEY).toString()
        }catch(err){
            return res.json({error:"Couldn't create certificate."})
        }
        
        const newCert = new Cert({
            _id:id2,
            cert:ciphertext,
            email:req.user.email,
            type:"CA",
            domain:commonName,
            conf:cipherconf

        })

        const newPk = new Pk({
            certId: id2,
            pk: cipherkey,
            type:"CA"
        });

        try {
            await newCert.save();
            console.log("Cert saved")
        } catch (err) {
            console.log(err);
            const error = new Error("Certificate Add Failed");
            error.code = 500;
            return res.status(error.code).json({ error: error.message });
        }

        try {
            await newPk.save();
        } catch (err) {
            console.log(err);
            const error = new Error("Private Key Add Failed");
            error.code = 500;
            return res.status(error.code).json({ error: error.message });
        }

        pem.getPublicKey(keys.certificate,function(err,keys){
            if(err){
                return res.json({error:"Couldn't create certificate."})

            }

            try{
                success = fs.writeFileSync(id+"/"+id2+"public.key", keys.publicKey)
            }catch(err){
                console.log("Write Failed")
            }

        })

        let mailOptions = {
            from: 'team5cmstelstra@gmail.com', // TODO: email sender
            to: req.user.email, // TODO: email receiver
            subject: 'Your New Certificate!',
            text: 'Please find your new certificated attached, Thank you, for using our service.',
            attachments: [
                
                { filename: id2+".crt", path: id+"/"+id2+".crt" },
                
            ]
        };
        
        try{
            success = await transporter.sendMail(mailOptions)
            
        }catch(err){
            return res.json({error:"Couldn't create certificate."})
        }

        try{
            pub = fs.readFileSync(id+"/"+id2+"public.key",{encoding:"utf-8"})

        }catch(err){
            console.log(err)
            return res.json({error:"Couldn't create certificate."})
        }

        

        try{
            success = fs.rmSync(id, { recursive: true, force: true });
            
        }catch(err){
            return res.json({error:"Couldn't create certificate."})
        }

        return res.json({success:"Generated Certificate Successfully!",cert:keys.certificate,pk:keys.serviceKey,csr:keys.csr,pub:pub,certid:id2})

        



    })
        
    


    

})

module.exports = router