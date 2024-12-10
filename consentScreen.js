class ConsentScreen {
  constructor(callback) {
    this.callback = callback;
    this.createConsentScreen();
  }

  createConsentScreen() {
    this.tv_screen = select("#tv-screen");
    this.consentContainer = createDiv().id("consentContainer").addClass("flex flex-col justify-center items-center gap-6 text-lime-500 bg-zinc-950/30 h-full w-full font-mono absolute max-md:p-5 md:flex-row p-12 text-pretty")
    this.consentMessage = createP(
      "This application requires access to your camera. Please provide your consent to continue."
    ).parent(this.consentContainer);
    this.tv_screen.child(this.consentContainer);

    this.consentButton = createButton("Ask for camera access").parent(
      this.consentContainer
    ).addClass("bg-red-600 hover:bg-lime-300 text-zinc-50 hover:text-zinc-950 rounded max-sm:w-full w-3/4 py-2");

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
  }
}
