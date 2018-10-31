const chartAreaPadding = 1;
var chart = null;

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