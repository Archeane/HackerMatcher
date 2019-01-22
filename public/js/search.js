//auto search on search bar
var typingTimer;                //timer identifier
var doneTypingInterval = 1000;  //time in ms (1.5 seconds)
var CSRF_HEADER = 'X-CSRF-Token';

var setCSRFToken = function (securityToken) {
  jQuery.ajaxPrefilter(function (options, _, xhr) {
    if (!xhr.crossDomain) {
      xhr.setRequestHeader(CSRF_HEADER, securityToken);
    }
  });
};


$('#searchContent').keyup(function(){
    clearTimeout(typingTimer);
    var content = $('#searchContent').val()
    if (content) {
      typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
    function doneTyping(){
      $.ajax({
          type: 'POST',
          url: '/search?query='+content,
          complete: function() {
            //console.log('process complete');
          },
          data:{
            query: content
          },
          success: function(data) {
            //console.log(data);
            //empty datalist on each search, then append search results to datalist
            $('#potentials').empty();
            for(i = 0; i < data.length; i++){
              data[i].forEach((d)=>{
                $("#potentials").append($("<option>").text(d.name));
              });
            }
            //console.log('process sucess');
          },
          error: function() {
            //console.log('process error');
          }
      });
    }
});

//pressing the search button -> redirect to search results page
$('#searchForm').submit((e)=>{
  e.preventDefault();
  var content = $('#searchContent').val();
  //console.log(content)
  $.ajax({
      type: 'POST',
      url: '/search/'+content,
      complete: function() {
        console.log('process complete');
      },

      success: function(data) {
        console.log(data);
        //TODO: on front end, display search results
        console.log('process sucess');
      },

      error: function() {
        console.log('process error');
      }
  });

  return false;
});