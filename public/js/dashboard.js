

$('#editProfile').on('click', (event)=>{
	event.preventDefault();
    $('.settings').css({
        'display': 'block'

    });
    $('.content').css({
        'display': 'none'
    });
});


//----------------------about content-----------------------
$('#pfp').attr('src', User.profile.picture);
$('#name').text(User.name || '');
$('#gender').text(User.profile.gender || '');
$('#school').text(User.profile.school || '');
$('#major').text(User.profile.major || '');
$('#gradYear').text(User.profile.graduationYear || '');
$('#eduLevel').text(User.profile.educationLevel || '');
$('#numOfHacks').text('0');
if(User.numOfHackathons){
	var numOfHackathonsTemp = User.numOfHackathons.toString();
	if(numOfHackathonsTemp == "1"){
		$('#numOfHacks').text("1");
	}else if(numOfHackathonsTemp == "2"){
		$('#numOfHacks').text("2-4");
	}else if(numOfHackathonsTemp == "3"){
		$('#numOfHacks').text("5-9");
	}else if(numOfHackathonsTemp == "4"){
		$('#numOfHacks').text("10+");
	}
}

$('#aboutMe').text(User.profile.about || '');
$('#aboutMeSettings').text(User.profile.about || '');
if(User.numOfHackathons){
	$('#numOfHackathonsSettings').attr('value', User.numOfHackathons);
}else{
	$('#numOfHackathonsSettings').attr('value',0);
}

//--------------------social media------------------------
var socialmedias = []
for (var key in User.socialmedia){
	if(User.socialmedia.hasOwnProperty(key)){
		if(User.socialmedia[key].toString() == '' || key.toLowerCase() == 'tokens'){
			continue;
		}else{
			var temp = [];
			temp.push(key);
			temp.push(User.socialmedia[key]);
			socialmedias.push(temp);
		}
	}
}

socialmedia = new Vue({
	el: "#socialmedia-app",
	data:{
		socialmedias: socialmedias
	}
});
//populate social media settings
$('#website-s').val(User.socialmedia['website'] || "");
$('#github-s').val(User.socialmedia['github'] || "");
$('#devpost-s').val(User.socialmedia['devpost'] || "");
$('#facebook-s').val(User.socialmedia['facebook'] || "");
$('#instagram-s').val(User.socialmedia['instagram'] || "");
$('#linkedin-s').val(User.socialmedia['linkedin'] || "");


//-------------------preferences---------------------
//If user does not have any preferences, set that field to []

ints = [];
allInts=[];

for(i = 0; i < User.preferences.interests.length; i++){
	ints.push(User.preferences.interests[i][0]);
}
$.getJSON('/assets/interests.json', (data) =>{
	for (i = 0; i < data.length; i++){
		if(!ints.includes(data[i]['name'])){
			allInts.push(data[i]['name']);
		}
	}
});

langs = []
for(i = 0; i < User.preferences.languages.length; i++){
	langs.push(User.preferences.languages[i][0]);
}
allLanguages=[]
$.getJSON('/assets/languages.json', (data) =>{
	for (i = 0; i < data.length; i++){
		if(!langs.includes(data[i]['name'])){
			allLanguages.push(data[i]['name']);
		}
	}
});

techs = [];
for(i = 0; i < User.preferences.technologies.length; i++){
	techs.push(User.preferences.technologies[i][0]);
}
allTechs=[];
$.getJSON('/assets/technologies.json', (data) =>{
	for (i = 0; i < data.length; i++){
		if(!techs.includes(data[i]['name'])){
			allTechs.push(data[i]['name']);
		}
	}
});	

