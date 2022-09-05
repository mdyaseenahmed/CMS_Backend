require('./models/User')
require('./models/Cert')
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
app.use(bodyParser.json())
app.use(signup)
app.use(domainexpiry)
app.use(certexpiry)
app.use(pushCert)
app.use(certvalid)
app.use(signin)


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

app.listen(3000,()=>{
    console.log('Server Active')
})

