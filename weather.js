let state = {
};

setup();

function setup() {
    document.getElementById("butt").addEventListener('click', () => {
        let input = document.getElementById("input").value;
        fetchAPI(input);
    })

    initCards();
    initChart();
    fetchAPI("Paris");
}

function initCards() {
    let indexes = [0, 1, 2, 3, 4];
    indexes.forEach(index => {
        let card = document.createElement("div");
        card.setAttribute("id", `card${index}`);
        card.setAttribute("class", "card col mx-2");
        document.getElementById("cardRow").appendChild(card);
    });
}

function fetchAPI(requestParam) {
    fetch(`https://www.prevision-meteo.ch/services/json/${requestParam}`)
    .then(function(response) {
        return response.json();
    })
    .then(function(json) {
        if (json.hasOwnProperty("errors")){
            throw new Error("Bad name");
        }

        storeCurrentForecast(json);
        updateChart(0);
        document.getElementById('data').innerHTML = ``;
        updateCards();
    })
    .catch( (err) => {
        document.getElementById('data').innerHTML = `<p>Mauvais nom de ville</p>`
    });
}

function storeCurrentForecast(json){
    state["json"] = json;
}

function updateCards(){
    let fcst_day_indexes = [0, 1, 2, 3, 4];
    fcst_day_indexes.forEach( index => {
        createCard(state.json[`fcst_day_${index}`], index)
    });
}

function createCard(dayForecast, index){
    let card = document.getElementById(`card${index}`);
    card.innerHTML = "";
    let day = document.createTextNode(dayForecast.day_short)
    card.appendChild(day);
    let icon = document.createElement("img")
    icon.setAttribute("src", dayForecast.icon_big);
    card.appendChild(icon);
    let temps = document.createTextNode(dayForecast.tmax + "°C - " + dayForecast.tmin + "°C");
    card.appendChild(temps);
}

function initChart(){
    let ctx = document.getElementById('myChart').getContext('2d');
    let myChart = new Chart(ctx, {
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
                },
                tooltip: {
                    intersect: false
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

    state["myChart"] = myChart;
}

function updateChart(index){
    state.myChart.data.labels = [];
    state.myChart.data.datasets[0].data = [];

    let day_array = state.json[`fcst_day_${index}`]["hourly_data"];
    let day_keys = Object.keys(day_array);
    day_keys.forEach(element => {
        state.myChart.data.labels.push(element);
        state.myChart.data.datasets[0].data.push(day_array[element]["TMP2m"]);
    });
    state.myChart.update();
}