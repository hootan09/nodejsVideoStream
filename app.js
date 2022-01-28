const express = require("express");
const app = express();
const path = require('path');
const fs = require("fs");


//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//static public Folders
app.use(express.static(path.join(__dirname , 'public')));

// app.get("/", function (req, res) {
//     res.sendFile(__dirname + "/index.html");
// });

app.get("/video", function (req, res) {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    const videoPath = "./public/uploads/Clara_2018_HD480.mp4";
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}!`);
});