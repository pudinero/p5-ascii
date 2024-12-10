let video;
// const density = "   ..::░░▒▒▓▓████";
const density = "     ..::|/Xx&6#@";
// const density = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^\`'. `;
// const density = "     ..::-=+*#%@";
let font;
const fontAspectRatio_W = 128;
const fontAspectRatio_H = 75;
let fisheyeShader;
let canvas;
let graphics;
const devices = [];
let scale = 30;

let constraints;
let isMobile;

let cameraSelect;
let cameraDropdown;
let cameraSelected = 0;

function preload() {
  fisheyeShader = loadShader("./shaders/fisheye.vert", "./shaders/fisheye.frag");
  font = loadFont("./assets/CascadiaCode-Regular.otf");
  cameraDropdownContainer = select("#camera-dropdown-container");
  cameraDropdown = select("#camera-dropdown");

  containerDiv = select("#container");
  asciiDiv = select("#tv-screen");
  isMobile = deviceOrientation !== undefined;
}

function setupCamera() {
  console.log(isMobile);
  video = createCapture(constraints, { flipped: !isMobile });

  const total_pixels = fontAspectRatio_W * fontAspectRatio_H * (scale / 100);
  const w_ratio = fontAspectRatio_H / fontAspectRatio_W;
  const h_ratio = fontAspectRatio_W / fontAspectRatio_H;

  console.info("Ratio", `${w_ratio}/${h_ratio}`);
  console.info("Total pixels", total_pixels);

  new_width = Math.sqrt(total_pixels / w_ratio);
  new_height = Math.sqrt(total_pixels / h_ratio);

  console.info("Final resolution", { width: new_width, height: new_height });

  video.size(new_width, new_height);
  video.hide();
}

function getAvailableDevices() {
  navigator.mediaDevices
    .getUserMedia({ audio: false, video: true })
    .then(function (stream) {
      if (stream.getVideoTracks().length < 0) {
        this.errorMessage.remove();
        console.error("No devices available.", stream.getVideoTracks());
        this.errorMessage = createDiv()
          .parent(asciiDiv)
          .addClass(
            "flex flex-col justify-center items-center gap-6 text-lime-500 bg-zinc-950/30 h-full w-full font-mono absolute max-md:p-5 p-12 text-pretty"
          );
        this.errorMessage.html("No devices available :(");
        this.errorMessage.style("-webkit-text-stroke-width", "0px");
        this.errorMessage.style("color", "white");

        cameraDropdownContainer.hide();
      } else {
        if (this.errorMessage) {
          this.errorMessage.remove();
        }
        navigator.mediaDevices.enumerateDevices().then(gotDevices);
      }
    })
    .catch(function (error) {
      if (this.errorMessage) {
        this.errorMessage.remove();
      }

      console.error("Error accessing media devices.", error);

      this.consentContainer = createDiv()
        .id("consentContainer")
        .addClass(
          "flex flex-col justify-center items-center gap-6 text-lime-500 bg-zinc-950/30 h-full w-full font-mono absolute max-md:p-5 p-12 text-pretty"
        );
      this.consentMessage = createP(
        `Error accessing media devices <br/><br/> ${error}`
      ).parent(this.consentContainer);
      asciiDiv.child(this.consentContainer);

      cameraDropdownContainer.hide();
    });
}

function changeCamera(camera) {
  cameraSelected = camera;
  console.info(cameraSelected.label, cameraSelected);
  const cameraSelectedLabel = select("#selected-camera");
  cameraSelectedLabel.html(cameraSelected.label);

  constraints = {
    video: {
      deviceId: {
        exact: cameraSelected.deviceId,
      },
    },
    audio: false,
  };

  video.remove();
  video.stop();
  video = createCapture(constraints, { flipped: !isMobile });

  video.hide();
  video.volume(0);
  setupCamera();
}

