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


router.post('/createlca',requireAuth,[
    check('commonName').not().isEmpty().withMessage('Common Name Required.').isURL().withMessage("Not a valid domain"),
    check('basicConstraints').not().isEmpty().withMessage('Basic Constraints Required.').contains("CA:true").withMessage("Invalid Parameters"),
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

    



    pem.createCertificate({ csrConfigFile:id+'/myConf.conf',days:days }, async function (err, keys) {
        if (err) {
          return res.json({error:"Couldn't create certificate."})
        }

        
        /*try{
            success = fs.writeFileSync(id+"/"+id2+".crt", keys.certificate)
        }catch(err){
            console.log("Write Failed")
        }

        try{
            success = fs.writeFileSync(id+"/"+id2+".key", keys.serviceKey)
        }catch(err){
            console.log("Write Failed")
        }*/
        
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
        

        try{
            success = fs.rmSync(id, { recursive: true, force: true });
            
        }catch(err){
            return res.json({error:"Couldn't create certificate."})
        }

        return res.json({success:"Generated Certificate Successfully!",cert:keys.certificate,pk:keys.serviceKey,certid:id2})

        



    })
        
    


    

})

module.exports = router