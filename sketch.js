// Image to ASCII

// const density = "       ..::░░▒▒▓▓████";
// const density = "████▓▓▒▒░░::..     ";
// const density = "     ..::♥️♥️♣️♣️♠️♠️♦️♦️♦️♦️";
const density = "     ..::|/Xx&6#@";

let video;
let asciiDiv;
let containerDiv;
let cameraSelect;
let cameraSelected = 0;
let aspectRatio = 16 / 9;
let sourceText;
let sourceImg;
let startIndex = 0;
const devices = [];
let windowDimensions = {
  width: window.innerWidth,
  height: window.innerHeight,
};
let constraints;

function preload() {
  // sourceText = loadStrings("images/poem.txt");
  // sourceImg = loadImage("LRS-0809.jpg");

  cameraSelect = createSelect().hide();
  containerDiv = createDiv().id("container");
  asciiDiv = createDiv().id("ascii").parent(containerDiv);
}

function getAvailableDevices() {
  navigator.mediaDevices
    .getUserMedia({ audio: false, video: true })
    .then(function (stream) {
      if (stream.getVideoTracks().length < 0) {
        this.errorMessage.remove()
        console.error("No devices available.", stream.getVideoTracks());
        this.errorMessage = createDiv().parent(asciiDiv);
        this.errorMessage.html("No devices available :(");
        this.errorMessage.style("-webkit-text-stroke-width", "0px");
        this.errorMessage.style("color", "white");

        cameraSelect.hide();
      } else {
        if (this.errorMessage) {
          this.errorMessage.remove()
        }
        navigator.mediaDevices.enumerateDevices().then(gotDevices);
      }
    })
    .catch(function (error) {
      if (this.errorMessage) {
        this.errorMessage.remove()
      }
      
      console.error("Error accessing media devices.", error);

      this.consentContainer = createDiv().id("consentContainer");
      this.consentMessage = createP(`Error accessing media devices <br/><br/> ${error}`).parent(this.consentContainer);
      asciiDiv.child(this.consentContainer);

      cameraSelect.hide();
    });
}

function gotDevices(deviceInfos) {
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind == "videoinput") {
      console.info(deviceInfo.label, deviceInfo);
      devices.push(deviceInfo);
      cameraSelect.option(
        deviceInfo.label || "Host camera",
        deviceInfo.deviceId
      );
    }
  }
  let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  console.info("supportedConstraints", supportedConstraints);
  console.info("Devices", devices);

  if (devices.length > 0 && devices[0].deviceId) {
    cameraSelect.show();
    cameraSelect.changed((option) => {
      changeCamera(option.target.selectedIndex);
    });

    constraints = {
      video: {
        deviceId: {
          exact: devices[cameraSelected].deviceId,
        },
        aspectRatio: aspectRatio,
      },
      audio: false,
    };

    setupCamera();
  } else {
    console.error("No cameras found");

    this.errorMessage = createDiv().parent(asciiDiv);
    this.errorMessage.html("No cameras available :(");
    this.errorMessage.style("-webkit-text-stroke-width", "0px");
    this.errorMessage.style("color", "white");

    cameraSelect.hide();
  }
}

function changeCamera(camera) {
  cameraSelected = camera;
  console.info(devices[cameraSelected].label, devices[cameraSelected]);

  constraints = {
    video: {
      deviceId: {
        exact: devices[cameraSelected].deviceId,
      },
      aspectRatio: aspectRatio,
    },
    audio: false,
  };

  video.remove();
  video.stop();
  video = createCapture(constraints, { flipped: true });

  video.hide();
  video.volume(0);
  setupCamera();
}

function setup() {
  noCanvas();
  navigator.permissions.query({ name: "camera" }).then((result) => {
    if (result.state === "granted") {
      getAvailableDevices();
    } else if (result.state === "prompt") {
      new ConsentScreen(() => {
        console.log("Asking for camera access");
        this.errorMessage = createDiv().parent(asciiDiv);
        this.errorMessage.html("Asking for camera access");
        this.errorMessage.style("-webkit-text-stroke-width", "0px");
        this.errorMessage.style("color", "white");
    
        getAvailableDevices();
      });
    }
    // Don't do anything if the permission was denied.
  });
  
}

function setupCamera() {
  console.log(constraints);
  video = createCapture(constraints, { flipped: true });

  console.info("Window dimensions", windowDimensions);
  console.info("Video dimensions", {
    width: video.width,
    height: video.height,
  });

  const width = video.width; // 1920
  const height = video.height; // 1080
  const scale = 23;
  const total_pixels = width * height * (scale / 100);
  const w_ratio = height / width;
  const h_ratio = width / height;

  console.info("Ratio", `${w_ratio}/${h_ratio}`);
  console.info("Total pixels", total_pixels);

  const new_width = Math.sqrt(total_pixels / w_ratio);
  const new_height = Math.sqrt(total_pixels / h_ratio);

  console.info("Final resolution", { width: new_width, height: new_height });

  video.size(new_width, new_height);

  video.hide();
  video.volume(0);
}

function draw() {
  if (video) {
    video.loadPixels();
    let asciiImage = "";
    for (let j = 0; j < video.height; j++) {
      for (let i = 0; i < video.width; i++) {
        const pixelIndex = (i + j * video.width) * 4;
        const r = video.pixels[pixelIndex + 0];
        const g = video.pixels[pixelIndex + 1];
        const b = video.pixels[pixelIndex + 2];
        const avg = (r + g + b) / 3;
        const len = density.length;
        const charIndex = floor(map(avg, 0, 255, 0, len));
        const c = density.charAt(charIndex);
        if (c == " ") asciiImage += "&nbsp;";
        else asciiImage += c;
        // ? Renderizar con colores rompe todo porque es mucho texto
        // else asciiImage += "<span style=\"color: red\">" + c + "</span>";
      }
      asciiImage += "<br/>";
    }
    asciiDiv.html(asciiImage);
  }
}

function valueToHex(c) {
  var hex = c.toString(16);
  return hex;
}

function rgbToHex(r, g, b) {
  return valueToHex(r) + valueToHex(g) + valueToHex(b);
}
