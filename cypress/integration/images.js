import "../support/commands";

describe("images", function () {
  beforeEach(function () {
    cy.visit("/");
    cy.get("#delete").click();
    cy.clearLocalForage();
    cy.wait(2000);

    // remove text that Cypress seems to only sometimes think is hiding the image:
    cy.contains("Drag to move. To edit, hover then click pencil icon.").trigger(
      "mouseover"
    );
    cy.get("#edit_text_icon").click();
    cy.get("p").type("{selectall} "); // trigger deleting text
    cy.get("body").click();
  });

  it("can add image", function () {
    cy.get("img").should("not.exist");

    cy.get("#add_image").click();

    cy.fixture("cells-grid.png").then((fileContent) => {
      cy.get("input#select_image").attachFile("cells-grid.png");
    });

    cy.get("img").should("exist");
  });

  it("can delete image", function () {
    cy.get("img").should("not.exist");

    cy.get("#add_image").click();

    cy.fixture("cells-grid.png").then((fileContent) => {
      cy.get("input#select_image").attachFile("cells-grid.png");
    });

    cy.get("img").should("exist").trigger("mouseover");
    cy.get("#delete_image_icon").click();
    cy.on("window:confirm", () => true);

    cy.get("img").should("not.exist");
  });

  it("can drag image", function () {
    cy.get("#add_image").click();
    cy.fixture("cells-grid.png").then((fileContent) => {
      cy.get("input#select_image").attachFile("cells-grid.png");
    });

    cy.get("img")
      .should("have.css", "left", "182px")
      .should("have.css", "top", "21px");
    cy.get("img")
      .trigger("mousedown", {
        which: 1,
        clientX: 182,
        clientY: 21,
      })
      .trigger("mousemove", { which: 1, clientX: 700, clientY: 700 })
      .trigger("mouseup")
      .should("have.css", "left", "700px")
      .should("have.css", "top", "700px");
  });

  it("can change slide when image has focus", function () {
    cy.get("img").should("not.exist");

    cy.get("#add_image").click();

    cy.fixture("cells-grid.png").then((fileContent) => {
      cy.get("input#select_image").attachFile("cells-grid.png");
    });

    cy.get("img").should("exist");

    cy.get("img").focus().type("{downarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("body").focus().type("{uparrow}");
    cy.get("#slide_number").should("have.value", 1);
    cy.get("img").focus().type("{rightarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("body").focus().type("{leftarrow}");
    cy.get("#slide_number").should("have.value", 1);
  });
});
