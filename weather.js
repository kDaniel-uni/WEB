let state = {
    dataInitialized: false,
    indexes: [0, 1, 2, 3, 4]
};

setup();

function setup() {
    document.getElementById("butt").addEventListener('click', () => {
        let input = document.getElementById("input").value;
        fetchAPI(input);
    });

    initCards();
    initChart();
    initMap();
    fetchAPI("Paris");
}

function initCards() {
    state.indexes.forEach(index => {
        let card = document.createElement("div");
        card.setAttribute("id", `card${index}`);
        card.setAttribute("class", "card col mx-2");
        addCardEventListener(card, index);
        document.getElementById("cardRow").appendChild(card);
    });
}

function addCardEventListener(card, index) {
    card.addEventListener('click', (() => {
        selectCard(index);
    }), false);
    
    card.addEventListener('mouseover', (event) => {
        event.currentTarget.style.borderColor = 'rgb(75, 192, 192)';
    })

    card.addEventListener('mouseout', (event) => {
        event.currentTarget.style.borderColor = '';
    })
}

function cleanSelection() {
    state.indexes.forEach(index => {
        let card = document.getElementById(`card${index}`);
        card.style.backgroundColor = '';
    });
}

function selectCard(index) {
    cleanSelection();
    let card = document.getElementById(`card${index}`);
    card.style.backgroundColor = 'gainsboro';
    updateChart(index);
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
        findMinMax();
        selectCard(0);
        document.getElementById('data').innerHTML = ``;
        updateCards();

        let city_info = json["city_info"];
        let latlng= [city_info["latitude"], city_info["longitude"]];
        state["macarte"].setView(latlng);
        moveMarker(latlng);
        
    })
    .catch( (err) => {
        document.getElementById('data').innerHTML = `<p>Mauvais nom de ville</p>`
    });
}

function storeCurrentForecast(json){
    state.dataInitialized = true;
    state["json"] = json;
}

function updateCards(){
    state.indexes.forEach( index => {
        updateCard(state.json[`fcst_day_${index}`], index)
    });
}

function updateCard(dayForecast, index){
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
            datasets: [{
                label: 'T°',
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
    if (!state.dataInitialized) return;
    
    state.myChart.data.labels = [];
    state.myChart.data.datasets[0].data = [];

    let day_array = state["json"][`fcst_day_${index}`]["hourly_data"];
    let day_keys = Object.keys(day_array);

    day_keys.forEach(element => {
        state.myChart.data.labels.push(element);
        state.myChart.data.datasets[0].data.push(day_array[element]["TMP2m"]);
    });
    state.myChart.update();
}

function findMinMax() {
    let min = 60;
    let max = -20;
    state.indexes.forEach( index => {
        let day_array = state["json"][`fcst_day_${index}`]["hourly_data"];
        let day_keys = Object.keys(day_array);

        day_keys.forEach(element => {
           let value =  day_array[element]["TMP2m"];

           if (value < min) {
                min = value;
           }

           if (value > max) {
                max = value;
           }

        });
    });
    state.myChart.options.scales.y.min = min;
    state.myChart.options.scales.y.max = max;
}

function initMap() {
    let macarte = L.map('map').setView([48.852969, 2.349903], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
        minZoom: 1,
        maxZoom: 20
    }).addTo(macarte);

    macarte.on('click', onMapClick);
    state["macarte"] = macarte;
    state["marker"] = L.marker([48.852969, 2.349903]).addTo(state["macarte"]);
}

function onMapClick(e){
    moveMarker(e.latlng);
    fetchAPI(`lat=${e.latlng.lat}lng=${e.latlng.lng}`);
}

function moveMarker(latlng){
    state["marker"].setLatLng(latlng);
}