function gotDevices(deviceInfos) {
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind == "videoinput") {
      console.info(deviceInfo.label, deviceInfo);
      devices.push(deviceInfo);

      const cameraOption = createDiv()
        .addClass("px-4 py-2 hover:bg-gray-100")
        .html(deviceInfo.label || "Host camera")
        .value(deviceInfo)
        .mouseClicked((event) => {
          changeCamera(event.target.value);
        });

      cameraOption.elt.setAttribute("x-on:click", "open = false");
      cameraDropdown.child(cameraOption);
    }
  }
  let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  console.info("supportedConstraints", supportedConstraints);
  console.info("Devices", devices);

  if (devices.length > 0 && devices[0].deviceId) {
    cameraDropdownContainer.show();
    const cameraSelectedLabel = select("#selected-camera");
    cameraSelectedLabel.html(devices[cameraSelected].label);

    constraints = {
      video: {
        deviceId: {
          exact: devices[cameraSelected].deviceId,
        },
      },
      audio: false,
    };

    setupCamera();
  } else {
    console.error("No cameras found");

    this.errorMessage = createDiv()
      .parent(asciiDiv)
      .addClass(
        "flex flex-col justify-center items-center gap-6 text-lime-500 bg-zinc-950/30 h-full w-full font-mono absolute max-md:p-5 p-12 text-pretty"
      );
    this.errorMessage.html("No cameras available :(");
    this.errorMessage.style("-webkit-text-stroke-width", "0px");
    this.errorMessage.style("color", "white");

    cameraSelect.hide();
  }
}

function loadVideoPixels() {
  // Clear the graphics buffer
  graphics.clear();

  if (video) {
    video.loadPixels();
    // video.size(128, 75);
    let w = width / video.width;
    let h = height / video.height;
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
        graphics.textSize(w);
        graphics.textFont(font);
        graphics.textAlign(CENTER, CENTER);

        //////////// ? Draw characters ////////////
        // graphics.noStroke();

        // ! Text with color
        graphics.fill(r, g, b);

        // * Text on grayscale
        // graphics.fill(avg);

        // * Draw individual characters
        graphics.text(c, i * w + w / 2, j * h + h / 1.75);

        ////////// ? Draw bounding boxes //////////
        // ! Fill color
        // graphics.fill(r, g, b);

        // * Fill white
        graphics.fill(255, 255, 255, 0);

        // ! Fill grayscale
        // graphics.fill(avg);

        // * Green stroke
        // graphics.stroke(0, 255, 0)

        // * Draw individual bounding box
        graphics.square(i * w, j * h + h / 3.5, w);
      }
    }
  }
}

function setup() {
  const dimensions = convertToAspectRatio(windowWidth);
  canvas = createCanvas(dimensions.horizontal, dimensions.vertical - 7, WEBGL);
  canvas.parent("tv-screen");
  canvas.addClass("max-w-full max-h-full aspect-[4/3]");
  graphics = createGraphics(dimensions.horizontal, dimensions.vertical);

  navigator.permissions.query({ name: "camera" }).then((result) => {
    if (result.state === "granted") {
      getAvailableDevices();
    } else if (result.state === "prompt") {
      new ConsentScreen(() => {
        console.log("Asking for camera access");
        this.errorMessage = createDiv()
          .parent(asciiDiv)
          .addClass(
            "flex flex-col justify-center items-center gap-6 text-lime-500 bg-zinc-950/30 h-full w-full font-mono absolute max-md:p-5 p-12 text-pretty"
          );
        this.errorMessage.html("Asking for camera access");
        this.errorMessage.style("-webkit-text-stroke-width", "0px");
        this.errorMessage.style("padding", "120px");
        this.errorMessage.style("color", "white");

        getAvailableDevices();
      });
    }
    // * Don't do anything if the permission was denied.
  });
}

function draw() {
  background(0, 0, 0, 0);
  loadVideoPixels();

  // Use the fish-eye shader
  shader(fisheyeShader);

  // Set the shader uniforms
  fisheyeShader.setUniform("uTexture", graphics);
  fisheyeShader.setUniform("uResolution", [graphics.width, graphics.height]);
  fisheyeShader.setUniform("uDistortion", 1.05);

  // Draw a rectangle that covers the entire canvas
  rect(0, 0, width, height);
}

function convertToAspectRatio(horizontal, vertical) {
  // Aspect ratio 4:3
  const aspectRatio = 4 / 3;

  // Use the given horizontal value to calculate the new vertical value
  const adjustedVertical = horizontal / aspectRatio;

  // Return the new dimensions
  return {
    horizontal: horizontal,
    vertical: adjustedVertical,
  };
}
