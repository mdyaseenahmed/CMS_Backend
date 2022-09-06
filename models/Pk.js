const mongoose = require('mongoose')


const pkSchema = new mongoose.Schema({
    certId:{type:String,required:true,unique:true},
    pk:{type:String,required:true}
    

})

mongoose.model('Pk',pkSchema)

