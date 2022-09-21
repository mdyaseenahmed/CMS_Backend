require('./models/User')
require('./models/Cert')
require('./models/Pk')
require('dotenv').config()
const express = require('express')
const requireAuth = require('./middlewares/checkAuth')
const { default: mongoose } = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const mongoUri = "mongodb+srv://admin:password123pass@cluster0.np9x08k.mongodb.net/?retryWrites=true&w=majority"
const signup = require('./routes/Signup')
const domainexpiry=require('./routes/Domaincertchecker')
const certexpiry=require('./routes/Certchecker')
const pushCert=require('./routes/Pushcert')
const certvalid=require('./routes/Certvalid')
const signin = require('./routes/Signin')
const user_certs = require('./routes/Getusercerts')
const generatecert = require('./routes/Generatecert')
const localca = require('./routes/Localca')
const scert = require('./routes/Genscert')
const detcert = require('./routes/GetDetailedCertInfo')
const renewcertnotif = require('./routes/Certrenew')
const renewcert = require('./routes/Renewcert')


const certft = require('./routes/TestBuffer')

const port = process.env.PORT || 3000
var cors = require('cors')
app.use(cors())
app.use(bodyParser.json())
app.use(signup)
app.use(domainexpiry)
app.use(certexpiry)
app.use(pushCert)
app.use(certvalid)
app.use(signin)
app.use(user_certs)
app.use(generatecert)
app.use(localca)
app.use(scert)
app.use(detcert)
app.use(certft)
app.use(renewcertnotif)
app.use(renewcert)




mongoose.connect(mongoUri)

mongoose.connection.on('connected', ()=>{
    console.log('Mongo Connection Active')
})

mongoose.connection.on('error', (err)=>{
    console.err("Mongo connection failed",err)
})
app.get('/verify',requireAuth,(req,res)=>{
    res.send(`You are indeed logged in! Email: ${req.user.email}`)
})

app.get('/',(req,res)=>{
    res.send("hello")
})

app.listen(port,()=>{
    console.log('Server Active')
})

