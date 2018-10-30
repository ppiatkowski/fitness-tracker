
"use strict";

// TODO feature - volume calculator

const chartAreaPadding = 1;
var chart = null;

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

var currentDate = new Date(2018, 6, 2);

function logout() {
    firebase.auth().signOut()
        .then(function() {
            console.log("Logged out");
        })
        .catch(function(error) {
            console.log("fFailed to logout");
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


class DataPoint {
    constructor(date, value) {
        this.date = date;
        this.value = value;
    }
}

class Dataset {
    constructor(datapoints) {
        this.datapoints = datapoints;
    }

    addDataPoint(datapoint) {
        this.datapoints.push(datapoint);
        this.datapoints.sort(function(a, b) {
            return a.date - b.date;
        })
    }

    getDataArray() {
        return this.datapoints.map(function (datapoint) {
            return {x: datapoint.date, y: datapoint.value}
        })
    }
}

class Flag {
    constructor(title, date, color = 'rgba(0,0,255,0.8)') {
        this.title = title;
        this.date = date;
        this.color = color;
    }
}

class Target {
    constructor(title, value, color = 'rgba(0,0,0,0.8)') {
        this.title = title;
        this.value = value;
        this.color = color;
    }
}

class ChartModel {
    constructor(dataset, flags, targets) {
        this.dataset = dataset;
        this.flags = flags;
        this.targets = targets;
    }

    getAnnotationConfig() {
        return [...this.getFlagsConfig(), ...this.getTargetsConfig()];
    }

    getFlagsConfig() {
        return flags.map(function(flag) {
            return {
                drawTime: 'afterDraw', // overrides annotation.drawTime if set
                type: 'line',
                mode: 'vertical',
                scaleID: 'x-axis-0',
                value: flag.date,
                borderColor: flag.color,
                borderWidth: 1,
                label: {
                    backgroundColor: flag.color,
                    fontSize: 12,
                    fontColor: "#fff",
                    position: "top",
                    enabled: true,
                    content: flag.title
                },
                events: ['click'],
    
                // Fires when the user clicks this annotation on the chart
                // (be sure to enable the event in the events array below).
                onClick: function(e) {
                    console.log("annotation clicked "+e)
                    // `this` is bound to the annotation element
                }
            }
        })
    }

    getTargetsConfig() {
        return targets.map(function(target) {
            return {
                drawTime: 'afterDraw', // overrides annotation.drawTime if set
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: target.value,
                borderColor: target.color,
                borderWidth: 1,
                label: {
                    backgroundColor: target.color,
                    fontSize: 12,
                    fontColor: "#fff",
                    position: "left",
                    enabled: true,
                    content: target.title
                },
                events: ['click'],
    
                // Fires when the user clicks this annotation on the chart
                // (be sure to enable the event in the events array below).
                onClick: function(e) {
                    console.log("annotation clicked "+e)
                    // `this` is bound to the annotation element
                }
            }
        });
    }
}

class ChartConfig {
    constructor(model) {
        this.model = model;
        this.type = 'line';
        this.data = {
            datasets: [{
                lineTension: 0.0,
                pointRadius: 1.0,
                label: 'weight',
                data: this.model.dataset.getDataArray(),
                backgroundColor: [
                    'rgba(0, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(0,99,132,1)'
                ],
                pointBackgroundColor: 'rgba(0, 99, 132, 1)',
                borderWidth: 1
            }]
        };
        this.options = {
            animation: false,
            ticks: {
                source: "data"
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                }],
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                    }
                }]
            },
            annotation: {
                drawTime: 'afterDatasetsDraw', 
                events: ['click'],
                dblClickSpeed: 350, // ms (default)
                annotations: []
            }
        };

        this.options.annotation.annotations = model.getAnnotationConfig()
        this.updateChartArea();
        this.updateChartTimeUnits();
    }

    updateChartArea() {
        var minY = 0;
        var maxY = Infinity;

        const datapoints = this.model.dataset.datapoints;
        const datapointValues = datapoints.map(function(datapoint) {
            return datapoint.value;
        })
        minY = Math.min(...datapointValues);
        maxY = Math.max(...datapointValues);

        const targetValues = this.model.targets.map(function(target) {
            return target.value;
        })
        minY = Math.min(minY, ...targetValues);
        maxY = Math.max(minY, ...targetValues);

        this.options.scales.yAxes[0].ticks.suggestedMin = minY - chartAreaPadding;
        this.options.scales.yAxes[0].ticks.suggestedMax = maxY + chartAreaPadding;
    }

    updateChartTimeUnits() {
        var unit = "day"
        const datapoints = this.model.dataset.datapoints;
        if (datapoints.length > 1) {
            // datapoints are assumed to be always sorted because addDatapoint method sorts data points
            const periodInDays = Math.floor((datapoints[datapoints.length - 1].date - datapoints[0].date)/(1000*60*60*24));
            if (periodInDays > 60) {
                unit = "month";
            }
        }
        this.options.scales.xAxes[0].time.unit = unit
    }
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

function initApp() {
    firebase.auth().onAuthStateChanged(function(user) {
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


const datapoints = [new DataPoint(new Date(2018, 6, 1), 73.2)]; 
const dataset = new Dataset(datapoints)

const flags = [new Flag("deload", new Date(2018, 7, 1), 'rgba(255, 0, 0, 0.8)')];
const targets = [new Target("next target", 70.0, 'rgba(0, 150, 0, 0.8)'), new Target("ideal", 68.0, 'rgba(0, 100, 0, 0.8')];


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
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
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
