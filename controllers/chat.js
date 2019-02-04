"use strict"
const Conversation = require('../models/Conversation'),  
      Message = require('../models/Message'),
      User = require('../models/User');


exports.getConversations = async function(req, res, next){
  try{  
    let conversations = await Conversation.find({participants: req.user._id }).sort('-lastMessageTime');
    if(!conversations){
      return res.status(404);
    }
    if(conversations.length===0) {
      return res.status(404);
    }else{
      let conversationPics = {};
      for(const conversation of conversations){
        if(conversation.participants.length == 2){
          var otherPersonIndex = 0;
          var tempId = conversation.participants[0].toString();
          if(tempId == req.user._id.toString()){
            otherPersonIndex = 1;
          }
          try{
              let otherUser = await User.findOne({"_id": conversation.participants[otherPersonIndex]});
              if(otherUser){
                if(otherUser.profile.picture){
                  conversationPics[conversation._id] = otherUser.profile.picture;
                }else{
                  conversationPics[conversation._id] = conversation.image;
                }
              }
          }catch(err){return next(err);}
        }else{
          conversationPics[conversation._id] = conversation.image;
        }
      }
      res.status(200).send(conversationPics);
      //console.log(conversationPics);
    }
  }catch(err){return next(err);}
}

exports.getConversation = async(req, res, next)=> { 
  //populating the conversation with clients
  try{
    var conversation = await Conversation.findOne({"_id":req.params.conversationID});
    if(!conversation){
      return res.status(404).send("Error! Page not found");
    }
    var participants = conversation.participants;
    //validate current user is one of the partcipants
    var validated = false;
    for(var i = 0; i < participants.length; i++){
      if(participants[i] == req.user._id.toString()){
        validated = true;

        //get all participants information except current user
        var participantsInfo = [];
        for(let partcipant of participants){
          try{
            let user = await User.findOne(partcipant);
            if(user && user._id.toString() != req.user._id.toString()){ //exclude logged in user from participants array
              var participantInfo = [];
              participantInfo.push(user._id);
              participantInfo.push(user.name || "");
              participantInfo.push(user.profile.picture || "");
              participantsInfo.push(participantInfo);
            }
          }catch(err){continue;}
        }
        Message.find({ "conversationId":req.params.conversationID})
          .select('createdAt body author')
          .sort('createdAt')
          .exec(function(err, messages) {
            if (err) {
              res.send({ error: err });
              return next(err);
            }
            res.render('chat', {messages: messages, participants: participantsInfo, currentUser: req.user});
            //res.status(200).json({ conversation: messages });
          });
      }//end of if
    }//end of for
    if(!validated){
      res.status(400).json({error: "ERROR! You do not have permission to access this conversation!"});
    }//end of if(!validated)

  }catch(error){
    res.send("There is an error with the server, please try again later");
    return next(error);
  }

};


/**
 *  new conversations can be initiated by clicking "message" button on the user  
 *  1. client x clicks "message" to client y 
 *  2. a new Conversation z is created containing participants x and y
 *  3. a new message is created with z's id and what x has written
 */
