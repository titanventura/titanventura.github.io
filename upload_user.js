const video = document.getElementById("vid");
const isScreenSmall = window.matchMedia("(max-width: 700px)");
var can_snap = true;
let predictedAges = [];

/****Loading the model ****/
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.error(err)
  );
}

/****Fixing the video with based on size size  ****/
function screenResize(isScreenSmall) {
  if (isScreenSmall.matches) {
    video.style.width = "320px";
  } else {
    video.style.width = "500px";
  }
}

screenResize(isScreenSmall);
isScreenSmall.addListener(screenResize);

let pic_array = [];
var count = 0;
var array = [];
var i = 0;
video.addEventListener('play', () => {

  const canvas = faceapi.createCanvasFromMedia(video)
  document.getElementById("vid").append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());



    if (detections != null) {
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, video.width, video.height);
      if (count < 25) {
        // const blob = canvas.toDataURL("image/png");
        const imageObj = new Image();
        var src = "";
        // imageObj.onload = function(){

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, video.width, video.height);
        src = canvas.toDataURL("image/jpeg");

        imageObj.src = src;
        // console.log(src);  
        pic_array.push(src);

        var divcont = document.createElement("div")
        var number_elem=document.createElement("h1")
        number_elem.stlyle="color:whitesmoke;font-size:20px;display:in-line";
        number_elem.textContent = `${count+1}`;
        imageObj.style="display:in-line;"
        divcont.appendChild(number_elem);
        divcont.appendChild(imageObj);
        document.getElementById("img").appendChild(divcont);
        document.getElementById("img").append(document.createElement("br"));
        // }
        count++;
        console.log(count);
      }
      else if (count === 25) {
        video.pause();
      }
      faceapi.draw.drawDetections(canvas, resizedDetections);

    }
  }, 200)
})
function renderArray(pic_array) {
  var container = document.getElementById("#img-container");
  for (let x = 0; x < pic_array; x++) {
    container.appendChild(pic_array[i]);
  }
}
function saveFrame(blob) {
  array.push(blob);
}

function revokeURL(e) {
  URL.revokeObjectURL(this.src);
}




async function postData(image_data) {
  await $.ajax({
    url: 'https://heimdall.iqube.io/upload_images/', // point to server-side controller method
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

// document.getElementById("user_id").document.addEventListener("change",(e)=>{
//     if(e.target.value.length == 0)
//     {
//         $("#uploadbtn").prop("disabled",true);
//     }
//     else{
//         $("#uploadbtn").prop("disabled",false);
//     }
// })

// important function

async function postImage() {
  document.getElementById("notify").style = "display:inline";
  document.getElementById("notify").textContent = "upload started"
  console.log($("#user_id").val().length);
  if ($("#user_id").val().length == 0) {
    console.log("no userid");
    $("#user_id").focus(function () {
      $(this).next("span").css("display", "border-box");
    });
    return;
  }

  if (pic_array.length == 0) {
    alert("please take photo and try");

  }
  var form_data = new FormData();
  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic " + btoa("srinath" + ":" + "srnthsrdhrn"));
  // myHeaders.append("Content-Type", "multipart/form-data; boundary=--------------------------967216418725170803396561");
  // myHeaders.append("Access-Control-Allow-Origin","true");  
  // myHeaders.append("Accept","*/*");        
  // myHeaders.append("Access-Control-Allow-Credentials","true");        
  // myHeaders.append("Accept-Encoding","gzip, deflate, br");        
  // myHeaders.append("mode","no-cors");


  var user_id = $("#user_id").val();
  console.log(user_id);
  form_data.append("username", user_id);
  for (var i = 0; i < pic_array.length; i++) {
    var image_name = `image_${i + 1}`;
    var block = pic_array[i].split(";");
    // Get the content type of the image
    var contentType = block[0].split(":")[1];// In this case "image/gif"
    // get the real base64 content of the file
    var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
    // Convert it to a blob to upload
    var blob = b64toBlob(realData, "png");


    form_data.append(image_name, blob);
  }
  console.log("image entries aree");
  for (var i of form_data.entries()) {
    console.log(i[0] + " " + i[1])
  }
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: form_data,
    //   redirect: 'follow'
  };
  console.log(form_data);
  fetch("https://heimdall.iqube.io/upload_images/", requestOptions).then(res => {
    return res.json()
  }).then(resp => {
    console.log(resp);
    if (resp[0].includes("rejected")) {
      var temp = resp[0];
      var occ = (temp.match("blob") || []).length;
      if(occ < 5){
        
      document.getElementById("notify").textContent = `server got the files`;
      return;
      }
      document.getElementById("notify").style = "display:none";
      document.getElementById("notify_fail").style = "display:inline";
      document.getElementById("notify_fail").textContent = "Failure uploading to server"
    }
    else if (resp[0].includes("got your file")) {
      document.getElementById("notify").textContent = `Server returned ${resp}`
    }

  }).catch(err => {
    document.getElementById("notify").style = "display:none";
    document.getElementById("notify_fail").style = "display:inline";
    document.getElementById("notify_fail").textContent = "Failure uploading to server"
  })

  // const result = await response.text();
  // console.log("POST RESULT IDENTIFIER.. ", result);
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