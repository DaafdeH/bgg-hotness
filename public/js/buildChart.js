window.addEventListener('load', (event) => {
    try{
        buildChart()
    } catch (e) {
        console.error(e)
    }
});

async function buildChart() {
    const id = document.getElementById('bgg_id').value
    const period = document.getElementById('period').value

    getDataForChart(id, period)
    // const CHART = document.getElementById('lineChart')
    //     console.log(CHART)
    //     new Chart(CHART, {
    //         type: 'line',
    //         data: {
    //             labels: [1500,1600,1700,1750,1800,1850,1900,1950,1999,2050],
    //             datasets: [{ 
    //                 data: [86,114,106,106,107,111,133,221,783,2478],
    //                 label: "Africa",
    //                 borderColor: "#3e95cd",
    //                 fill: false
    //             }]
    //         },
    //         options: {
    //             title: {
    //             display: true,
    //             text: 'World population per region (in millions)'
    //             }
    //         }
    //     });
}

async function getDataForChart(id, period) {
    if (period == null) {
        throw new Error('period is incorrect!')
    }

    const url = window.location.href.replace("/chart", "/chartquery")

    try {
        const reqdata = {
            "id": `${id}`,
            "period": `${period}`
        }
        
        const request = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reqdata),
          })
        
        const data = await request.json()
        return data
    } catch (e) {
        console.error(e)
    }
}