exports.newConversation = function(req, res, next) { 
  if(!req.params.recipient) {
    res.status(422).send({ error: 'Please choose a valid recipient for your message.' });
    return next();
  }
  if(!req.body.composedMessage) {
    res.status(422).send({ error: 'Please enter a message.' });
    return next();
  }
  //Verify user - Gender, school, major, gradyear, edulevel must be filled out
  var validated = false;


  //check if there exists a conversation between two clients
  Conversation.find({ participants: req.user._id })
    .exec(function(err, conversations) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }
      if(conversations.length!=0) {
        var length = conversations.length;
        conversations.forEach((convo)=>{
          length--;
          var temp = [req.user._id, req.params.recipient].sort().toString();
          var temp2 = convo.participants.sort().toString();
          if(temp === temp2){
            //TODO: this doesnt add the newly composed message to the chat
            res.redirect('/chat/'+convo._id);
          }else if(length == 0){  //there does not exist a conversation between these two participants
            //TODO: this way of obtaining image does not work 
            var img = "https://cdn3.iconfinder.com/data/icons/glyph/227/Button-Add-3-512.png";
            var currentDate = new Date();
            const conversation = new Conversation({
              participants: [req.user._id, req.params.recipient],
              image: img,
              lastMessageTime: currentDate
            });

            conversation.save(function(err, newConversation) {
              if (err) {
                res.send({ error: err });
                return next(err);
              }
              
              const message = new Message({
                conversationId: newConversation._id.toString(),
                body: req.body.composedMessage,
                author: req.user._id
              });

              message.save(function(err, newMessage) {
                if (err) {
                  res.send({ error: err });
                  return next(err);
                }
                //TODO: redirect to conversation page or stay where the user is?
                res.redirect('/chat/'+conversation.id.toString());
              });
            });//end of conversation.save
          }
        });
      }else{
        //var img = require('../public/assets/add_conversation_image.png')
        var img = "https://cdn3.iconfinder.com/data/icons/glyph/227/Button-Add-3-512.png";
        var currentDate = new Date();
        const conversation = new Conversation({
          participants: [req.user._id, req.params.recipient],
          image: img,
          lastMessageTime: currentDate
        });

        conversation.save(function(err, newConversation) {
          if (err) {
            res.send({ error: err });
            return next(err);
          }
          
          const message = new Message({
            conversationId: newConversation._id.toString(),
            body: req.body.composedMessage,
            author: req.user._id
          });

          message.save(function(err, newMessage) {
            if (err) {
              res.send({ error: err });
              return next(err);
            }
            //TODO: redirect to conversation page or stay where the user is?
            res.redirect('/chat/'+conversation.id.toString());
          });
        });//end of conversation.save
       
      }//end of else
    });
}


exports.sendReply = async function(req, res, next) {  
  const reply = new Message({
    conversationId: req.params.conversationId,
    body: req.body.msg,
    author: req.user._id
  });

  var currentDate = new Date();
  reply.save(async function(err, sentReply) {
    if (err) {
      res.send({ error: err });
      return next(err);
    }
    await Conversation.findOneAndUpdate({"_id": req.params.conversationId}, {$set:{lastMessageTime:currentDate}});
    return(next);
  });
}

exports.addMember = (req, res, next) =>{
  var newMemberEmail = req.body.new_member.toString();
  //TODO: change query type
  User.findOne({'email': newMemberEmail}, (err, user) => {
    if(err){  //user not found
      next(err);
    }
    if(!user){
      res.send('No such user found');
    }else{
      //append a new participant to current participant array
      Conversation.findOne({"_id":req.params.conversationId}, (err, conversation) =>{
        if(err){throw err;}
        //if there are only two people in the private conversation, create a new group conversation
        if(conversation.participants.length == 2){
          //TODO: test this
          var p = conversation.participants;
          p.push(user._id);
          var img = "https://cdn3.iconfinder.com/data/icons/glyph/227/Button-Add-3-512.png";
          var currentDate = new Date();
          const newConvo = new Conversation({
            participants: p,
            image: img,
            lastMessageTime: currentDate
          });

          newConvo.save(function(err, newConversation) {
            if (err) {
              res.send({ error: err });
              return next(err);
            }
            res.redirect('/chat/'+newConversation._id)
          });
        }else{
          conversation.participants.push(user._id);
          conversation.save((err, updatedConvo)=>{
            if(err){throw err;}
            res.status(200).send("member added sucess!");
          });
        }
      });
    }
  });
};

//TODO: delete member

// DELETE Route to Delete Conversation
exports.deleteConversation = function(req, res, next) {  
  Conversation.findOneAndRemove({
    $and : [
            { '_id': req.params.conversationId }, { 'participants': req.user._id }
           ]}, function(err) {
        if (err) {
          res.send({ error: err });
          return next(err);
        }

        res.status(200).json({ message: 'Conversation removed!' });
        return next();
  });
}

// PUT Route to Update Message
exports.updateMessage = function(req, res, next) {  
  Conversation.find({
    $and : [
            { '_id': req.params.messageId }, { 'author': req.user._id }
          ]}, function(err, message) {
        if (err) {
          res.send({ error: err});
          return next(err);
        }

        message.body = req.body.composedMessage;

        message.save(function (err, updatedMessage) {
          if (err) {
            res.send({ error: err });
            return next(err);
          }

          res.status(200).json({ message: 'Message updated!' });
          return next();
        });
  });
}