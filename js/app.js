
"use strict";

class DataPoint {
    constructor(date, value) {
        this.date = date;
        this.value = value
    }
}

class Dataset {
    constructor(datapoints) {
        this.datapoints = datapoints;
    }

    addDataPoint(datapoint) {
        this.datapoints.push(datapoint)
    }

    getDataArray() {
        return this.datapoints.map(function (datapoint) {
            return {x: datapoint.date, y: datapoint.value}
        })
    }
}
class Flag {
    constructor(title, date, color = 'rgba(0,0,255,0.8)') {
        this.title = title
        this.date = date
        this.color = color
    }
}

document.addEventListener("DOMContentLoaded", function(){

    const datapoints = [new DataPoint(new Date(2018, 9, 1), 73.2), 
                        new DataPoint(new Date(2018, 9, 15), 72.6),
                        new DataPoint(new Date(2018, 10, 10), 71.2),
                        new DataPoint(new Date(2018, 11, 12), 71.3),
                        new DataPoint(new Date(2018, 11, 30), 71.1)];
    const dataset = new Dataset(datapoints)
    dataset.addDataPoint(new DataPoint(new Date(2018, 12, 5), 69.9));
    dataset.addDataPoint(new DataPoint(new Date(2019, 1, 5), 70.5));

    const flags = [new Flag("deload", new Date(2018, 10, 10), 'rgba(255, 0, 0, 0.8)')]
    const targets = []

    drawChart(dataset.getDataArray(), flags, targets)
  });

function drawChart(data, flags, targets) { 
    var ctx = document.getElementById("myChart").getContext('2d');
    var config = createChartConfig(data)
    config = addFlags(config, flags)
    var chart = new Chart(ctx, config)
}

function createChartConfig(data) {
    const config = {
        type: 'line',
        data: {
            datasets: [{
                lineTension: 0.0,
                label: 'weight',
                data: data,
                backgroundColor: [
                    'rgba(0, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(0,99,132,1)'
                ],
                pointBackgroundColor: 'rgba(0, 99, 132, 1)',
                borderWidth: 2
            }]
        },
        options: {
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
                        suggestedMin: 69.5,
                    }
                }]
            },
            annotation: {
                drawTime: 'afterDatasetsDraw', 
                events: ['click'],
                dblClickSpeed: 350, // ms (default)
                annotations: [{
                    drawTime: 'afterDraw', // overrides annotation.drawTime if set
                    id: 'annotation-target', // optional
                    type: 'line',
                    mode: 'horizontal',
                    scaleID: 'y-axis-0',
                    value: 70.0,
                    borderColor: 'black',
                    borderWidth: 1,
                    label: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        fontSize: 12,
                        fontColor: "#fff",
                        position: "left",
                        enabled: true,
                        content: "Target"
                    },
                    events: ['click'],
        
                    // Fires when the user clicks this annotation on the chart
                    // (be sure to enable the event in the events array below).
                    onClick: function(e) {
                        console.log("annotation clicked "+e)
                        // `this` is bound to the annotation element
                    }
                }]
            }
        }
    }
    return config;
}

function addFlags(config, flags) {
    flags.forEach(flag => {
        const flagConfig = {
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
        config.options.annotation.annotations.push(flagConfig)
    });

    return config;
}
