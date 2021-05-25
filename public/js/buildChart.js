window.addEventListener('load', (event) => {
    try{
        buildChart()
    } catch (e) {
        console.error(e)
    }
});

async function buildChart() {
    const id = new URL (window.location.href).searchParams.get('bgg_id')
    let period = document.getElementById('period').value

    const data = await getDataForChart(id, period)

    const labels = data.map((ranking) => {
        let date = ranking.datetime_polled.substr(0, 10)
        let time = ranking.datetime_polled.substr(11, 5)
        return date + " " + time
    })
    const dataset = data.map(ranking => ranking.rank)

    const label = data[0].name
    const ypFIeld = document.getElementById("yearPublished")
    ypFIeld.disabled = true
    ypFIeld.value = data[0].yearpublished

   if (period !== "today") {
       period = "last " + period
   }

    const CHART = document.getElementById('lineChart')
        new Chart(CHART, {
            type: 'line',
            data: {
                labels,
                datasets: [{ 
                    data: dataset,
                    label,
                    borderColor: "#3e95cd",
                    fill: false
                }]
            },
            options: {
                title: {
                display: true,
                text: `Rank for ${label} ${period} `
                }
            }
        });
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