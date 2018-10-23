
document.addEventListener("DOMContentLoaded", function(){
    drawChart()
  });

function drawChart() { 
    var ctx = document.getElementById("myChart").getContext('2d');

    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'weight in kg',
                data: [{x: new Date(2018, 9, 1), y: 73.2}, 
                        {x: new Date(2018, 9, 15), y: 72.6}, 
                        {x: new Date(2018, 10, 10), y: 71.2}, 
                        {x: new Date(2018, 10, 20), y: 71.8}, 
                        {x: new Date(2018, 11, 12), y: 72.6}, 
                        {x: new Date(2018, 11, 30), y: 71.1}],
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
                        position: "right",
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
                },
                {
                    drawTime: 'afterDraw', // overrides annotation.drawTime if set
                    id: 'annotation-flag', // optional
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x-axis-0',
                    value: new Date(2018,11, 13),
                    borderColor: 'rgba(0,0,255,0.8)',
                    borderWidth: 1,
                    label: {
                        backgroundColor: 'rgba(0,0,255,0.8)',
                        fontSize: 12,
                        fontColor: "#fff",
                        position: "top",
                        enabled: true,
                        content: "Start IF"
                    },
                    events: ['click'],
        
                    // Fires when the user clicks this annotation on the chart
                    // (be sure to enable the event in the events array below).
                    onClick: function(e) {
                        console.log("annotation clicked "+e)
                        // `this` is bound to the annotation element
                    }
                }
                ]
            }

        }
        
    })
}