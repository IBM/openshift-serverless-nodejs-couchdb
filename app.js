const {
    HTTPReceiver
} = require("cloudevents-sdk");
  
const app = require('express')();

// Create a receiver to accept events over HTTP
const receiver = new HTTPReceiver();

app.use((req, res, next) => {
    let data="";

    req.setEncoding("utf8");
    req.on("data", function(chunk) {
       data += chunk;
    });

    req.on("end", function() {
        req.body = data;
        next();
    });
});

app.post("/", (req, res) => {
    // events from couchdbsource has an array data
    // convert it to string to make it a valid cloudevent
    req.body = JSON.stringify(req.body)
    try {
        const event = receiver.accept(req.headers, req.body);
        console.log(`Couchdb CloudEvent:`);
        console.log(JSON.stringify(event.format(), null, 2));
        res.status(201).json(event);
    } catch (err) {
        console.error(err);
        res.status(415).header("Content-Type", "application/json").send(JSON.stringify(err));
    }
})

const port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log("Example app listening on port ", port);
});