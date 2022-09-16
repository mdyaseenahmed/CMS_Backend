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

    check('commonName').not().isEmpty().withMessage('Common Name Required.').isURL().withMessage("Not a valid domain"),
    check('basicConstraints').not().isEmpty().withMessage('Common Name Required.').contains("CA:false").withMessage("Invalid Parameters"),
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
    const {
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
        basicConstraintsCA
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

    var confData = `[req]\ndays = ${days}\ndistinguished_name = req_distinguished_name\nreq_extensions = v3_req\nx509_extensions = v3_ca\nprompt = no\n\n[req_distinguished_name]\ncountryName = ${countryName}\nstateOrProvinceName = ${stateOrProvinceName}\nlocalityName = ${localityName}\norganizationName = ${organizationName}\norganizationalUnitName = ${organizationalUnitName}\ncommonName = ${commonName}\nemailAddress = ${emailAddress}\n\n[v3_req]\nbasicConstraints = ${basicConstraints}\nkeyUsage = ${keyUsage}\n\n[v3_ca]\nbasicConstraints = ${basicConstraintsCA}`; 
    let id = ObjectId()
    let id2 = id
    id = "./"+id
    let success

    fs.mkdir(id, (err) => {
        if (err) {
            return res.json({error:"Couldn't create certificate."})
        }
        console.log("Directory is created.");
    })
        

    try{
        success = fs.writeFileSync(id+"/myConf.conf", confData)
    }catch(err){
        return res.json({error:"Couldn't create certificate."})
    }

    



    pem.createCertificate({ csrConfigFile:id+'/myConf.conf',days:days,selfSigned:true,extFile:'./host-ext.conf' }, async function (err, keys) {
        if (err) {
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
             cipherconf = CryptoJS.AES.encrypt(confData,process.env.SECRET_KEY).toString()
        }catch(err){
            return res.json({error:"Couldn't create certificate."})
        }
        
        const newCert = new Cert({
            _id:id2,
            cert:ciphertext,
            email:req.user.email,
            type:"SS",
            domain:commonName,
            conf:cipherconf

        })

        const newPk = new Pk({
            certId: id2,
            pk: cipherkey,
            type:"SS"
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
                { filename: id2+".csr", path: id+"/"+id2+".csr" },
                { filename: id2+".key", path: id+"/"+id2+".key" },
                { filename: id2+"public.key", path: id+"/"+id2+"public.key" }
            ]
        };
        
        try{
            success = await transporter.sendMail(mailOptions)
            
        }catch(err){
            return res.json({error:"Couldn't create certificate."})
        }
        

        try{
            success = fs.rmSync(id, { recursive: true, force: true });
            
        }catch(err){
            return res.json({error:"Couldn't create certificate."})
        }

        return res.json({success:"Generated Certificate Successfully!",cert:keys.certificate,pk:keys.serviceKey,csr:keys.csr,certid:id2})

        



    })
        
    


    

})

module.exports = router