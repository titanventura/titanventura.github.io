const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: true },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}



var array = [];
var i = 0;
video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
   
    if (detections.length > 0) {
      // const blob = canvas.toDataURL("image/png");
      const imageObj = document.getElementById("pic");
      var src = "";
      // imageObj.onload = function(){
        
        const context = canvas.getContext("2d");
        context.drawImage(video,0,0,canvas.width,canvas.height);
        src = canvas.toDataURL("image/jpeg");
        
        imageObj.src = src;
        // console.log(src);  

        postImage(imageObj);
        // }
      faceapi.draw.drawDetections(canvas, resizedDetections);
      
      }
  }, 100)
})

function saveFrame(blob) {
  array.push(blob);
}

function revokeURL(e) {
  URL.revokeObjectURL(this.src);
}




async function postData(image_data) {
  await $.ajax({
    url: 'https://heimdall.iqube.io/predict_user/', // point to server-side controller method
    dataType: 'image', // what to expect back from the server
    cache: false,
    contentType: false,
    processData: false,
    data: image_data,
    type: 'post',
    headers: {
      "Authorization": "Basic " + btoa("srinath" + ":" + "srnthsrdhrn")
    },
    success: function (response) {
      const p_element = document.createElement("p");
      p_element.textContent = "data sent to server" + Date.now().toString();
      document.querySelector("body").append(p_element);
    },
    error: function (response) {
      const p_element = document.createElement("p");
      p_element.textContent = "error sending data to the sever" + Date.now().toString();
      document.querySelector("body").append(p_element);
    }
  });
}


// important function

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

  var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: form_data,
      redirect: 'follow'
  };
  const response = await fetch("https://heimdall.iqube.io/predict_user/",requestOptions)
  
  const result = await response.text();
  console.log("POST RESULT IDENTIFIER.. ",result);
}
