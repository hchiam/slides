describe("images", function () {
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
