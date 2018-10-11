// Initialize Firebase
var config = {
  apiKey: "AIzaSyAHZmvq1z2qz8ExCc7Abh6pQN5_2ec4x1Y",
  authDomain: "train-scheduler-774dc.firebaseapp.com",
  databaseURL: "https://train-scheduler-774dc.firebaseio.com",
  projectId: "train-scheduler-774dc",
  storageBucket: "train-scheduler-774dc.appspot.com",
  messagingSenderId: "945992589024"
};

firebase.initializeApp(config);

//++++++++++++ Google Login+++++++++
// var provider = new firebase.auth.GoogleAuthProvider();

// function signIn(){
//     firebase.auth().signInWithPopup(provider).then(function(result) {
//     // This gives you a Google Access Token. You can use it to access the Google API.
//     var token = result.credential.accessToken;
//     // The signed-in user info.
//     var user = result.user;
//     console.log(user.displayName);
//     // ...
//   }).catch(function(error) {
//     // Handle Errors here.
//     var errorCode = error.code;
//     var errorMessage = error.message;
//     // The email of the user's account used.
//     var email = error.email;
//     // The firebase.auth.AuthCredential type that was used.
//     var credential = error.credential;
//     // ...
//   });
// }

// $("#logInButton").on("click", function() {
//   signIn();
// });

// +++++++++++++++++++++++++++++++++++++++++

var database = firebase.database();
var ref = database.ref();

var name;
var destination;
var firstTrain;
var frequency;

$("#formSubmit").on("click", function () {

  var nameInput = $("#name-input").val().trim();
  var destInput = $("#destination-input").val().trim();
  var firstTrn = $("#firstTrain-input").val().trim();
  var frq = $("#frequency-input").val().trim();
  var regEx = RegExp("^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");

  if (nameInput == "") {
    alert("Please enter the name of the train.");

  } else if (destInput == "") {
    alert("Please enter the destination of the train.");

  } else if (firstTrn == "") {
    alert("Please enter the time the first train arrives.");

  } else if (regEx.test(firstTrn) == false) {
    alert("Please enter a valid military time.");

  } else if (frq == "") {
    alert("Please enter the frequency the train arrives.");

  } else if (firstTrn.match(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)) {

    name = nameInput;
    destination = destInput;
    firstTrain = firstTrn;
    frequency = frq;

    $("#name-input").val("");
    $("#destination-input").val("");
    $("#firstTrain-input").val("");
    $("#frequency-input").val("");

    ref.push({
      name: name,
      destination: destination,
      firstTrain: firstTrain,
      frequency: frequency,
      currentTime: currentTime
    });
  }

});

//Adding commas to numbers
//Source: https://blog.tompawlak.org/number-currency-formatting-javascript
function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
};

ref.on("child_added", function (snapshot) {

  var fbName = snapshot.val().name;
  var fbDest = snapshot.val().destination;
  var fbFreq = snapshot.val().frequency;
  var formattedFbFreq = formatNumber(snapshot.val().frequency);
  var fbTrn = snapshot.val().firstTrain;

  // First Train: Subtract 1 year to make sure it comes before current time
  var firstTrainConverted = moment(fbTrn, "hh:mm").subtract(1, "years");

  // Time difference between current time and firstTrainConverted
  var timeDiff = moment().diff(firstTrainConverted, "minutes");

  // Remainder of minutes until next train
  var minRemainder = timeDiff % fbFreq;

  // Minutes left until next train 
  var minNextTrain = fbFreq - minRemainder;

  var nextTrainArrival = moment().add(minNextTrain, "minutes");
  var formattedNextTrain = nextTrainArrival.format("hh:mm a");

  //Create dynamic elements 
  var newRow = $("<tr>");
  var newDiv = $("<td>");

  //Adding information to the dynamic table elements
  newRow.append("<td>" + fbName + "</td> <td>" + fbDest + "</td> <td>" + formattedFbFreq + "</td> <td>" + formattedNextTrain + "</td> <td>" + formatNumber(minNextTrain) + "</td> <td> <button keyID= '" + snapshot.key + "' class='delete'>" + "Delete" + "</button> </td>");

  //Append to HTML
  $("#userData").append(newRow);

});

//Event handler for delete buttons
$(document).on("click", ".delete", function (event) {
  event.preventDefault();
  ref.child($(this).attr("keyID")).remove();
  location.reload();
});

//Date Time Display
//Slightly altered from Source: https://stackoverflow.com/questions/10590461/dynamic-date-and-time-with-moment-js-and-setinterval
var datetime = null;
var date = null;

var updateTime = function () {
  date = moment(new Date())
  datetime.html(date.format('dddd, MMMM Do YYYY, h:mm:ss a'));
};

$(document).ready(function () {
  datetime = $('#currentTime')
  updateTime();
  setInterval(updateTime, 1000);
});