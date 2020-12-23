import "../support/commands";

describe("images", function () {
  beforeEach(function () {
    cy.visit("/");
    cy.get("#delete").click();
    cy.clearLocalForage();
    cy.wait(2000);
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

    cy.get("img").should("exist").dblclick();
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
      .trigger("mousedown", { which: 1, clientX: 182, clientY: 21 })
      .trigger("mousemove", { clientX: 700, clientY: 100 })
      .trigger("mouseup", { force: true })
      .should("have.css", "left", "700px")
      .should("have.css", "top", "100px");
  });
});
