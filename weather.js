let mavariable = "";

document.getElementById("butt").addEventListener('click', () => {
    let input = document.getElementById("input").value;
    fetch(`https://www.prevision-meteo.ch/services/json/${input}`)
    .then(function(response) {
        return response.json();
    })
    .then(function(json) {
        if (json.hasOwnProperty("errors")){
            throw new Error("Bad name");
        }
        mavariable = JSON.stringify(json);
        myChart.data.labels = [];
        myChart.data.datasets[0].data = [];
        //document.getElementById('data').innerHTML = `<p>test${mavariable}</p>`
        let day_0_array = json["fcst_day_0"]["hourly_data"];
        let day_0_keys = Object.keys(day_0_array);
        day_0_keys.forEach(element => {
            myChart.data.labels.push(element);
            myChart.data.datasets[0].data.push(day_0_array[element]["TMP2m"]);
        });
        myChart.update();
    })
    .catch( (err) => {
        document.getElementById('data').innerHTML = `<p>Mauvais nom de ville</p>`
    });
})

const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: "line", 
    data : {
        labels : ["8h", "10h", "12h", "14h", "16h", "18h", "20h"],
        datasets: [{
            label: 'T°',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: true,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        plugins: {
            legend: {
                display : false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    borderColor: 'black'
                }  
            },
            y: {
                grid: {
                    display: false,
                    borderColor: 'white'
                },
                ticks: {
                    display : true
                }
            }
        }
    }
});
