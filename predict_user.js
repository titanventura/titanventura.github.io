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
    canvas.getContext('2d').clearRect(0, 0, video.width, video.height);
    if (detections.length > 0 && resizedDetections.length > 0) {
      // const blob = canvas.toDataURL("image/png");
      const imageObj = document.getElementById("pic");
      var src = "";
      // imageObj.onload = function(){
        
        const context = canvas.getContext("2d");
        context.drawImage(video,0,0,video.width,video.height);
        src = canvas.toDataURL("image/jpeg");
        
        imageObj.src = src;

        var block = src.split(";");
        // Get the content type of the image
        var contentType = block[0].split(":")[1];// In this case "image/gif"
        // get the real base64 content of the file
        var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."

        // Convert it to a blob to upload
        var blob = b64toBlob(realData, "png");
        
        let resp = postImage(blob);
        setTimeout(function(){},500);
        // results.forEach((bestMatch, i) => {
        //   const box = fullFaceDescriptions[i].detection.box
        //   const text = bestMatch.toString()
        //   const drawBox = new faceapi.draw.DrawBox(box, { label: text })
        //   drawBox.draw(canvas)
        // })

        // }

      // faceapi.draw.drawDetections(canvas, resizedDetections);
      resizedDetections.forEach(element => {
        const box = element.detection._box
        const drawBox = new faceapi.draw.DrawBox(box, { label: resp.message })
        drawBox.draw(canvas)
      });
      
      
      


      }
  }, 80)
})

function saveFrame(blob) {
  array.push(blob);
}

function revokeURL(e) {
  URL.revokeObjectURL(this.src);
}

function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, { type: contentType });
  return blob;
}




// async function postData(image_data) {
//   await $.ajax({
//     url: 'https://heimdall.iqube.io/predict_user/', // point to server-side controller method
//     dataType: 'image', // what to expect back from the server
//     cache: false,
//     contentType: false,
//     processData: false,
//     data: image_data,
//     type: 'post',
//     headers: {
//       "Authorization": "Basic " + btoa("srinath" + ":" + "srnthsrdhrn")
//     },
//     success: function (response) {
//       const p_element = document.createElement("p");
//       p_element.textContent = "data sent to server" + Date.now().toString();
//       document.querySelector("body").append(p_element);
//     },
//     error: function (response) {
//       const p_element = document.createElement("p");
//       p_element.textContent = "error sending data to the sever" + Date.now().toString();
//       document.querySelector("body").append(p_element);
//     }
//   });
// }


// important function

async function postImage(blob) {
  var form_data = new FormData();
  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic c3JpbmF0aDpzcm50aHNyZGhybg==");
  // myHeaders.append("Content-Type", "multipart/form-data;");
  // myHeaders.append("Access-Control-Allow-Origin","true");  
  // myHeaders.append("Accept","*/*");        
  // myHeaders.append("Access-Control-Allow-Credentials","true");        
  // myHeaders.append("Accept-Encoding","gzip, deflate, br");        
  // myHeaders.append("mode","no-cors");
  form_data.append("test","test");
  form_data.append("image_1", blob );

  // form_data.append("image_1","/C:/Users/Nirosh/Pictures/vlcsnap-2020-03-19-07h18m19s185.png");
  for(var i of form_data.entries())
  {
    console.log(i[0] + " "+i[1]);
  }
  var requestOptions = {
      "url":"https://heimdall.iqube.io/predict_user/",
      "method": 'POST',
      "timeout":0,
      "headers": {
        "Authorization": "Basic c3JpbmF0aDpzcm50aHNyZGhybg==",
        // "Content-Type": "multipart/form-data;"
      },
      "processData": false,
      "mimeType": "multipart/form-data",
      "contentType": false,
      "data": form_data
  };
  const response = await $.ajax(requestOptions).done(function(response){console.log(response)})

  
  return response;
  // const response = await fetch("https://heimdall.iqube.io/predict_user/",requestOptions)
  
  // const result = await response.text();
  // console.log("POST RESULT IDENTIFIER.. ",result);
}
