const url_1 = "https://heimdall.iqube.io";
const url_2 = "http://10.1.76.101:8000";


const video = document.getElementById("video");
const isScreenSmall = window.matchMedia("(max-width: 700px)");
var can_snap = true;

/****Loading the model ****/
let MODELURL = "/models"
/****Loading the model ****/
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODELURL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODELURL),
  faceapi.nets.ssdMobilenetv1.loadFromUri(MODELURL)
]).then(startVideo);
// Promise.all([faceapi.nets.ssdMobilenetv1.loadFromUri("/models")]).then(startVideo);

function startVideo() {
	navigator.mediaDevices.getUserMedia({ video: true })
		.then(function (mediaStream) {
			var video = document.querySelector('#video');
			video.srcObject = mediaStream;
			video.onloadedmetadata = function (e) {
				video.play();
			};
		})
		.catch(function (err) { console.log(err.name + ": " + err.message); });

}

/****Fixing the video with based on size size  ****/
function screenResize(isScreenSmall) {
	if (isScreenSmall.matches) {
		video.style.width = "360px";
	} else {
		video.style.width = "500px";
	}
}

screenResize(isScreenSmall);
isScreenSmall.addListener(screenResize);
let displaySize = null;
let canvas = null;
const MAX_LIMIT = 30;
const INTERVAL = 100;


async function detectImage() {
	const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());

	if (detection != null && can_snap == true) {
		// Should be only here.. not anywhere else
		const resizedDetections = faceapi.resizeResults(detection, displaySize);
		// const blob = canvas.toDataURL("image/png");
		const imageObj = new Image();
		const context = canvas.getContext("2d");
		context.drawImage(video, 0, 0, video.width, video.height);
		var src = "";
		src = canvas.toDataURL("image/jpeg");
		imageObj.src = src;
		var block = src.split(";");
		// Get the content type of the image
		var contentType = block[0].split(":")[1]; // In this case "image/gif"
		// get the real base64 content of the file
		var realData = block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."
		// Convert it to a blob to upload
		var blob = b64toBlob(realData, "png");
		// console.log("detection", detection);
		// can_snap = false;
		return [blob, resizedDetections];
	} else {
		// canvas.getContext("2d").clearRect(0, 0, video.width, video.height);
		return [];
	}
}

function resetActiveJob() {
	setTimeout(() => {
		JOB_ACTIVE = false;
	}, 3000);
}

let JOB_ACTIVE = false;
let CURRENT_IMAGE_INDEX = 1;
async function imageDetectionJob() {
	if (CURRENT_IMAGE_INDEX <= MAX_LIMIT) {
		let result = await detectImage();
		if (result.length) {
			JOB_ACTIVE = true;
			document.getElementById("user").textContent = `Processing Image: ${CURRENT_IMAGE_INDEX}`;
			const [blob, detections] = result;
			canvas.getContext("2d").clearRect(0, 0, video.width, video.height);
			canvas.getContext("2d").clearRect(0, 0, video.width, video.height);
			postImage(blob)
				.then(res => {
					if (res.user != null) {
						const box = detections._box;
						const drawBox = new faceapi.draw.DrawBox(box, {
							label: res.user,
							boxColor: "green",
							lineWidth: 5,
							drawLabelOptions: { fontSize: 25 }
						});
						drawBox.draw(canvas);
						// can_snap = true;
						document.getElementById("user").textContent = `Image ${CURRENT_IMAGE_INDEX} detected\n User: ${res.user}`;
						CURRENT_IMAGE_INDEX++;
						resetActiveJob();
					} else if (res.user == null) {
						// const box = resizedDetections._box
						// const drawBox = new faceapi.draw.DrawBox(box, { label: "searching", boxColor: "red", lineWidth: 5, drawLabelOptions: { fontSize: 25 } })
						// drawBox.draw(canvas)
						// can_snap = true;
						document.getElementById("user").textContent = `Image ${CURRENT_IMAGE_INDEX} not detected\n Message: ${res.message}`;
						resetActiveJob();
					}
				})
				.catch(err => {
					console.log(err);
					document.getElementById("user").textContent = `Image ${CURRENT_IMAGE_INDEX} error occured\n (Check Console)`;
					resetActiveJob();
				});
		}
	}
}

const CHECK_INTERVAL = 500;
video.addEventListener("play", async () => {
	console.log(window.innerWidth);
	canvas = faceapi.createCanvasFromMedia(video);
	displaySize = { width: video.offsetWidth, height: video.offsetHeight };
	document.getElementById("containerr").append(canvas);
	faceapi.matchDimensions(canvas, displaySize);
	setInterval(() => {
		canvas.getContext("2d").clearRect(0, 0, video.width, video.height);
		CURRENT_IMAGE_INDEX == MAX_LIMIT
			? (document.getElementById("user").textContent = `All images uploaded`)
			: (document.getElementById("user").textContent = `Image not detected yet`);
		if (!JOB_ACTIVE) imageDetectionJob();
	}, CHECK_INTERVAL);
});


function b64toBlob(b64Data, contentType, sliceSize) {
	contentType = contentType || "";
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

// important function
async function postImage(blob) {
	var form_data = new FormData();
	const myHeaders = new Headers();
	myHeaders.append("Authorization", "Basic c3JpbmF0aDpzcm50aHNyZGhybg==");


	form_data.append("image_1", blob);
	for (var i of form_data.entries()) {
		console.log(i[0] + " " + i[1]);
	}
	var requestOptions = {
		url: "https://heimdall.iqube.io/predict_user/",
		method: "POST",
		timeout: 0,
		headers: {
			Authorization: "Basic c3JpbmF0aDpzcm50aHNyZGhybg=="
		},
		processData: false,
		mimeType: "multipart/form-data",
		contentType: false,
		data: form_data
	};
	var result = await $.ajax(requestOptions).done(function (res) {
		console.log(res);
	});

	response = JSON.parse(result);
	console.log("canvas count", document.getElementsByName("canvas").length);
	return response;
}

const capitalize = s => {
	if (typeof s !== "string") return "";
	return s.charAt(0).toUpperCase() + s.slice(1);
};