const express=require("express")
const router =express.Router()
const requireAuth = require('../middlewares/checkAuth')
var https = require('https')

var sslChecker = require("ssl-checker")
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
router.get('/domainexpiry',requireAuth,async (req,res)=>{
    let response;
    let info=[]
    try{
        response=await sslChecker(`${req.body.domain}`, { method: "GET", port: 443 })
        
        info.push(response.valid)
        info.push(response.validTo)
        info.push(response.daysRemaining)
        console.log(info)
    }catch(err){
        console.log(err)
        res.send("Couldn't verify Certificate")
    }
    return res.send(info)
})







module.exports=router