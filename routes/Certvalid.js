const express=require("express")
const { default: mongoose } = require("mongoose")
const router =express.Router()
const requireAuth = require('../middlewares/checkAuth')
const Cert = mongoose.model('Cert')
const Pk = mongoose.model('Pk')
const { validateCertKeyPair,validateSSL } = require('ssl-validator');
let certif=`-----BEGIN CERTIFICATE-----
MIIDpTCCAo0CFFOx5q4shedUtBdIaswakJReEMC/MA0GCSqGSIb3DQEBCwUAMIGO
MQswCQYDVQQGEwJJTjESMBAGA1UECAwJS2FybmF0YWthMRIwEAYDVQQHDAlCYW5n
YWxvcmUxEDAOBgNVBAoMB1RlbHN0cmExEDAOBgNVBAsMB1RlbGVjb20xEzARBgNV
BAMMClRlYW1fNV9MQ0ExHjAcBgkqhkiG9w0BCQEWD3RlYW01QGdtYWlsLmNvbTAe
Fw0yMjA5MTUxMTA4NTBaFw0yMjEyMjQxMTA4NTBaMIGOMQswCQYDVQQGEwJJTjES
MBAGA1UECAwJS2FybmF0YWthMRIwEAYDVQQHDAlCYW5nYWxvcmUxEDAOBgNVBAoM
B1RlbHN0cmExEDAOBgNVBAsMB1RlbGVjb20xEzARBgNVBAMMClRlYW1fNV9MQ0Ex
HjAcBgkqhkiG9w0BCQEWD3RlYW01QGdtYWlsLmNvbTCCASIwDQYJKoZIhvcNAQEB
BQADggEPADCCAQoCggEBAOpi2H0hLNJlmSAI+UujoDWfdLQb/h1sRjCV+k6grlXm
e3cBAe04U456dy+WxJsyea8wCLA9JEXAw1BUbzDmyVTIQ1jJ4TyM3HCy5LXZlb7I
ZXp2HpidGvv33TcMrpuo0eVqzXwSnxDLzsnjG7GDl4nJzsFK8XwVQUwNq0YO3RIQ
IZWY6QIW0Z0CO8zI4+Nw5Aif/G3q7XuReINhMvCSNKlNoikRLD6l7Wf7khyld/7H
hdd5/P/4DSpDweLgZAwRYwRPPGP6L4HouW6i7vo3UMqTg78TfAms6paz/9Vv7M4k
uugx+So8DERCR8HX/nbW7iOhiBsAHqNNHarLcNdcZB8CAwEAATANBgkqhkiG9w0B
AQsFAAOCAQEA1TiMGFXDktJdNZhSI0uw+DS4ufYQW/0jXE3XtFUnB1QEeZaRM1z/
q8CB/ovNXbl0u8VqDjl/pESgBG0fZLeqxYJS7qQyz+mftg/cQRwA+05XjJ1IFm5u
yNCGBplNymw5ATIgpElgv+unR6SJ/QbHXeDDnLcliwZiZvntgPPdakmdtbU6ntdX
o7p9iZwggawsckm2djF5UZU+5eYhTXCdIWUfT/+x4ppERJ+w2xZaLcHd/FIgfkRz
rVKA+VYUkB+VahNhRm6D/hZYulEP3LrNfSlJMx2cRJQkOGlbgwEK0Ok2ss3tnSzG
d7HFtj64/drMAZtMBpi7y2dzqcCD5ePjIQ==
-----END CERTIFICATE-----
`



