class ConsentScreen {
  constructor(callback) {
    this.callback = callback;
    this.createConsentScreen();
  }

  createConsentScreen() {
    this.asciiDiv = select("#ascii");
    this.consentContainer = createDiv().id("consentContainer");
    this.consentMessage = createP(
      "This application requires access to your camera. Please provide your consent to continue."
    ).parent(this.consentContainer);
    this.asciiDiv.child(this.consentContainer);

    this.consentButton = createButton("Ask for camera access").parent(
      this.consentContainer
    );

    this.consentButton.mousePressed(() => {
      navigator.permissions
        .query({ name: "camera" })
        .then(() => {
          this.consentContainer.remove();
          if (this.callback) {
            this.callback();
          }
        })
        .catch((error) => {
          console.log("Got error :", error);
        });
    });

    // Hover effect for the button
    this.consentButton.mouseOver(() =>
      this.consentButton.style("background-color", "#70FF7E30")
    ); // Lighter green on hover
    this.consentButton.mouseOut(() =>
      this.consentButton.style("background-color", "transparent")
    );
  }
}
