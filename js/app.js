"use strict";

// TODO feature - volume calculator

var datapoints = [new DataPoint(new Date(2018, 6, 1), 73.2)]; 
var dataset = new Dataset(datapoints);
var flags = [new Flag("deload", new Date(2018, 7, 1), "rgba(255, 0, 0, 0.8)")];
var targets = [new Target("next target", 70.0, "rgba(0, 150, 0, 0.8)"), new Target("ideal", 68.0, "rgba(0, 100, 0, 0.8)")];

var currentUser = null;
var chartSetupShown = false;

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

function resetData() {
    datapoints = [new DataPoint(new Date(2018, 6, 1), 73.2)]; 
    dataset = new Dataset(datapoints);
    flags = [new Flag("deload", new Date(2018, 7, 1), "rgba(255, 0, 0, 0.8)")];
    targets = [new Target("next target", 70.0, "rgba(0, 150, 0, 0.8)"), new Target("ideal", 68.0, "rgba(0, 100, 0, 0.8)")];
    currentUser = null; 
}

function addDataPoint() {
    const delta = 0.45 - Math.random();
    const lastDataPoint = dataset.datapoints[dataset.datapoints.length - 1];
    const newDate = lastDataPoint.date.addDays(2);
    const value = lastDataPoint.value + delta;
     
    console.log("Adding data point(" + newDate + " value=" + value);
    dataset.addDataPoint(new DataPoint(newDate, value));
    
    if (currentUser) {
        var chartsRef = firebase.firestore().collection("charts");
        chartsRef.doc(currentUser.uid).set({
            "username": "Pawel",
            "charts": [
                {
                    title: "weight",
                    dataset: JSON.parse( JSON.stringify(dataset) )
                },
                {
                    title: "chest press 1 rep max"
                }
            ]
        });
    }

    drawChart(dataset, flags, targets);
}

function addFlag() {
    console.log("Adding flag at "+currentDate);

    flags.push(new Flag("Flag", currentDate, "rgba(255, 0, 0, 0.8)"));
    drawChart(dataset, flags, targets);
}

function drawChart(dataset, flags, targets) { 
    var ctx = document.getElementById("myChart").getContext("2d");
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

function setColorMode()
{
    // dark mode
    document.documentElement.style.setProperty("--dominant-color", "black");
    document.documentElement.style.setProperty("--main-accent-color", "rgba(77, 130, 229, 1.0)");
    document.documentElement.style.setProperty("--secondary-accent-color", "rgba(77, 130, 229, 0.25)");
    document.documentElement.style.setProperty("--contrast-accent-color", "black");

    // light mode
    document.documentElement.style.setProperty("--dominant-color", "white");
    document.documentElement.style.setProperty("--main-accent-color", "rgba(77, 130, 229, 1.0)");
    document.documentElement.style.setProperty("--secondary-accent-color", "rgba(77, 130, 229, 0.25)");
    document.documentElement.style.setProperty("--contrast-accent-color", "white");
}

function main() {
    setColorMode();
    
    document.getElementById("main").style.display = "none";

    const loginSection = document.getElementById("loginSection");
    const userLabel = document.getElementById("user");
    const logoutSection = document.getElementById("logoutSection");
    const txtEmail = document.getElementById("txtEmail");
    const txtPassword = document.getElementById("txtPassword");
    const txtLogin = document.getElementById("btnLogin");
    const txtSignUp = document.getElementById("btnSignUp");
    const txtLogout = document.getElementById("btnLogout");
    const btnNewChart = document.getElementById("btnNewChart");

    btnNewChart.addEventListener("click", e => {
        if (chartSetupShown) {
            $("#newChartSetup").slideUp(300, "swing");
        } else {
            $("#newChartSetup").slideDown(300, "swing");
        }
        chartSetupShown = !chartSetupShown;
    });

    btnLogin.addEventListener("click", e => {
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();
        const promise = auth.signInWithEmailAndPassword(email, pass);
        promise.catch(e => console.log("Login error caught: " + e.message));
    });

    btnSignUp.addEventListener("click", e => {
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();
        const promise = auth.createUserWithEmailAndPassword(email, pass);
        promise.catch(e => console.log(e.message));
    });

    btnLogout.addEventListener("click", e => {
        firebase.auth().signOut();
        resetData();
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
                currentUser = user;
                // User is signed in.
                loginSection.classList.add("hide");
                logoutSection.classList.remove("hide");
                userLabel.innerHTML = "Logged in as "+ (user.displayName ? user.displayName : user.email);
                var displayName = user.displayName;
                var email = user.email;
                var emailVerified = user.emailVerified;
                var photoURL = user.photoURL;
                var uid = user.uid;
                var phoneNumber = user.phoneNumber;
                var providerData = user.providerData;

                console.log("UID: "+ uid);

                // get only my charts
                firebase.firestore().collection("charts").doc(uid).get().then(function(doc) {
                        // doc.data() is never undefined for query doc snapshots
                        console.log(doc.id, " => ", doc.data());
                        const chartData = doc.data();
                        document.getElementById("chart-title").innerHTML = chartData.charts[0].title;

                        if (chartData.charts[0].dataset && chartData.charts[0].dataset.datapoints) {
                            const receivedDatapoints = chartData.charts[0].dataset.datapoints;
                            const fixedDataPoints = receivedDatapoints.map(function(datapoint) {
                                return {date: new Date(datapoint.date), value: datapoint.value};
                            });

                            dataset = new Dataset(fixedDataPoints);
                        }
                        drawChart(dataset, flags, targets);
                });

                user.getIdToken().then(function(accessToken) {
                    document.getElementById("main").style.display = "block";
                });
            } else {
                // User is signed out.
                loginSection.classList.remove("hide");
                logoutSection.classList.add("hide");
                document.getElementById("main").style.display = "none";
            }
        }, function(error) {
            console.log(error);
        });
    });
}

main();
