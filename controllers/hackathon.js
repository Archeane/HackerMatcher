const { promisify } = require('util');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
var spawn = require("child_process").spawn;
const { fork } = require('child_process');


function createTestUsers(k){
	var fs = require('fs');
	const allInterests = require('../public/assets/interests.json');
	const allLanguages = require('../public/assets/languages.json');
	const allTechnologies = require('../public/assets/technologies.json');
	const allFields = require('../public/assets/fields.json');
	const allMajors = require('../public/assets/majors.json');
	const allSchools = require('../public/assets/universities.json');
	const random_name = require('node-random-name');
	
	var interests1 = [];
	var languages1 = [];
	var fields1 = [];
	var technologies1 = [];
	var major1;

	var n = Math.random()*5;
	for (i = 0; i < n; i++){
		var temp = [];
		temp.push(allInterests[Math.floor(Math.random()*allInterests.length)]['name']);
		temp.push(Math.random()*10);
		temp.push(Math.random()*10);
		interests1.push(temp);
	}
	n = Math.random()*5;
	for (i = 0; i < n; i++){
		var temp = [];
		temp.push(allLanguages[Math.floor(Math.random()*allLanguages.length)]['name']);
		temp.push(Math.random()*10);
		languages1.push(temp);
	}
	n = Math.random()*5;
	for (i = 0; i < n; i++){
		var temp = [];
		temp.push(allTechnologies[Math.floor(Math.random()*allTechnologies.length)]['name']);
		temp.push(Math.random()*10);
		technologies1.push(temp);
	}
	n = Math.random()*5;
	for (i = 0; i < n; i++){
		var temp = [];
		temp.push(allFields[Math.floor(Math.random()*allFields.length)]['name']);
		temp.push(Math.random()*10);
		fields1.push(temp);
	}
	major1 = allMajors[Math.floor(Math.random()*allMajors.length)]['major'];
	school1 = allSchools[Math.floor(Math.random()*allSchools.length)]['institution'];


	var Email = k.toString()+"@gmail.com";
	const user = new User({
		email: Email,
		numOfHackathons: Math.floor(Math.random()*5)
	});
	if(k % 2 == 0){
		user.profile.picture = 'https://randomuser.me/api/portraits/women/'+Math.floor(Math.random()*99)+'.jpg';
	}else{
		user.profile.picture = 'https://randomuser.me/api/portraits/men/'+Math.floor(Math.random()*99)+'.jpg';
	}
	user.preferences.interests = interests1;
	user.preferences.languages = languages1;
	user.preferences.fields = fields1;
	user.preferences.technologies = technologies1;
	user.profile.name = random_name();
	user.profile.major = major1;
	user.profile.school = school1;
	user.profile.graduationYear = Math.floor(2018+Math.random()*5);
	user.profile.educationLevel = "Undergraduate";
	user.careScores.interests = Math.floor(Math.random()*5);
	user.careScores.languages = Math.floor(Math.random()*5);
	user.careScores.technologies = Math.floor(Math.random()*5);
	user.careScores.fields = Math.floor(Math.random()*5);
	return user;

	
}

exports.createTestUsers = async(req, res, next) =>{
	userArr = [];
	for(let i = 1; i < 40; i++){
		var user = await createTestUsers(i);
		userArr.push(user);
	}
	try{
		//console.log('userArr', userArr.length);
		User.insertMany(userArr, {ordered:false});
		var userArrEmails = [];
		for(i = 0; i < userArr.length; i++){
			userArrEmails.push(userArr[i].email);
		}
	}catch(err){
		//console.log(err);
		req.flash('error', {msg:"Server Error, please try again later"});
		next(err);
	}
	let hackathon = await Hackathon.findOne({id:req.params.id});
	if(hackathon == null){
		throw new Error("The hackathon does not exist.");
	}
	hackathon.hackers = userArrEmails;
	hackathon.save();
};


let pleasework = false;

