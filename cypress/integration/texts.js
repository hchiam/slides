describe("texts", function () {
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
