const express = require('express')
const mongoose = require('mongoose')
const Cert = mongoose.model('Cert')
const Pk = mongoose.model('Pk')
const {ObjectId} = require('mongodb');

const router = express.Router()
let certif=`-----BEGIN CERTIFICATE-----
MIIDMzCCAhsCFFKRLpkccpt3vuc2u5zGzuvCdxazMA0GCSqGSIb3DQEBCwUAMFYx
CzAJBgNVBAYTAklOMRMwEQYDVQQIDApTb21lLVN0YXRlMRMwEQYDVQQKDAp0ZWxz
X3RyYWluMR0wGwYJKoZIhvcNAQkBFg5zb21lQGdtYWlsLmNvbTAeFw0yMjA4MjYw
NTQ3NTZaFw0yMjA5MDUwNTQ3NTZaMFYxCzAJBgNVBAYTAklOMRMwEQYDVQQIDApT
b21lLVN0YXRlMRMwEQYDVQQKDAp0ZWxzX3RyYWluMR0wGwYJKoZIhvcNAQkBFg5z
b21lQGdtYWlsLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALtt
fK6HWTYyvcGD2ETiO3oRv1dhxNeEkzIjc00sP+Qi5vBqJYWd/06Jlc4z/X7Y8271
mTjgDlDv1b6dOUMtDJDw680xlOtopZ8FJt3odDdDvC9zErGmDBkYRu4lir+1PZnX
g3g+jX0j47eAofJDm35hERlQ++6z9Cax5T9kNLkdH73UB3RvtUqYB009IzEHEB8X
vvMYkNgQJbUyfffsEs9bGetph5zLw9gcG3WdeMALv18T2Tz1Nxwxm42UwjgX/dBR
aNjp+6E1AlNyZb0V6mFG+V4F7wpdO9ZWo8MAHsNDrZy4ttzPHgRuJAxdZrZ9ZrWK
aNZu1OKz3YY62lcwJwkCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEATs0cFsQWLj2j
dqxuj1gIiJMC5nSrLCFXFbfkA/GMt7EYkq5Av8TIYkwEprtHdYy36/ohT4GFVsAT
kFhfn1OS3EXNYLvgHPcoKoFAyhfa+H8+f9LPWR90Ne+GFYocrdK5KJvT/OP5rV6W
0uV3wcKtbnlDdM5NAdj2+Oo7Cfx3NCjzSPhGeP0nwpdzQ7KHUqPxt+VmD+J54MT9
39R6upGk3VScyzj3vIOgJJhR5u+S8xH1LIKjXlahvQ4hUCm0DELYOt+39Xj2gx25
XDnp0M92E9J9mYAPo3glrmOPo2Qr7i/K5JAyt25UqwigZUtyo3PUShXOAxVjiLjc
funIt6tTIw==
-----END CERTIFICATE-----
`
let pk = `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAu218rodZNjK9wYPYROI7ehG/V2HE14STMiNzTSw/5CLm8Gol
hZ3/TomVzjP9ftjzbvWZOOAOUO/Vvp05Qy0MkPDrzTGU62ilnwUm3eh0N0O8L3MS
saYMGRhG7iWKv7U9mdeDeD6NfSPjt4Ch8kObfmERGVD77rP0JrHlP2Q0uR0fvdQH
dG+1SpgHTT0jMQcQHxe+8xiQ2BAltTJ99+wSz1sZ62mHnMvD2BwbdZ14wAu/XxPZ
PPU3HDGbjZTCOBf90FFo2On7oTUCU3JlvRXqYUb5XgXvCl071lajwwAew0OtnLi2
3M8eBG4kDF1mtn1mtYpo1m7U4rPdhjraVzAnCQIDAQABAoIBAQCo2NmZ4RTdXpjT
3JLYe3ZZYeOeNNW/0g9I++bDfzmPrGGf9AAZf1ygxBHQ0cVsoMWtEFQYiMBc6bMF
JV6QxeSsLl4/XItsB7osp9d70g3gO4Usud39bDk54kUEBY4ZZo04Ko6lpLSSJ+Ld
TWSXe5B5KbjdtbdAM52fvmNn2D4nBCqGlu/aCnLfkq4XVZYcvaDx6hk2KqUUZ4Wg
fE8nLkyx8yIqJkQMI3xWQO0jsZa9wUks6jIo4Tr1I14ot/do0MfcKB92D1aET3Gq
rXc4DmK0i/x1ncbuDSstMo0AxNr0RbfNmtFiPukpMR+yYkYaCqOzHr3ZL+7Aox6E
J/iDV2IBAoGBAOZ1O9ZXWaPUjBZXE0bUBX13p4iW1UnRk+/D5eDH2PoETiL0SQis
CvTiCpcFLXyWlowvZZuwaEvRNYEaG6NdxH7Cl1/VNkb692IBXwHkEBeKLfc94kDz
Owduxg5tEiASO3WpaLxZSK7lvbUbHpXPCdbXzPV8yEaVjOBOJgjLcJ8FAoGBANAz
W+AlkyrywwlWuE1eK1kBBm8cANXOg1Ah2sS3pc/OzDfp6KfK+sVGjqh+vAvGSKFL
fG6Vw0s2mGUMSI5oPECO+b307hD5VAJOVUoniGnKi9KGs/+gRghOLsmP2eTpx4HS
fGJQZKrjMFNQsvw2DU9+i20ApmH3mkv/26qlWT81AoGAUr/NmI0M1tK+6lahyVDg
F8kbEuR1+WeTYwhIRon70uow1EQ65S5BUOTJQKjPSGkZ7YQnS9vv1ylruMuTGPnW
UF221OZN8vayVTKA1sD5Njqbfqdt0jyD+YtA+nUXiQSC7SDDRr4YZxR/JcRzGv+Y
XNhn8822bAHO78ufxJCoA7ECgYEAnkreCH4o9RdbR+dh+pilNmc8IA/XZrc7SRpk
PPovm95rj/tMQv5lSMXLQroQeJdJszA0K9O7hpy8ot8C7xq67I6HvG/S7J7Ty2kJ
GXcTFPPE+MwnYCvX8wqWMfMnxA4l/EMvBISA9RgELuQFIRJrbkwU70v2NDfPXQbr
WUObph0CgYEAkf1mfTKjkLFiienBYHhqsVLs/+uicZ9mHW0R7v59/MJ3VIkGV07u
3/S1mghffJ1zyR5yCV3mZu+Z+wGecugpuZ/EPVC/nNzECXRugRcoR5LyrfIuJwV2
ose5g56EhnzgF2unP0iEGV7I5KH26nGLwLUropp3oRx4d4vbfUPGtTE=
-----END RSA PRIVATE KEY-----
`

router.post('/addcert',async(req,res)=>{
    let id = ObjectId();
    const newCert=new Cert({
        _id:id,
        cert:certif,
        domain:req.body.domain,
        email:req.body.email

    })

    const newPk = new Pk({
        certId:id,
        pk:pk
    })

    try{
        
        await newCert.save()
        
    }catch(err){
        console.log(err)
        const error = new Error("Certificate Add Failed")
        error.code=500
        return res.status(error.code).json({error:error.message})
    }
    try{
        
        await newPk.save()
        
    }catch(err){
        console.log(err)
        const error = new Error("Private Key Add Failed")
        error.code=500
        return res.status(error.code).json({error:error.message})
    }


    return res.send("Save Success!")

    
})

module.exports = router

