const video = document.getElementById('video')
// video.width = video.parentElement.width
// video.height = video.parentElement.height
// console.log(video.width);
// console.log(video.height);
// so that it becomes 100percent 
let pic_array =[];
var count = 0;
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
  document.getElementById("vid").append(canvas)
  const displaySize = { width: video.width , height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
    
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, video.width, video.height);
   
    if (detections.length > 0) {
        
        if(count < 25)
        {
      // const blob = canvas.toDataURL("image/png");
      const imageObj = new Image();
      var src = "";
      // imageObj.onload = function(){
        
        const context = canvas.getContext("2d");
        context.drawImage(video,0,0,video.width,video.height);
        src = canvas.toDataURL("image/jpeg");
        
        imageObj.src = src;
        // console.log(src);  
        pic_array.push(imageObj);
        document.getElementById("img").appendChild(imageObj);
        document.getElementById("img").append(document.createElement("br"));
        // }
        count++;
        console.log(count);
        console.log(pic_array);
    }
    else if(count === 25)
    {
        video.pause();
    }
      faceapi.draw.drawDetections(canvas, resizedDetections);
      
      }
  }, 200)
})
function renderArray(pic_array)
{
    var container = document.getElementById("#img-container");
    for(let x=0;x<pic_array;x++)
    {
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
    console.log($("#user_id").val().length);
    if($("#user_id").val().length == 0){
        console.log("no userid");
        $("#user_id").focus(function() { 
            $(this).next("span").css("display", "border-box"); 
        });
        return;
    }

    if(pic_array.length ==0 )
    {
        alert("please take photo and try");
        
    }
  var form_data = new FormData();
  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic " + btoa("srinath" + ":" + "srnthsrdhrn"));
  myHeaders.append("Content-Type", "multipart/form-data; boundary=--------------------------967216418725170803396561");
  // myHeaders.append("Access-Control-Allow-Origin","true");  
  // myHeaders.append("Accept","*/*");        
  // myHeaders.append("Access-Control-Allow-Credentials","true");        
  // myHeaders.append("Accept-Encoding","gzip, deflate, br");        
  // myHeaders.append("mode","no-cors");

  
  var user_id =$("#user_id").val();
  console.log(user_id);
  form_data.append("username",user_id);
  for(var i=0;i<pic_array.length;i++)
  {
      var image_name = `image_${i+1}`;
      form_data.append(image_name,pic_array[i]);
  }
  var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: form_data,
    //   redirect: 'follow'
  };
  console.log(form_data);
  const response = await fetch("https://heimdall.iqube.io/upload_images/",requestOptions)
  
  const result = await response.text();
  console.log("POST RESULT IDENTIFIER.. ",result);
}
