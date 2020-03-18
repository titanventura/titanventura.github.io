window.onload = function (){
    console.log("window loaded");
let takephoto = false;
let pic_array = [];

// main declarations

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}



$("#startbtn").click(function () {
    if (takephoto) {
        snap();
    }
});

let i = 0;



const video = document.getElementById('video')
let canvas,displaySize;
console.log("Video on load before");
console.log(video.width);
video.onload = function(){
    console.log("Video on load start");
    canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    console.log(canvas.width,canvas.height);
    displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize);
 console.log(1);
    video.addEventListener('play', () => {
        console.log("Video Listenr");
        setInterval(async () => {
            
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            console.log(detections);
            takephoto = false;
            if (detections.length > 0) {
                takephoto = true;
            }
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
        }, 100)
        
    });
    console.log("Video on load after");
}



function snap(){
    const imageObj = document.getElementById("pic");
    let src = "";
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    src = canvas.toDataURL("image/jpeg");
    imageObj.src = src;
    pic_array.push(imageObj);
    if(pic_array.length >= 10)
    {
        document.getElementById("uploadbtn").classList = ["btn","btn-danger"];
    }
}




function saveFrame(blob) {
    array.push(blob);
}


// important function to POST data.

async function postImage(blob) {
    const form_data = new FormData();
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic c3JpbmF0aDpzcm50aHNyZGhybg==");
    myHeaders.append("Content-Type", "multipart/form-data;");
    // myHeaders.append("Access-Control-Allow-Origin","true");  
    // myHeaders.append("Accept","*/*");        
    // myHeaders.append("Access-Control-Allow-Credentials","true");        
    // myHeaders.append("Accept-Encoding","gzip, deflate, br");        
    // myHeaders.append("mode","no-cors");
    form_data.append("image_1", blob);

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: form_data,
        redirect: 'follow'
    };
    const response = await fetch("http://Heimdall-280442718.ap-south-1.elb.amazonaws.com/predict_user/", requestOptions)

    const result = await response.text();
    console.log("POST RESULT IDENTIFIER.. ", result);
}
}