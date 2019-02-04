// console.log(Hackathon);
// console.log(result);
// console.log(currentHacker);

$('#conversation-list-container').attr('class','main');
$('#attendHackathon').attr('action', window.location.href+"/attend");

$('#logo').attr('src', Hackathon.logo);
$('#name').text(Hackathon.name || "");
$('#university').text(Hackathon.university || "");
$('#location').text(Hackathon.city || "");
$('<span>, '+Hackathon.state+'</span>').appendTo('#location')

var startDate = moment(Hackathon.startDate);
var endDate = moment(Hackathon.endDate);
var dateText = startDate.format('MMM Do') + " - " + endDate.format('MMM Do');
$('#date').text(dateText);
$('#website').attr('href', Hackathon.url);

//------------------ajax attend hackathon----------------
$('#successResponse').hide();
$('#errorResponse').hide();

var CSRF_HEADER = 'X-CSRF-Token';

var setCSRFToken = function (securityToken) {
  jQuery.ajaxPrefilter(function (options, _, xhr) {
    if (!xhr.crossDomain) {
      xhr.setRequestHeader(CSRF_HEADER, securityToken);
    }
  });
};

setCSRFToken($('meta[name="csrf-token"]').attr('content'));
$('#attendHackathonButton').on('click', (event)=>{
	event.preventDefault();
	$.ajax({
		type:"POST",
		url:window.location.href+"/attend",
		success: (data)=>{
			//console.log(data);
			$('#successResponse').text(data);
			$('#successResponse').show();
		},
		error: (jqXHR, textStatus, err)=>{
			//console.log(jqXHR.status);
			//console.log(err);
			$('#errorResponse').text(data);
			$('#errorResponse').show()
		},
		
	});
});



//----------------------top hackers----------------------
$('#pref').on('click', ()=>{
	location.href = window.location.origin+"/preferences";
});
$('#showVis').on('click', ()=>{
	window.location.replace(window.location.href+"/visualization");
});
$('#allHackers').attr('href', window.location.href+'/visualization');
if(result == false){
	$('#app').hide();
	$('#zerohackers').hide();
	$('#fillPrefMessage').hide();
	$('#zeromatch').hide();
	$('#serverError').hide();

	$('#showVis').hide();
	$('#changePrefMessage').show();

}else if(result == -1){
	$('#app').hide();
	$('#serverError').hide();
	$('#changePrefMessage').hide();
	$('#fillPrefMessage').hide();
	$('#zeromatch').hide();
	$('#showVis').hide();
	$('#zerohackers').show();
}else if(result == 404){
	$('#app').hide();
	$('#serverError').show();
	$('#changePrefMessage').hide();
	$('#zerohackers').hide();
	$('#zeromatch').hide();
	$('#showVis').hide();
	$('#fillPrefMessage').hide();
}else if(result == 500){
	$('#serverError').hide();
	$('#changePrefMessage').hide();
	$('#zerohackers').hide();
	$('#fillPrefMessage').hide();
	$('#app').hide();
	$('#showVis').hide();
	$('#zeromatch').show();
}else if(result == 302){
	$('#app').hide();
	$('#serverError').hide();
	$('#changePrefMessage').hide();
	$('#zerohackers').hide();
	$('#zeromatch').hide();
	$('#showVis').hide();
	$('#fillPrefMessage').show();
}else{
	$('#serverError').hide();
	$('#changePrefMessage').hide();
	$('#zerohackers').hide();
	$('#fillPrefMessage').hide();
	$('#zeromatch').hide();

	$('#showVis').show();
	$('#app').show();

	//currentHackerInterests = ["Machine Learning", "AI"...]
	var currentHackerInterests = [];
	var currentHackerLanguages = [];
	var currentHackerTech = [];
	var currentHackerFields = [];
	var tempArr = currentHacker['preferences']['interests'];
	for(i = 0; i < tempArr.length; i++){
		currentHackerInterests.push(tempArr[i][0]);
	}
	tempArr = currentHacker['preferences']['languages'];
	for(i = 0; i < tempArr.length; i++){
		currentHackerLanguages.push(tempArr[i][0]);
	}
	tempArr = currentHacker['preferences']['technologies'];
	for(i = 0; i < tempArr.length; i++){
		currentHackerTech.push(tempArr[i][0]);
	}
	tempArr = currentHacker['preferences']['fields'];
	for(i = 0; i < tempArr.length; i++){
		currentHackerFields.push(tempArr[i][0]);
	}
	//preferences = common preferences between current hacker and all top ten hackers
	//currentHackerInterests = [a,b,c]    result[0]['preferences']['interests'] = [a]
	//currentHackerLanguages = [d,e,f]	  result[0]['preferences']['languages'] = [e]
	//prefernces[0] = [a,e]
	var hackers = [];  //preferences[i] = common preferences between thisHacker and hacker[i]
	//console.log(result);
	for(let i = 0; i < result.length; i++){
		var thishackerpref = []; //array of common preferences
		const interestsArr = result[i]['preferences']['interests'];
		const languagesArr = result[i]['preferences']['languages'];
		const technologiesArr = result[i]['preferences']['technologies'];
		const fieldsArr = result[i]['preferences']['fields'];

	    var	temp = [];
		for(let j = 0; j < interestsArr.length; j++){
			if(currentHackerInterests.includes(interestsArr[j][0])){
				temp.push(interestsArr[j][0]);
			}
		}
		thishackerpref.push(temp);
		temp = [];
		for(let j = 0; j < languagesArr.length; j++){
			if(currentHackerLanguages.includes(languagesArr[j][0])){
				temp.push(languagesArr[j][0]);
			}
		}
		thishackerpref.push(temp); 
		var	temp = [];
		for(let j = 0; j < technologiesArr.length; j++){
			if(currentHackerTech.includes(technologiesArr[j][0])){
				temp.push(technologiesArr[j][0]);
			}
		}
		thishackerpref.push(temp);
		var	temp = [];
		for(let j = 0; j < fieldsArr.length; j++){
			if(currentHackerFields.includes(fieldsArr[j][0])){
				temp.push(fieldsArr[j][0]);
			}
		}
		thishackerpref.push(temp);
		var thishackerabout = [];
		var temp2 = result[i].profile;
		temp2['email'] = result[i].email;

		var temp3 = [];
		temp3.push(temp2);
		temp3.push(thishackerpref);

		hackers.push(temp3);
	}
	app = new Vue({
		el: '#app',
		data:{
			hackers: hackers
		}
	});
	
}

