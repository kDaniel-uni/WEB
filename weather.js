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
        document.getElementById('data').innerHTML = `<p>test${mavariable}</p>`
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
                    display : false
                }
            }
        }
    }
});