fields = [];
for(i = 0; i < User.preferences.fields.length; i++){
	fields.push(User.preferences.fields[i][0]);
}
allFields=[];
$.getJSON('/assets/fields.json', (data) =>{
	for (i = 0; i < data.length; i++){
		if(!fields.includes(data[i]['name'])){
			allFields.push(data[i]['name']);
		}
	}
});	
app = new Vue({
	el:'#app',
	data:{
		interests: User.preferences.interests,
		languages: User.preferences.languages,
		technologies: User.preferences.technologies,
		fields: User.preferences.fields,
		allFields: allFields,
		allInterests: allInts,
		allTechnologies: allTechs,
		allLanguages: allLanguages

	},
	computed:{
		totalLanguages(){
			return this.languages.reduce((sum) => {
				return sum+1;
			},0);
		},
		totalInterests(){
			return this.interests.reduce((sum) => {
				return sum+1;
			},0);
		},
		totalTechnologies(){
			return this.technologies.reduce((sum) => {
				return sum+1;
			},0);
		},
		totalFields(){
			return this.fields.reduce((sum) => {
				return sum+1;
			},0);
		}
	},
	methods: {
		deleteLanguage: function(index, lan) {
			this.$delete(this.languages, index);
			this.allLanguages.push(lan[0]);
		},
		addLanguage:function(lan, index){
			if(this.languages.length <= 5){
				var temp = [lan, 5];
				this.languages.push(temp);
				this.allLanguages.splice(allLanguages.indexOf(lan),1);
			}
		},
		deleteInterest: function(index, int) {
			this.$delete(this.interests, index);
			this.allInterests.push(int[0]);
		},
		addInterest:function(int, index){
			if(this.interests.length <= 5){
				var temp = [int, 5];
				this.interests.push(temp);
				this.allInterests.splice(this.allInterests.indexOf(int),1);
			}
		},
		deleteTechnology: function(index, lan) {
			this.$delete(this.technologies, index);
			this.allTechnologies.push(lan[0]);
		},
		addTechnology:function(lan, index){
			if(this.technologies.length <= 5){
				var temp = [lan, 5];
				this.technologies.push(temp);
				this.allTechnologies.splice(this.allTechnologies.indexOf(lan),1);
			}
		},
		deleteField: function(index, lan) {
			this.$delete(this.fields, index);
			this.allFields.push(lan[0]);
		},
		addField:function(lan, index){
			if(this.fields.length <= 5){
				var temp = [lan, 5]
				this.fields.push(temp);
				this.allFields.splice(this.allFields.indexOf(lan),1);
			}
		}
	}
});

$('#app > input').keypress(function(e) {
    e.preventDefault();
});

/**
 *================================ABOUT===================================== 
 */

//display chosen picture in frame
$(document).on('change', '.btn-file :file', function () {
	var input = $(this),
		label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
	input.trigger('fileselect', [label]);
});
$('.btn-file :file').on('fileselect', function (event, label) {
	var input = $(this).parents('.input-group').find(':text'),
		log = label;
	if (input.length) {
		input.val(log);
	} else {
		if (log) alert(log);
	}
});

function readURL(input) {

  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function(e) {
      $('#pfp').attr('src', e.target.result);
    }

    reader.readAsDataURL(input.files[0]);
  }
}

$("#imgInp").change(function() {
  readURL(this);
});




$('#gender-select').val(User.profile.gender);

//populate schools select
// $.getJSON('/assets/colleges.json', (data) =>{
// 	$('#school-select').select2({data: data});
// });

//Populate majors select
$.getJSON('/assets/majors.json', (data) =>{
	for (i = 0; i < data.length; i++){
		var option = new Option(data[i]['major'], data[i]['major'], false, false);
		$('#major-select').append(option);
	}
	$('#major-select').val(User.profile.major);
});

$('#gradYear-select').val(User.profile.graduationYear);
$('#eduLevel-select').val(User.profile.educationLevel);

//---------submit form
$('#submitProfileImage').on('click', (e)=>{
	e.preventDefault();
	if ($('#imgInp').get(0).files.length != 0) {
	    $('#profileImgForm').submit();
	}
});

$('#submitUpdateProfile').on('click', ()=>{
	$('#profileForm').submit();
});