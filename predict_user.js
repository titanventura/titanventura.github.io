const video = document.getElementById('video')

Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
	navigator.getUserMedia(
		{ video: true },
		stream => video.srcObject = stream,
		err => console.error(err)
	)
}

var i = 0;
video.addEventListener('play', () => {
	const canvas = faceapi.createCanvasFromMedia(video)
	document.getElementById("vid-container").append(canvas)
	const displaySize = { width: video.width, height: video.height }
	faceapi.matchDimensions(canvas, displaySize)
	while(true){
		setTimeout(async()=>{
		// To Detect all faces.
		// const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());

		// To detect single face.
		const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
		canvas.getContext('2d').clearRect(0, 0, video.width, video.height);
		if (detection != null) 
		{
			// Should be only here.. not anywhere else
			const resizedDetections = faceapi.resizeResults(detection, displaySize);
			
			// const blob = canvas.toDataURL("image/png");

			const imageObj = document.getElementById("pic");
			const context = canvas.getContext("2d");
			context.drawImage(video, 0, 0, video.width, video.height);
			var src = "";
			src = canvas.toDataURL("image/jpeg");
			imageObj.src = src;

			var block = src.split(";");
			// Get the content type of the image
			var contentType = block[0].split(":")[1];// In this case "image/gif"
			// get the real base64 content of the file
			var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
			// Convert it to a blob to upload
			var blob = b64toBlob(realData, "png");
			console.log(detection);
			postImage(blob).then(res=>{
				if (res.user != null) {
					const box = detection._box
					const drawBox = new faceapi.draw.DrawBox(box, { label: res.user })
					drawBox.draw(canvas)
				}
				else if (res.user == null) {
					const box = detection._box
					const drawBox = new faceapi.draw.DrawBox(box, { label: "searching" })
					drawBox.draw(canvas)
				}
			})
			
			// face detector only.
			// faceapi.draw.drawDetections(canvas, resizedDetections);
		}
	},150);
	}
})

function b64toBlob(b64Data, contentType, sliceSize) 
{
	contentType = contentType || '';
	sliceSize = sliceSize || 512;
	var byteCharacters = atob(b64Data);
	var byteArrays = [];
	for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) 
	{
		var slice = byteCharacters.slice(offset, offset + sliceSize);
		var byteNumbers = new Array(slice.length);
		for (var i = 0; i < slice.length; i++) 
		{
			byteNumbers[i] = slice.charCodeAt(i);
		}
		var byteArray = new Uint8Array(byteNumbers);
		byteArrays.push(byteArray);
	}
	var blob = new Blob(byteArrays, { type: contentType });
	return blob;
}

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
	form_data.append("image_1", blob);
	for (var i of form_data.entries()) {
		console.log(i[0] + " " + i[1]);
	}
	var requestOptions = {
		"url": "https://heimdall.iqube.io/predict_user/",
		"method": 'POST',
		"timeout": 0,
		"headers": {
			"Authorization": "Basic c3JpbmF0aDpzcm50aHNyZGhybg==",
		},
		"processData": false,
		"mimeType": "multipart/form-data",
		"contentType": false,
		"data": form_data
	};
	var result = await $.ajax(requestOptions).done(function (res) { 
		console.log(res) 
	})

	response = JSON.parse(result)
	document.getElementById("user").textContent = response.message
	return response;

	// ---- FETCH request ----
	// const response = await fetch("https://heimdall.iqube.io/predict_user/",requestOptions)
	// const result = await response.text();
	// console.log("POST RESULT IDENTIFIER.. ",result);
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
