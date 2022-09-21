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
const {ObjectId} = require('mongodb');
var pem = require('pem')
const fs = require('fs')
const nodemailer = require('nodemailer');

router.patch('/renewcert',requireAuth,async(req,res)=>{
    let id = ObjectId()
    let id2 = id
    id = "./"+id
    let datac
    let pk
    let bytes
    let ext
    let data3
    let cert
    let data_temp
    let certca
    let days = req.body.days
    let keybitsize
    let dns
    let algo
    let pub

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            // user: process.env.Email 
            // pass: process.env.Password
            user: process.env.EMAIL , // TODO: your gmail account
            pass: process.env.PASSWORD  // TODO: your gmail password
        }
    });

    if(!Number.isInteger(days) && days>0){
        return res.json({error:"Couldn't create certificate."})
    }

    
    try{
        data3 = await Cert.findOne({_id:req.body.id})
        ext = data3.conf
        cert = data3.cert

        
        

    }catch(err){
        return res.json({error:"Couldn't find any certificates"})
    }

    try{
        bytes  = CryptoJS.AES.decrypt(ext, process.env.SECRET_KEY);
        ext = bytes.toString(CryptoJS.enc.Utf8);
        

    }catch(err){
        
        return res.json({error:"Couldn't create certificate."})
    }

    try{
        bytes  = CryptoJS.AES.decrypt(cert, process.env.SECRET_KEY);
        cert = bytes.toString(CryptoJS.enc.Utf8);
        

    }catch(err){
        return res.json({error:"Couldn't create certificate."})
    }
    
    if(data3.type==="CA" || data3.type==="SS"){
        
        

        try{
            success=fs.mkdirSync(id)
        }catch(err){
            return res.json({error:"Couldn't create certificate."})
    
        }
    
        try{
            success = fs.writeFileSync(id+"/myext.conf", ext)
        }catch(err){
            console.log("Write Failed")
        }

        pem.readCertificateInfo(cert, function (err, data) {
            if (err) {
                return res.json({error:"Couldn't create certificate"})
            }

            if(data.hasOwnProperty('san')){
                dns = data.san.dns
            }else{
                dns=[]
            }

            keybitsize = parseInt(data.publicKeySize.split(/[ ,]+/)[0])
            algo = data.signatureAlgorithm.slice(0,6)

            pem.createCertificate({country:data.country,state:data.state,locality:data.locality,organization:data.organization,organizationUnit:data.organizationUnit,commonName:data.commonName,emailAddress:data.emailAddress,altNames:dns,keyBitsize:keybitsize,hash:algo,days:days,extFile:id+'/myext.conf'},async function (err, keys) {
                
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
                     cipherconf = CryptoJS.AES.encrypt(ext,process.env.SECRET_KEY).toString()
                }catch(err){
                    return res.json({error:"Couldn't create certificate."})
                }
                
                const newCert = new Cert({
                    _id:id2,
                    cert:ciphertext,
                    email:req.user.email,
                    type:data3.type,
                    domain:data3.domain,
                    conf:cipherconf
        
                })
        
                const newPk = new Pk({
                    certId: id2,
                    pk: cipherkey,
                    type:data3.type
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

                try{
                    data_temp = await Cert.deleteOne({_id:req.body.id})
                    
            
                    
                    
            
                }catch(err){
                    return res.json({error:"Couldn't Create certificates"})
                }

                try{
                    data_temp = await Pk.deleteOne({certId:req.body.id})
                    
                }catch(err){
            
                    return res.json({error:"Couldn't Create certificates"})
                }
        
                return res.json({success:"Generated Certificate Successfully!",cert:keys.certificate,pk:keys.serviceKey,csr:keys.csr,pub:pub,certid:id2})
        





            })
            
            
                
            
            
        })





    }else if(data3.type==="CAS"){
        

        try{
            id_m = process.env.RCA
            datac=await Cert.findOne({_id:id_m})
            certca=datac.cert
            
    
    
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
            
            bytes  = CryptoJS.AES.decrypt(certca, process.env.SECRET_KEY);
            certca = bytes.toString(CryptoJS.enc.Utf8);
            
    
        }catch(err){
            
            return res.json({error:"Couldn't create certificate."})
        }
    
        try{
            bytes  = CryptoJS.AES.decrypt(pk, process.env.SECRET_KEY);
            pk = bytes.toString(CryptoJS.enc.Utf8);
            
            
    
        }catch(err){
            return res.json({error:"Couldn't create certificate. 188"})
        }

        
        try{
            success=fs.mkdirSync(id)
        }catch(err){
            console.log(err)
            return res.json({error:"Couldn't create certificate."})
    
        }
    
        try{
            success = fs.writeFileSync(id+"/myext.conf", ext)
        }catch(err){
            console.log("Write Failed")
        }

        pem.readCertificateInfo(cert, function (err, data) {
            if (err) {
                console.log(err)
                return res.json({error:"Couldn't create certificate"})
            }

            keybitsize = parseInt(data.publicKeySize.split(/[ ,]+/)[0])
            if(data.hasOwnProperty('san')){
                dns = data.san.dns
            }else{
                dns=[]
            }

            algo = data.signatureAlgorithm.slice(0,6)
            

            pem.createCertificate({serviceCertificate:certca,serviceKey:pk,country:data.country,state:data.state,locality:data.locality,organization:data.organization,organizationUnit:data.organizationUnit,commonName:data.commonName,emailAddress:data.emailAddress,altNames:dns,keyBitsize:keybitsize,hash:algo,days:days,extFile:id+'/myext.conf'},async function (err, keys) {
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
                     cipherconf = CryptoJS.AES.encrypt(ext,process.env.SECRET_KEY).toString()
                }catch(err){
                    console.log(err)
                    return res.json({error:"Couldn't create certificate."})
                }
                
                const newCert = new Cert({
                    _id:id2,
                    cert:ciphertext,
                    email:req.user.email,
                    type:data3.type,
                    domain:data3.domain,
                    conf:cipherconf
        
                })
        
                const newPk = new Pk({
                    certId: id2,
                    pk: cipherkey,
                    type:data3.type
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
                    console.log(err)
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

                try{
                    data_temp = await Cert.deleteOne({_id:req.body.id})
                    
            
                    
                    
            
                }catch(err){
                    return res.json({error:"Couldn't Create certificates"})
                }

                try{
                    data_temp = await Pk.deleteOne({certId:req.body.id})
                    console.log("Delete Success")
                    
                }catch(err){
            
                    return res.json({error:"Couldn't Create certificates"})
                }


        
                return res.json({success:"Generated Certificate Successfully!",cert:keys.certificate,pk:keys.clientKey,csr:keys.csr,pub:pub,certid:id2})

            
            })
        })

    }

    
    
    

})

module.exports = router

