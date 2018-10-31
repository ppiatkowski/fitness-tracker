"use strict";

// TODO feature - volume calculator

const datapoints = [new DataPoint(new Date(2018, 6, 1), 73.2)]; 
const dataset = new Dataset(datapoints)
const flags = [new Flag("deload", new Date(2018, 7, 1), 'rgba(255, 0, 0, 0.8)')];
const targets = [new Target("next target", 70.0, 'rgba(0, 150, 0, 0.8)'), new Target("ideal", 68.0, 'rgba(0, 100, 0, 0.8')];

var currentDate = new Date(2018, 6, 2);

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function logout() {
    firebase.auth().signOut()
        .then(function() {
            console.log("Logged out");
        })
        .catch(function(error) {
            console.log("Failed to logout");
    });
}

function addDataPoint() {
    const delta = 0.45 - Math.random();
    const value = dataset.datapoints[dataset.datapoints.length - 1].value + delta;
    console.log("Adding data point("+currentDate+" value=", value);
    dataset.addDataPoint(new DataPoint(currentDate, value));
    currentDate = currentDate.addDays(2);
    drawChart(dataset, flags, targets);
}

function addFlag() {
    console.log("Adding flag at "+currentDate);

    flags.push(new Flag("Flag", currentDate, 'rgba(255, 0, 0, 0.8)'));
    drawChart(dataset, flags, targets);
}

function drawChart(dataset, flags, targets) { 
    var ctx = document.getElementById("myChart").getContext('2d');
    const chartModel = new ChartModel(dataset, flags, targets);
    const config = new ChartConfig(chartModel);

    if (chart == null) {
        chart = new Chart(ctx, config);
    }
    else {
        chart.data.datasets[0].data = chartModel.dataset.getDataArray();
        chart.options = config.options;
        chart.update();
    }
}

// Firebase
function initApp() {
    firebase.auth().onAuthStateChanged(user => {
        console.log("AuthStateChanged user: "+ user)
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var uid = user.uid;
            var phoneNumber = user.phoneNumber;
            var providerData = user.providerData;
            user.getIdToken().then(function(accessToken) {
                document.getElementById('login').style.display = "none";
                document.getElementById('main').style.display = "block";
                document.getElementById('sign-in-status').textContent = 'Signed in';
                document.getElementById('account-details').textContent = JSON.stringify({
                    displayName: displayName,
                    email: email,
                    emailVerified: emailVerified,
                    phoneNumber: phoneNumber,
                    photoURL: photoURL,
                    uid: uid,
                    accessToken: accessToken,
                    providerData: providerData
                }, null, '  ');
            });
        } else {
            // User is signed out.
            document.getElementById('login').style.display = "block";
            document.getElementById('main').style.display = "none";
            document.getElementById('sign-in-status').textContent = 'Signed out';
            document.getElementById('account-details').textContent = 'null';
        }
    }, function(error) {
        console.log(error);
    });
};

function main() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDlR8LNgMLbu2rWfAefC1tiQHHL0JSXOs0",
        authDomain: "fitness-tracker-35452.firebaseapp.com",
        databaseURL: "https://fitness-tracker-35452.firebaseio.com",
        projectId: "fitness-tracker-35452",
        storageBucket: "fitness-tracker-35452.appspot.com",
        messagingSenderId: "1084297687849"
    };

    document.getElementById('login').style.display = "none";
    document.getElementById('main').style.display = "none";
    firebase.initializeApp(config);
    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());

    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                console.log("Used signed in successfully")
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                return false;
            },
            uiShown: function() {
                // The widget is rendered.
                // Hide the loader.
                document.getElementById('loader').style.display = 'none';
            }
        },
        signInFlow: 'redirect',
        signInSuccessUrl: '<url-to-redirect-to-on-success>',
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>',
        // Privacy policy url.
        privacyPolicyUrl: '<your-privacy-policy-url>'
    };

    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);

    document.addEventListener("DOMContentLoaded", function(){
        drawChart(dataset, flags, targets);

        initApp();
    });
}

main();
