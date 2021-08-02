(function () {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.width;
    canvas.height = video.height;
    let pX = 0,
        pY = 0,
        faceAreaX = 0,
        faceAreaY = 0;

    navigator.getMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

    navigator.getMedia(
        {
            video: true,
            audio: false,
        },
        function (stream) {
            console.log("I'm in live function");
            console.log(stream);
            video.srcObject = stream;
            video.play();
        },
        function (error) {
            console.log("Error in live" + error);
            error.code;
        }
    );

    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(",")[0].indexOf("base64") >= 0)
            byteString = atob(dataURI.split(",")[1]);
        else byteString = unescape(dataURI.split(",")[1]);

        // separate out the mime component
        var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], { type: mimeString });
    }

    const ws = new WebSocket("ws://localhost:5000");

    ws.onopen = function () {
        console.log("Openened connection to websocket");
    };
    ws.onmessage = function (event) {
        const { name, position } = JSON.parse(event.data);
        if (name?.length) {
            [pY, pX, faceAreaY, faceAreaX] = position[0];
            ctx.rect(pX * 3, pY * 3, faceAreaY * 2, faceAreaX * 2);
            ctx.fillText(name[0], pX * 3, pY * 3 - 10);
            ctx.fillStyle = "red";
            ctx.font = "20pt sans-serif";
            ctx.lineWidth = "2";
            ctx.strokeStyle = "yellowgreen";
            ctx.stroke();
        }
    };
    timer = setInterval(function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const data = canvas.toDataURL("image/jpeg", 1.0);
        newblob = dataURItoBlob(data);
        ws.send(newblob);
    }, 100);
})();
