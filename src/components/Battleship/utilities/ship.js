class Ship {
  get shipTemplate() {
    return document.getElementById("ship-tmpl");
  }

  get shipPieceTemplate() {
    return document.getElementById("ship-piece-tmpl");
  }

  get position() {
    return {
      x: this.element.style.left || 0,
      y: this.element.style.top || 0
    };
  }

  set position(coordinates) {
    this.element.style.left = `${coordinates.x}px`;
    this.element.style.top = `${coordinates.y}px`;
  }

  get orientation() {
    return this.element.getAttribute("orientation");
  }

  set orientation(orientationString) {
    this.element.setAttribute("orientation", orientationString);

    if (orientationString === "horizontal") {
      this.element.style.transformOrigin = "40px 40px";
      this.element.style.transform = "rotate(-90deg)";
    } else {
      this.element.style.transformOrigin = null;
      this.element.style.transform = null;
    }
  }

  get dragging() {
    return this.element.classList.contains("dragging");
  }

  set dragging(bool) {
    if (bool) {
      this.element.classList.add("dragging");
      this.element.style.pointerEvents = "none"
    } else {
      this.element.classList.remove("dragging");
      this.element.style.pointerEvents = "initial"
    }
  }

  constructor(configuration) {
    this.toggleRotation = this.toggleRotation.bind(this);

    this.configuration = configuration;
    this.id = configuration.id;
    this.type = configuration.type;
    this.length = configuration.length;
    this.element = null;
    this.rotateElement = null;
    this.render();

    this.orientation = configuration.orientation || "vertical";
    this.addEventListeners();
  }

  render() {
    const template = this.shipTemplate.content.cloneNode(true);
    const shipElement = template.querySelector(".ship");

    shipElement.setAttribute("ship-id", this.id);
    shipElement.setAttribute("type", this.type);

    for (let i = 0; i < this.length; i++) {
      const shipPieceTemplate = this.shipPieceTemplate.content.cloneNode(true);
      const shipPieceElement = shipPieceTemplate.querySelector(".ship-piece");

      shipPieceElement.setAttribute("ship-piece", i);
      shipPieceElement.setAttribute("type", this.type)
      shipPieceElement.setAttribute("ship-id", this.id);
      shipElement.insertBefore(shipPieceElement, shipElement.querySelector(".rotate"));
    }

    this.element = shipElement;
    this.rotateElement = shipElement.querySelector(".rotate");
    return shipElement;
  }

  addEventListeners() {
    this.rotateElement.addEventListener("click", this.toggleRotation, false);
  }

  removeEventListeners() {
    this.rotateElement.addEventListener("click", this.toggleRotation, false);
  }

  toggleRotation() {
    const beforeRotationEvent = new CustomEvent("ship:rotate-before", {
      bubbles: true,
      detail: {
        orientation: this.orientation
      }
    });

    this.element.dispatchEvent(beforeRotationEvent);

    this.orientation = this.orientation === "horizontal" ? "vertical" : "horizontal";

    const event = new CustomEvent("ship:rotate", {
      bubbles: true,
      detail: {
        orientation: this.orientation
      }
    });

    this.element.dispatchEvent(event);
  }
}

export default Ship;