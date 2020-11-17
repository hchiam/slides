describe("slide left/right/number", function () {
  it("can add/advance slide", function () {
    cy.visit("/");
    cy.get("#right").click();
    cy.get("#slide_number").should("have.value", 2);
  });

  it("can go to previous slide", function () {
    cy.visit("/");
    cy.get("#right").click();
    cy.get("#left").click();
    cy.get("#slide_number").should("have.value", 1);
  });

  it("can go to next/previous slide using slide number input", function () {
    cy.visit("/");
    cy.get("#slide_number").type("{uparrow}").should("have.value", 2);
    cy.get("#slide_number").type("{downarrow}").should("have.value", 1);
  });
});

describe("text", function () {
  it("can edit text", function () {
    cy.visit("/");
    cy.contains("Drag this to move around. Double-click to edit text.")
      .click()
      .type("edited")
      .invoke("text")
      .should("match", /.*edited.*/i);
  });

  it("can delete text", function () {
    cy.visit("/");
    cy.contains("Drag this to move around. Double-click to edit text.")
      .click()
      .type("{selectall} "); // trigger deleting text
    cy.get("body").click();
    cy.get("p").should("not.exist");
  });

  it("cannot add new default text when default text is in default position", function () {
    cy.visit("/");
    cy.contains("Drag this to move around. Double-click to edit text.").should(
      "have.length",
      1
    );
    cy.get("#add_text").click();
    cy.get("p").should("have.length", 1);
    cy.get("#add_big_text").click();
    cy.get("p").should("have.length", 1);
  });

  it("can add text", function () {
    cy.visit("/");
    cy.get("p").click().type("{selectall} "); // trigger deleting text
    cy.get("body").click();
    cy.get("p").should("not.exist");
    cy.get("#add_text").click();
    cy.get("p").should("exist");
    cy.get("p")
      .invoke("text")
      .should("equal", "Drag this to move around. Double-click to edit text.");
  });

  // TODO: test dragging text (will need to check positions changed)
});

describe("image", function () {
  it("can add image", function () {
    cy.visit("/");

    cy.get("img").should("not.exist");

    cy.get("#add_image").click();

    cy.fixture("cells-grid.png").then((fileContent) => {
      cy.get("input#select_image").attachFile("cells-grid.png");
    });

    cy.get("img").should("exist");
  });

  it("can delete image", function () {
    cy.visit("/");

    cy.get("img").should("not.exist");

    cy.get("#add_image").click();

    cy.fixture("cells-grid.png").then((fileContent) => {
      cy.get("input#select_image").attachFile("cells-grid.png");
    });

    cy.get("img").should("exist").dblclick();
    cy.on("window:confirm", () => true);

    cy.get("img").should("not.exist");
  });
});
