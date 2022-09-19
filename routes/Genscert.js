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




router.post('/createrootsigned',requireAuth,[

    check('commonName').not().isEmpty().withMessage('Common Name Required.').isURL().withMessage("Not a valid domain"),
    //check('basicConstraints').not().isEmpty().withMessage('Basic Constraints Required.').contains("CA:false").withMessage("Invalid Parameters"),
],async(req,res)=>{

    const errs = validationResult(req)

    if(errs.errors.length!==0){
        const err=new Error(errs.errors[0].msg)
        err.code = 422
        return res.status(err.code).json({error:err.message})
    }
    
    let key 
    let cert
    let ciphertext
    let pk
    let datac
    let bytes
    let altN = []
    const {
        keyBitSize,
        csrSignAlgo,
        days,
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


    
    let id = ObjectId()
    let id2 = id
    id = "./"+id
    let success

    try{
        success=fs.mkdirSync(id)
    }catch(err){
        return res.json({error:"Couldn't create certificate. 12900"})

    }

    try{
        success = fs.writeFileSync(id+"/myext.conf", extData)
    }catch(err){
        console.log("Write Failed")
    }
        

    
    try{
        id_m = process.env.RCA
        datac=await Cert.findOne({_id:id_m})
        cert=datac.cert
        


    }catch(err){
        return res.json({error:"Couldn't fetch certificates"})
    }
    try{
        datac = await Pk.findOne({certId:id_m})
        pk = datac.pk 
    }catch(err){

        return res.json({error:"Couldn't fetch Private Key"})
    }

    try{
        bytes  = CryptoJS.AES.decrypt(cert, process.env.SECRET_KEY);
        cert = bytes.toString(CryptoJS.enc.Utf8);
        

    }catch(err){
        return res.json({error:"Couldn't create certificate."})
    }

    try{
        bytes  = CryptoJS.AES.decrypt(pk, process.env.SECRET_KEY);
        pk = bytes.toString(CryptoJS.enc.Utf8);
        
        

    }catch(err){
        return res.json({error:"Couldn't create certificate. 188"})
    }

    console.log(id)




    



    pem.createCertificate({ country:countryName,state:stateOrProvinceName,locality:localityName,organization:organizationName,organizationUnit:organizationalUnitName,commonName:commonName,emailAddress:emailAddress,altNames:altN,keyBitsize:keyBitSize,hash:csrSignAlgo,days:days,serviceCertificate:cert,serviceKey:pk,extFile:id+'/myext.conf'}, async function (err, keys) {
        if (err) {
            console.log(err)
            
          return res.json({error:"Couldn't create certificate 12."})
        }

        
        try{
            success = fs.writeFileSync(id+"/"+id2+".crt", keys.certificate)
        }catch(err){
            console.log("Write Failed")
        }

        try{
            success = fs.writeFileSync(id+"/"+id2+".key", keys.clientKey)
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
             cipherkey = CryptoJS.AES.encrypt(keys.clientKey,process.env.SECRET_KEY).toString()
             cipherconf = CryptoJS.AES.encrypt(extData,process.env.SECRET_KEY).toString()
        }catch(err){
            console.log(err)
            return res.json({error:"Couldn't create certificate. 116"})
        }
        
        const newCert = new Cert({
            _id:id2,
            cert:ciphertext,
            email:req.user.email,
            type:"CAS",
            domain:commonName,
            conf:cipherconf

        })

        const newPk = new Pk({
            certId: id2,
            pk: cipherkey,
            type:"CAS"
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
                return res.json({error:"Couldn't create certificate. 123"})

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
                { filename: id2+".csr", path: id+"/"+id2+".csr" },
                { filename: id2+".key", path: id+"/"+id2+".key" },
                { filename: id2+"public.key", path: id+"/"+id2+"public.key" }
            ]
        };
        
        try{
            success = await transporter.sendMail(mailOptions)
            
        }catch(err){
            return res.json({error:"Couldn't create certificate. 115"})
        }
        

        try{
            success = fs.rmSync(id, { recursive: true, force: true });
            
        }catch(err){
            return res.json({error:"Couldn't create certificate 114."})
        }

        return res.json({success:"Generated Certificate Successfully!",cert:keys.certificate,pk:keys.clientKey,certid:id2,csr:keys.csr})

        



    })
        
    


    

})

module.exports = router