//TODO:
// 1. add corresponding fields for test users after users controllers is finished
// 2. Redirect preferences back to the hackathon page 
exports.getHackathon = async(req,res, next) => {
	let hackathon = await Hackathon.findOne({id: req.params.id});
	//verify user has filled in carescores
	if(req.user.careScores.interests == -1 && req.user.careScores.languages == -1 && req.user.careScores.technologies == -1 && req.user.careScores.fields == -1){
		return res.render('hackathon', {
			title: hackathon.name, Hackathon: hackathon, result: false, currentHacker: req.user
		});
	}else if(req.user.preferences.languages.length == 0 &&
				req.user.preferences.technologies.length == 0 &&
				req.user.preferences.fields.length == 0){
		return res.render('hackathon', {
			title: hackathon.name, Hackathon: hackathon, result: 302, currentHacker: req.user
		});
	}else if(hackathon.hackers.length == 0 || (hackathon.hackers.length == 1 && hackathon.hackers.toString().includes(req.user._id.toString()))){
		return res.render('hackathon', {
			title: hackathon.name, Hackathon: hackathon, result: -1, currentHacker: req.user
		});
	}else{
		/*if(hackathon.hackers.length == 2 && hackathon.hackers.toString().includes(req.user._id.toString())){
			return res.render('hackathon', {
				title: hackathon.name, Hackathon: hackathon, result: hackathon.hackers, currentHacker: req.user
			});
		}*/
		console.log('140');
		var process = spawn('python', ["./algorithmn/process.py", req.user.email, hackathon.id]);
		var processedData = false;
		process.stdout.on('data', function(data){
			console.log('144');
			processedData = data.toString();
			console.log(processedData);
		});

		process.stdout.on('end', function(){
			console.log('148');
			console.log(processedData);
			if(processedData != false){
				var arr = eval("["+processedData+"]")[0];
				console.log(ar);
				pleasework = arr;
				if(arr.length > 0){
					if(arr.length >= 10){
						arr = arr.slice(0, 10);
					}
					var toptenhackers = [];
					var found = arr.length-1;
					console.log('162');
					arr.forEach((hacker) =>{
						console.log(hacker[0]);
						User.findOne({'_id': hacker[0]}, (err, user)=>{
							console.log(user);
							if(err){throw err;}
							toptenhackers.push(user);
							found--;
							if(found <= 0){
								res.render('hackathon', {
									title: hackathon.name, Hackathon: hackathon, result: toptenhackers, currentHacker: req.user
								});
							}
						});
					}); //end of foreach
				}else{
					console.log('178');
					pleasework = -1;
					res.render('hackathon', {
						title: hackathon.name, Hackathon: hackathon, result: 500, currentHacker: req.user
					});
				}
			}else{
				console.log('185');
				return res.render('hackathon', {
					title: hackathon.name, Hackathon: hackathon, result: 404, currentHacker: req.user
				});
			}
		});

		/*var zerorpc = require("zerorpc");
		var client = new zerorpc.Client();
		client.connect("tcp://127.0.0.1:80");
		console.log('140');
		client.invoke("hello", req.user.email, hackathon.id, async(err, response, more)=>{
			console.log('142');
			if(response){
				console.log('144');
				console.log(response);
			}else{
				console.log('147');
				return res.render('hackathon', {
					title: hackathon.name, Hackathon: hackathon, result: 404, currentHacker: req.user
				});
			}
			if(response){
				console.log(response);
				var emails = response;
				pleasework = response; //global variable- save matching algorithmn result for visualization
				if(emails.length >= 10){
					emails = emails.slice(0,10);
				}
				var toptenhackers = [];
				var found = emails.length-1;
				if(emails.length == 0){ //no matching hackers
					pleasework = -1;
					res.render('hackathon', {
						title: hackathon.name, Hackathon: hackathon, result: 500, currentHacker: req.user
					});
				}else{
					emails.forEach((hacker) =>{
						User.findOne({'_id': hacker[0]}, (err, user)=>{
							console.log(user);
							console.log(found);
							if(err){throw err;}
							toptenhackers.push(user);
							found--;
							if(found <= 0){
								res.render('hackathon', {
									title: hackathon.name, Hackathon: hackathon, result: toptenhackers, currentHacker: req.user
								});
							}
						});
					}); //end of foreach
				}
			}else{
				return res.status(404).send("Error! Sorry, the server is experiencing problems right now. Please try again later.");	
			}
		});*/
	}
};

