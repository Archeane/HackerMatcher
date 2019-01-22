
for(i = 0; i < Hackathons.length; i++){
	var Hackathon = Hackathons[i];
	for(var key in Hackathon){
		if(Hackathon.hasOwnProperty(key)){
			if(key.toString() === "startDate" || key.toString() === "endDate"){
				var date = moment(Hackathon[key]);
				Hackathons[i][key] = date.format('MMM Do');
			}
		}
	}
}


var app = new Vue({
	el:'#app',
	data:{
		allhackathons: Hackathons
	}
});