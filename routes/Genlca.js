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

router.post('/generatelocalcacert',requireAuth,async(req,res)=>{
    let key 
    let pk
    let cert
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
    id = "./"+id
    let success

    try{
        success=fs.mkdirSync(id)
    }catch(err){
        return res.json({error:"Couldn't create certificate. 12900"})

    }
        

    try{
        success = fs.writeFileSync(id+"/myConf.conf", confData)
    }catch(err){
        console.log("Write Failed")
    }
    pem.createCertificate({ csrConfigFile:id+'/myConf.conf' }, function (err, keys) {
        if (err) {
          throw err
        }
        cert=keys.certificate
        ck = keys.clientKey
        pk=keys.serviceKey
        csr = keys.csr

        console.log(cert)
        console.log(ck)
        console.log(pk)
        console.log(csr)

        

        return res.json({csr:csr,ck:ck})
        
       

        


    })
        
    


    //return res.json({key:"Hello"})

})

module.exports = router