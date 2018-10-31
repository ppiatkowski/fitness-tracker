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

function main() {
    document.getElementById('main').style.display = "none";

    const loginSection = document.getElementById('loginSection');
    const userLabel = document.getElementById('user');
    const logoutSection = document.getElementById('logoutSection');
    const txtEmail = document.getElementById('txtEmail');
    const txtPassword = document.getElementById('txtPassword');
    const txtLogin = document.getElementById('btnLogin');
    const txtSignUp = document.getElementById('btnSignUp');
    const txtLogout = document.getElementById('btnLogout');

    btnLogin.addEventListener('click', e => {
        // get email and pass
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();
        const promise = auth.signInWithEmailAndPassword(email, pass);
        promise.catch(e => console.log(e.message));
    });

    btnSignUp.addEventListener('click', e => {
        // get email and pass
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();
        const promise = auth.createUserWithEmailAndPassword(email, pass);
        promise.catch(e => console.log(e.message));
    });

    btnLogout.addEventListener('click', e => {
        firebase.auth().signOut();
    });

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDlR8LNgMLbu2rWfAefC1tiQHHL0JSXOs0",
        authDomain: "fitness-tracker-35452.firebaseapp.com",
        databaseURL: "https://fitness-tracker-35452.firebaseio.com",
        projectId: "fitness-tracker-35452",
        storageBucket: "fitness-tracker-35452.appspot.com",
        messagingSenderId: "1084297687849"
    };
    firebase.initializeApp(config);

    document.addEventListener("DOMContentLoaded", function(){
        drawChart(dataset, flags, targets);

        firebase.auth().onAuthStateChanged(user => {
            console.log("AuthStateChanged user: "+ user)
            if (user) {
                // User is signed in.
                loginSection.classList.add('hide');
                logoutSection.classList.remove('hide');
                // debugger;
                userLabel.innerHTML = "Logged in as "+ (user.displayName ? user.displayName : user.email);
                var displayName = user.displayName;
                var email = user.email;
                var emailVerified = user.emailVerified;
                var photoURL = user.photoURL;
                var uid = user.uid;
                var phoneNumber = user.phoneNumber;
                var providerData = user.providerData;
                user.getIdToken().then(function(accessToken) {
                    document.getElementById('main').style.display = "block";
                });
            } else {
                // User is signed out.
                loginSection.classList.remove('hide');
                logoutSection.classList.add('hide');
                document.getElementById('main').style.display = "none";
            }
        }, function(error) {
            console.log(error);
        });
    });
}

main();
