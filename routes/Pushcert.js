const express = require('express')
const mongoose = require('mongoose')
const Cert = mongoose.model('Cert')

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
let domain="tels.com"

router.post('/addcert',async(req,res)=>{
    const newCert=new Cert({
        cert:certif,
        domain:req.body.domain,
        email:req.body.email

    })
    try{
        console.log('yes')
        await newCert.save()
        
    }catch(err){
        console.log(err)
        const error = new Error("Certificate add  Failed")
        error.code=500
        return res.status(error.code).json(error.message)
    }

    return res.send("Success!")

    
})

module.exports = router

