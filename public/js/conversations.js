var allConversations = [];
var allConversationsHash = {};
//TODO: run only when user is logged in
var CSRF_HEADER = 'X-CSRF-Token';

var setCSRFToken = function (securityToken) {
  jQuery.ajaxPrefilter(function (options, _, xhr) {
    if (!xhr.crossDomain) {
      xhr.setRequestHeader(CSRF_HEADER, securityToken);
    }
  });
};
setCSRFToken($('meta[name="csrf-token"]').attr('content'));
$(document).ready(()=>{
	$.ajax({
		type:"POST",
		url:"http://localhost:8080/chat/",
		success: function(data){
			//console.log(data);
			if(typeof data ==='object'){
				for (var key in data) {
				    if (data.hasOwnProperty(key)) {
				    	var temp = [key, data[key]];
				    	allConversations.push(temp);
				    	allConversationsHash[key] = data[key];
				    	/*var conversation = $('<li>');
				    	conversation.attr('class', 'chat-item');
				    	var conversationLink = $('<a>').attr('href', "http://localhost:8080/chat/"+key).appendTo(conversation);
				    	var conversationImg = $('<img>').attr('src', data[key]);
				    	conversationImg.attr('id', key);
				    	conversationImg.attr('class', "chat-heads");
				    	conversationImg.appendTo(conversationLink);
				    	$('#conversation-list').append(conversation);*/
				    }
				}
			}
		},
	    error : function(request,error)
	    {
	    	//TODO: handle this on the front-end (replace no chats yet with "there is an error with the server")
	        //console.log("there is an error with the server");
	    },
	    completed:function(req, err){
	    	//console.log("process completed");
	    }
	});

	//Vue app for conversation bar front end. 
	var app = new Vue({
		el:'#conversation-list',
		data:{
			allConversations: allConversations,
			componentKey: 0
		},
		methods: {
		    forceRerender() {
		      this.componentKey += 1;  
		    }
		  }
	});

	var socket = io();
	//on new message, find the index of the new message conversation, delete it on the front end end enqueue it
	socket.on('new message', function(sender, msg, conversationId){
		if(conversationId in allConversationsHash){//if new message is not a new conversation
			//delete old message icon
			var img = allConversationsHash[conversationId];
			delete allConversations[conversationId];
			//enqueue
			allConversations.push([conversationId, img]);
			app.forceRerender();
		}

	});

});



