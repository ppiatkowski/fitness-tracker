
"use strict";

// TODO feature - volume calculator

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
    const targets = [new Target("plan minimum", 70.0), new Target("ideał", 68.0, 'rgba(0, 255, 0, 0.8')]

    drawChart(dataset, flags, targets)
});


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

class Target {
    constructor(title, value, color = 'rgba(0,0,0,0.8)') {
        this.title = title
        this.value = value
        this.color = color
    }
}

class ChartModel {
    constructor(dataset, flags, targets) {
        this.dataset = dataset
        this.flags = flags
        this.targets = targets
    }
}

class ChartConfig {
    constructor(model) {
        this.model = model
        this.type = 'line';
        this.data = {
            datasets: [{
                lineTension: 0.0,
                label: 'weight',
                data: this.model.dataset.getDataArray(),
                backgroundColor: [
                    'rgba(0, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(0,99,132,1)'
                ],
                pointBackgroundColor: 'rgba(0, 99, 132, 1)',
                borderWidth: 2
            }]
        };
        this.options = {
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
                        suggestedMin: 65.5,
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

        this.addFlags(this.model.flags)
        this.addTargets(this.model.targets)
        this.updateChartArea()
    }

    addFlags(flags) {
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
            this.options.annotation.annotations.push(flagConfig)
        });
    }

    addTargets(targets) {
        targets.forEach(target => {
            const targetConfig = {
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
            this.options.annotation.annotations.push(targetConfig)
        });
    }

    updateChartArea() {
        var minY = 0
        var maxY = Infinity

        const datapointValues = this.model.dataset.datapoints.map(function(datapoint) {
            return datapoint.value;
        })
        minY = Math.min(...datapointValues)
        maxY = Math.max(...datapointValues)

        const targetValues = this.model.targets.map(function(target) {
            return target.value;
        })
        minY = Math.min(minY, ...targetValues)
        maxY = Math.max(minY, ...targetValues)

        this.options.scales.yAxes[0].ticks.suggestedMin = minY - 1;
        this.options.scales.yAxes[0].ticks.suggestedMax = maxY + 1;
    }
}

function drawChart(dataset, flags, targets) { 
    var ctx = document.getElementById("myChart").getContext('2d');
    const chartModel = new ChartModel(dataset, flags, targets)
    const config = new ChartConfig(chartModel)
    var chart = new Chart(ctx, config)
}
