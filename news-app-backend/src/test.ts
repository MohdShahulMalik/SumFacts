import dayjs from "dayjs";

async function testingApi() {
    const response = await fetch("http://localhost:5000/news-summaries", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            day: dayjs(),
            numNews: 5
        }),
    });

    return response.json();
}

testingApi().then(data => console.log(data));