const url_1 = "https://heimdall.iqube.io";
const url_2 = "http://10.1.76.101:8000/";



const video = document.getElementById("vid");
const isScreenSmall = window.matchMedia("(max-width: 700px)");
var can_snap = true;
let predictedAges = [];

/****Loading the model ****/
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
]).then(() => { });
var user_input = "";


function startVideo() {
  
      document.getElementById("validator").style = "display:none";
      navigator.getUserMedia(
        { video: {} },
        stream => (video.srcObject = stream),
        err => console.error(err)
      );
    
}


var callAPi = (username) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic " + btoa("srinath" + ":" + "srnthsrdhrn"));
  var req_options = {
    method: "GET",
    headers: myHeaders
  }
  fetch(`${url_1}/get_user_details?username=${username}`, req_options).then(res => {
    console.log("Reached here");
    return res.json()
  }).then((resp) => {
    var x = document.getElementById("validator")
    x.style = "display:none"
    if(resp.id != undefined)
    {
      startVideo();
    }
    else if(resp.message.includes("does not exist")){
      var x = document.getElementById("validator")
      x.innerHTML = "user does not exist"
      x.style = "display:in-line"
    }
  }).catch(err => {
    var x = document.getElementById("validator")
    x.innerHTML = err.message
    x.style = "display:in-line"
    console.log(err);
  })

}




$("#frm").submit((e) => {
  
  var something = document.getElementById("validator")
  something.style="display:block"
  something.textContent = "requesting..."
  console.log("submit btn clicked"); 
  e.preventDefault()

  user_input = $("#user_id").val()
  if (user_input !== "") {
    callAPi(user_input);
  }
  else {
    var x= document.getElementById("validator")
    x.textContent = "Please enter valid user input"
    x.style = "display:block"
  }
});




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



// MAIN FUNCTION TO LISTEN TO THE VIDEO AND PREDICT 25 IMAGES.
let pic_array = [];
var count = 0;
var array = [];
var i = 0;
video.addEventListener('play', () => {

  const canvas = faceapi.createCanvasFromMedia(video)
  canvas.id = "canvas_id"
  document.getElementById("containerr").append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());



    if (detections != null) {
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      if (count < 31) {
        // const blob = canvas.toDataURL("image/png");
        const imageObj = new Image();
        var src = "";
        // imageObj.onload = function(){

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, video.width, video.height);
        src = canvas.toDataURL("image/jpeg");

        imageObj.src = src;
        imageObj.style = "display:inline;float:right;width:500px;height:35vh;"
        // console.log(src);  
        pic_array.push(src);

        var number_elem = document.createElement("h1")
        number_elem.style = "color:whitesmoke;font-size:20px;display:inline;float:left";
        number_elem.textContent = `${count + 1}`;


        var divcont = document.createElement("div")
        divcont.className = "picture_cont_div"

        var closeBtn = document.createElement("button");
        closeBtn.classList.add("btn", "btn-danger");
        closeBtn.innerHTML = "X";
        closeBtn.addEventListener("click", (e) => {
          e.target.parentElement.remove();
          console.log(document.getElementById("img").childElementCount);
        });

        divcont.append(closeBtn);
        divcont.append(number_elem);
        divcont.append(imageObj);
        console.log(divcont);

        document.getElementById("img").append(divcont);
        document.getElementById("img").append(document.createElement("br"));

      }

      count++;
      console.log(count);
      canvas.getContext('2d').clearRect(0, 0, video.width, video.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
    }
    if (count === 31) {
      // video.pause();
      // video.parentElement.hide();
      stopStreamedVideo(video);
      $("#vid").hide();
      $("#canvas_id").hide();
    }
    // console.log("here i am")


  }, 200)
})




// important function to POST ALL IMAGES TO THE SERVER 
async function postImage() {
  document.getElementById("notify").style = "display:inline";
  document.getElementById("notify").textContent = "upload started"
  console.log($("#user_id").val().length);
  if ($("#user_id").val().length == 0) {
    alert("no userid");
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

  var div_cont_array = document.getElementsByClassName("picture_cont_div")
  for (var i = 0; i < div_cont_array.length; i++) {
    var image_name = `image_${i + 1}`;
    var block = div_cont_array[i].lastElementChild.src.split(";");
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
  fetch(`${url_1}/upload_images/`, requestOptions).then(res => {
    return res.json()
  }).then(resp => {
    console.log(resp);
    if(resp.message){
      if(resp.message.includes("your files")){
          document.getElementById("notify_fail").style = "display:none";
          document.getElementById("notify").textContent = `server got the files`;
         }
    }
    if (resp[0].includes("rejected")) {
      var temp = resp[0];
      var occ = (temp.match("blob") || []).length;
      if (occ < 5) {
        document.getElementById("notify_fail").style = "display:none";
        document.getElementById("notify").textContent = `server got the files`;
        return;
      }
      document.getElementById("notify").style = "display:none";
      document.getElementById("notify_fail").style = "display:inline";
      document.getElementById("notify_fail").textContent = "Failure uploading to server"
    }
    else if (resp[0].includes("your file")) {
      document.getElementById("notify").textContent = `Server returned ${resp}`
    }
    else if (resp[0].includes("User does not exist")) {
      document.getElementById("validator").style = "display:in-line"
    }
    else {
      document.getElementById("validator").style = "display:none"
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




function stopStreamedVideo(videoElem) {
  const stream = videoElem.srcObject;
  const tracks = stream.getTracks();

  tracks.forEach(function (track) {
    track.stop();
  });

  videoElem.srcObject = null;
}




















// async function postData(image_data) {
//   await $.ajax({
//     url: 'https://heimdall.iqube.io/upload_images/', // point to server-side controller method
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

// document.getElementById("user_id").document.addEventListener("change",(e)=>{
//     if(e.target.value.length == 0)
//     {
//         $("#uploadbtn").prop("disabled",true);
//     }
//     else{
//         $("#uploadbtn").prop("disabled",false);
//     }
// })



