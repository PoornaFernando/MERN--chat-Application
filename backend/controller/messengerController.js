const formidable = require('formidable');
const User = require('../models/authModel')
const messageModel = require('../models/messageModel');
const fs = require('fs');

const getLastMessage = async(myId, fdId) => {
    const msg = await messageModel.findOne({
        $or: [{
            $and: [{
                senderId: {
                    $eq: myId
                }
            }, {
                receiverId: {
                    $eq: fdId
                }
            }]
        }, {
            $and: [{
                senderId: {
                    $eq : fdId
                }
            }, {
                receiverId: {
                    $eq: myId
                }
            }]
        }]
    }).sort({
        updatedAt : -1
    });
    return msg
}

module.exports.getFriends = async (req, res)=> {
    const myId = req.myId;
    let fnd_msg = [];
    try{
        const friendGet = await User.find({
            _id: {
                $ne: myId
            }
        });
        for (let i = 0; i < friendGet.length; i++){
            let lmsg = await getLastMessage(myId, friendGet[i].id);
            fnd_msg = [...fnd_msg, {
                fndInfo : friendGet[i],
                msgInfo: lmsg
            }]
            console.log(fnd_msg)
        }

        // const filter = friendGet.filter(d => d.id !== myId);
        res.status(200).json({success: true, friends: friendGet})
    }catch (error){
        res.status(500).json({
            error: {
                errorMessage: 'Internal Server Error'
            }
        })
    }
}
module.exports.messageUploadDB = async (req, res) => {

    const {
        senderName,
        receiverId,
        message
    } = req.body
    const senderId = req.myId
    
    try{
        const insertMessage = await messageModel.create({
            senderId: senderId,
            senderName: senderName,
            receiverId: receiverId,
            message: {
                text: message,
                image: ''
            }
        })
        res.status(201).json({
            success: true,
            message: insertMessage
        })
    }catch (err) {
        res.status(500).json({
            error:{
                errorMessage: 'Internal Server Error'
            }
        })
    }
}
module.exports.messageGet = async (req, res) => {
    const myId = req.myId;
    const fdId = req.params.id

    try {
        let getAllMessage = await messageModel.find({

            $or: [{
                $and: [{
                    senderId: {
                        $eq: myId
                    }
                }, {
                    receiverId: {
                        $eq: fdId
                    }
                }]
            }, {
                $and: [{
                    senderId: {
                        $eq : fdId
                    }
                }, {
                    receiverId: {
                        $eq: myId
                    }
                }]
            }]
        })
        // getAllMessage = getAllMessage.filter(m => m.senderId === myId && m.receiverId === fdId || m.receiverId === myId && m.senderId === fdId);

        res.status(200).json({
            success: true,
            message: getAllMessage
        })
    }catch (error){
        res.status(500).json({
            error: {
                errorMessage: 'Internal Server Error'
            }
        })
    }
    
}

module.exports.ImageMessageSend =(req, res) => {
    const senderId = req.myId;
    const form = formidable();

    form.parse(req, (err, fields, files) => {
        const {
            senderName,
            receiverId,
            imageName
        } = fields;
        const newPath = __dirname + `../../../frontend/public/image/${imageName}`
        files.image.originalFilename = imageName;

        try{
            fs.copyFile(files.image.filepath, newPath, async (err) => {
                if(err){
                    res.status(500).json({
                        error: {
                            errorMessage: 'Image upload failed'
                        }
                    })
                }else {
                    const insertMessage = await messageModel.create({
                        senderId: senderId,
                        senderName: senderName,
                        receiverId: receiverId,
                        message: {
                            text: '',
                            image: files.image.originalFilename
                        }
                    })
                    res.status(201).json({
                        success: true,
                        message: insertMessage
                    })

                }
            })
        }catch (error){
            res.status(500).json({
                error: {
                    errorMessage: 'Internal Server Error'
                }
            })
        }
    })

}