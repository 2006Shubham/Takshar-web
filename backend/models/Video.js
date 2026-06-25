const mongoose = require('mongoose');


const videoSchema = new mongoose.Schema({

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },

    spark: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Spark'
    },

    videoUrl: {
        type: String,
        required: true
    },

    thumbnailUrl: {
        type: String,
        default:''
    }

    ,
    duration: {
        type: Number,
        default :0
    }

    ,
    likes: [{

        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
       
    }]
    ,

    views:{
        type:Number,
        default:0
    },
    
    
    


},{timestamps:true});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;