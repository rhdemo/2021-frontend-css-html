// create a grid that looks like this
// reference image:
// https://techcommunity.microsoft.com/t5/image/serverpage/image-id/74120iEFB3B5B6BE577E0C
/*
 * |   | 1 | 2 | 3 | 4 | 5 |
 * | A |   |   |   |   |   |
 * | B |   |   |   |   |   |
 * | C |   |   |   |   |   |
 * | D |   |   |   |   |   |
 * | E |   |   |   |   |   |
 */

class Grid {
  get gridDimensions() {
    const boxDimensions = this.element.children[0].getBoundingClientRect();
    return {
      width: boxDimensions.width * this.columns,
      height: boxDimensions.height * this.rows,
      boxWidth: boxDimensions.width,
      boxHeight: boxDimensions.height
    };
  }

  get dragging() {
    return this.element.classList.contains("dragging");
  }

  set dragging(bool) {
    if (bool) {
      this.element.classList.add("dragging");
    } else {
      this.element.classList.remove("dragging");
    }
  }

  get draggingTouch() {
    return this.element.classList.contains("dragging-touch");
  }

  set draggingTouch(bool) {
    if (bool) {
      this.element.classList.add("dragging-touch");
    } else {
      this.element.classList.remove("dragging-touch");
    }
  }

  constructor(configuration) {
    this.rows = configuration.rows;
    this.columns = configuration.columns;
    this.element = null;
    this.render();

    configuration.container.appendChild(this.element);
  }

  render() {
    const rowsAlpha = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    const template = document.getElementById("box-tmpl");
    const container = document.createElement("div");

    container.classList.add("grid");

    let row = 0;
    let column = 0;

    for (let i = 0; i < this.rows * this.columns; i++) {
      let clone = template.content.cloneNode(true);
      let box = clone.querySelector(".box");

      column = i % this.columns;
      row = Math.floor(i / this.columns);

      // each grid box will look like this
      // <div class="box" row-alpha="LETTER" row="NUMBER" column="NUMBER">
      box.setAttribute("row-alpha", rowsAlpha[row]);
      box.setAttribute("row", row);
      box.setAttribute("column", column);

      container.appendChild(box);
    }

    this.element = container;
  }
}

export default Grid;