let pki=`-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA6mLYfSEs0mWZIAj5S6OgNZ90tBv+HWxGMJX6TqCuVeZ7dwEB
7ThTjnp3L5bEmzJ5rzAIsD0kRcDDUFRvMObJVMhDWMnhPIzccLLktdmVvshlenYe
mJ0a+/fdNwyum6jR5WrNfBKfEMvOyeMbsYOXicnOwUrxfBVBTA2rRg7dEhAhlZjp
AhbRnQI7zMjj43DkCJ/8berte5F4g2Ey8JI0qU2iKREsPqXtZ/uSHKV3/seF13n8
//gNKkPB4uBkDBFjBE88Y/ovgei5bqLu+jdQypODvxN8CazqlrP/1W/sziS66DH5
KjwMREJHwdf+dtbuI6GIGwAeo00dqstw11xkHwIDAQABAoIBAG/9vtc7DMGTDfFC
mGtNyXUVtZuBbI/+diMs5ia/m80rjX61GoiQS0xes6gnb9V/7qiIWP5smHJDwo8V
aPOCslwyPAummlpmK8YllCZXyrcX5XT4D3J4TrZqHmb5RkzWA0SNHZXVB+/skefg
/hB5geSyanntJylUtphyR433+CVyaZ40rwLhNMANbJrcvdv0tiQeAY3ZdDNGUFuO
Gsx+2/4r86vfcYMtEm/gitHq+YmWAp3j7P+2cfDZYsy7PUhvwfqTZa2nRUmhEPn9
LPUJyNFY2r3E7ilOeYEgOg91Ul45pOLEXagSCz7bFA3SDebgf4kzfj3RrLMg/jgO
fuFgxGECgYEA+E71RsUAa16V1Wh/MkgIbMwl3WQ5/DkRtarCqpIXMCmUFFS/h904
ySGuwOn3xiitax1xm6g8pUdYaUS7Y0nOyxAmPdxcxhCYETo8R+O2ylihWnIsA53I
/rYH2GHWwAVZIWVsoqGqzdMkNxrXBMOY0FfetbgSrzjD4RyWuJxztycCgYEA8aV8
bn4pKA1zxMfquV4rtNrD4Y+kiC92fk5OdhnDGl4Tbx/hwrSpem8eih5XEvhcKKh7
9GslCHAYXKv13UO3Cd10UanciJVAJ4irmFaGTE9NSDKhr9015XBUjgEqiE1IjruD
ZJdiJMfSUnCBtIvVqnps1spULXfMggUuywjDxkkCgYA8z4l+JWzu3qEvPII6HC4E
BxMW3x7cSFWv+fvmrhSDtQsQ15h4e5MWnusfT61gmEGwQ+u4xUDk8U4TqcOCk2bT
kEbtS3RlBVdYkLyGlpwDfiU181QYJqI8zvOo6H0hVa34YdBzG8iq05TA8g/KmORp
0bs3IbdhtjMyhD/dQmOMbQKBgBepHXrwLXV3g7tj287UsrDdrspaN0ECbLbHUhVs
RldBmOOLmp5m9CVB1hquB9aarONqQ+DV0OV3nFsOl19X7wcvQOFyIV7aRlLYpfyf
lDzKkwWbt4sxvMI/cngJEzIPZyhaoe3qiLiTPDvIOlsESiKMJDYPz5g4H7UnbsKA
lDLJAoGBANekkbZiXX7zICWYvN31dm8Z49z+dsTFA4RR1WFwy+jOP+73e9kA0QsK
EkGyQIRuoy0H4JKhhUA4YDTdKmmuhT+HGmdQzcIhSpRL4l0eiFhFiTiRbm9v44gz
hvDvJ4IhQ+Q3Td/n548baHY2NHyp2ANwX3MuHZpX8603H9hlLkWv
-----END RSA PRIVATE KEY-----
`



router.get('/certvalid',requireAuth,async (req,res)=>{
    let data;
    let cert;
    let pkey;
    let id;
    try{
        data=await Cert.findOne({domain:req.body.domain,email:req.body.email})
        cert=data.cert
        id = data._id


    }catch(err){
        return res.json({error:"Couldn't fetch certificates"})
    }
    try{
        data = await Pk.findOne({certId:id})
        pkey = data.pk 
    }catch(err){

        return res.json({error:"Couldn't fetch Private Key"})
    }




    try{
        data=await validateCertKeyPair(certif,pki)
    }catch(err){
        console.log(err)
        const error = new Error("Validation Failed")
        error.code=422
        return res.status(error.code).json(error.message)

    }
    
    return res.send(data)

    
    
    
    
    
    
})

module.exports=router
