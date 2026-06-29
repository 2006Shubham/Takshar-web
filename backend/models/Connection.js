const mongoose  = require('mongoose')

const connectionSchema = new mongoose.Schema({


        from:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'User'
        }
        ,
        to:{

            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'User'

        },

        status:{
            type:String,
               enum: ['Pending', 'Accepted', 'Declined'],
               default:'Pending'
        },

        createdAt:{
            type:Date,
            default:Date.now
        }


});

const Connection = mongoose.model('Connection',connectionSchema);
module.exports = Connection;