exports.getHackathonVisualization = (req, res, next) =>{
	if(pleasework == false){
		Hackathon.findOne({id:req.params.id}, (err, hackathon)=>{
			if(err){return next(err);}
			var process = spawn('python', ["./algorithmn/process.py", req.user.email, hackathon.id]);
			var processedData = false;
			process.stdout.on('data', function(data){
				processedData = data.toString();
			});

			process.stdout.on('end', function(){
				if(processedData != false){
					var topfiftyhackers;
					if(processedData.length >= 50){
						topfiftyhackers = processedData.slice(0, 50); 
					}else{
						topfiftyhackers = processedData;
					}
					var minifiedUsers = [];						//array of top 50 hackers with minified data
					new Promise(async(resolve, reject) => {
						for(let hacker of topfiftyhackers){
							try{
								let data = await User.findOne({'_id':hacker[0]});
								var user = JSON.stringify({
									"id": data._id,
									"email":data.email,
									"numOfHackathons":data.numOfHackathons,
									"name": data.profile.name,
									"profileurl": data.profile.picture,
									"school":data.profile.school,
									"major":data.profile.major,
									"graduationYear":data.profile.graduationYear,
									"educationLevel":data.profile.educationLevel,
									"score": hacker[1]
								});
								//console.log(user);
								minifiedUsers.push(user);
							}catch(err){continue;}
						}
						//console.log(minifiedUsers);
						resolve(minifiedUsers);
					}).then(function(result){
						if(minifiedUsers && minifiedUsers.length >= 0){
							res.render('visualization', {
								title:'Visualization', matches: result
							});
						}else{
							res.render('visualization', {
								title:'Visualization', matches: false
							});
						}
					}, function(err){
						return next(err);
					});
				}
			});

			/*var zerorpc = require("zerorpc");

			var client = new zerorpc.Client();
			client.connect("tcp://127.0.0.1:4242");
			client.invoke("hello", req.user._id, hackathon.id, function(error, response, more) {
				let topfiftyhackers;
				if(response){
					if(response.length >= 50){
						topfiftyhackers = response.slice(0, 50); 
					}else{
						topfiftyhackers = response;
					}
					var minifiedUsers = [];						//array of top 50 hackers with minified data
					new Promise(async(resolve, reject) => {
						for(let hacker of topfiftyhackers){
							try{
								let data = await User.findOne({'_id':hacker[0]});
								var user = JSON.stringify({
									"id": data._id,
									"email":data.email,
									"numOfHackathons":data.numOfHackathons,
									"name": data.profile.name,
									"profileurl": data.profile.picture,
									"school":data.profile.school,
									"major":data.profile.major,
									"graduationYear":data.profile.graduationYear,
									"educationLevel":data.profile.educationLevel,
									"score": hacker[1]
								});
								//console.log(user);
								minifiedUsers.push(user);
							}catch(err){continue;}
						}
						//console.log(minifiedUsers);
						resolve(minifiedUsers);
					}).then(function(result){
						if(minifiedUsers && minifiedUsers.length >= 0){
							res.render('visualization', {
								title:'Visualization', matches: result
							});
						}else{
							res.render('visualization', {
								title:'Visualization', matches: false
							});
						}
					}, function(err){
						return next(err);
					});
				}else{
					var allHackers = hackathon.hackers;
					var minifiedUsers = [];
					new Promise(async(resolve, reject) => {
						for(let hacker of allHackers){
							try{
								let data = await User.findOne({'_id':hacker[0]});
								var user = JSON.stringify({
									"id": data._id,
									"email":data.email,
									"numOfHackathons":data.numOfHackathons,
									"name": data.profile.name,
									"profileurl": data.profile.picture,
									"school":data.profile.school,
									"major":data.profile.major,
									"graduationYear":data.profile.graduationYear,
									"educationLevel":data.profile.educationLevel,
									"score": 1
								});
								minifiedUsers.push(user);
							}catch(err){continue;}
						}
						resolve(minifiedUsers);
					}).then(function(result){
						if(result && result.length > 0){
							res.render('visualization', {
								title:'Visualization', matches: result
							});
						}else{
							res.render('visualization', {
								title:'Visualization', matches: false
							});
						}
					}, function(err){
					return next(err);
					});
				}
			});*/
			
		});
	}else if(pleasework == -1){
		Hackathon.findOne({id:req.params.id}, (err, hackathon)=>{
			if(err){
				req.flash('error',{msg:"Hackathon is not found"});
				return next(err);
			}
			var allHackers = hackathon.hackers;
			var minifiedUsers = [];
			new Promise(async(resolve, reject) => {
				for(let hacker of allHackers){
					try{
						let data = await User.findOne({'_id':hacker[0]});
						var user = JSON.stringify({
							"id": data._id,
							"email":data.email,
							"numOfHackathons":data.numOfHackathons,
							"name": data.profile.name,
							"profileurl": data.profile.picture,
							"school":data.profile.school,
							"major":data.profile.major,
							"graduationYear":data.profile.graduationYear,
							"educationLevel":data.profile.educationLevel,
							"score": 1
						});
						minifiedUsers.push(user);
					}catch(err){continue;}
				}
				resolve(minifiedUsers);
			}).then(function(result){
				if(result && result.length > 0){
					res.render('visualization', {
						title:'Visualization', matches: result
					});
				}else{
					res.render('visualization', {
						title:'Visualization', matches: false
					});
				}
			}, function(err){
			return next(err);
			});
		});
	}else{
		var topfiftyhackers = pleasework;
		var minifiedUsers = [];
		new Promise(async(resolve, reject) => {
				for(let hacker of topfiftyhackers){
					try{
						let data = await User.findOne({'_id':hacker[0]});
						var user = JSON.stringify({
							"id": data._id,
							"email":data.email,
							"numOfHackathons":data.numOfHackathons,
							"name": data.profile.name,
							"profileurl": data.profile.picture,
							"school":data.profile.school,
							"major":data.profile.major,
							"graduationYear":data.profile.graduationYear,
							"educationLevel":data.profile.educationLevel,
							"score": hacker[1]
						});
						//console.log(user);
						minifiedUsers.push(user);
					}catch(err){continue;}
				}	
			
			resolve(minifiedUsers);
			//console.log(minifiedUsers);
		}).then(function(result){
			if(result && result.length > 0){
				res.render('visualization', {
					title:'Visualization', matches: result
				});
			}else{
				res.render('visualization', {
					title:'Visualization', matches: false
				});
			}
		}, function(err){
			return next(err);
		});
	}
	


};

exports.postAttend = async (req, res, next) =>{
	if(req.user){
		try{
			let hackathon = await Hackathon.findOne({id: req.params.id});
			if(hackathon.hackers && !hackathon.hackers.toString().includes(req.user._id)){
				hackathon.hackers.push(req.user._id);
				await hackathon.save();
				res.status(200).send("Success, you have been registered");
			}else{
				res.status(200).send("You are already registered!");
			}
		}catch(err){
			res.status(404).send("Sorry, an error occured in the server");
			return next(err);
		}
	}else{
		return res.status(500).send("Sorry, you must be logged in to perform this request");
	}
}

