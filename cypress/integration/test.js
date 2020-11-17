describe("test slides", function () {
  it("can edit text", function () {
    cy.visit("/");
    cy.contains("Drag this to move around. Double-click to edit text.")
      .click()
      .type("edited")
      .invoke("text")
      .should("match", /.*edited.*/i);
  });

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

  it("can delete text", function () {
    cy.visit("/");
    cy.contains("Drag this to move around. Double-click to edit text.")
      .click()
      .type("{selectall} {enter}");
    cy.get("body").click();
    cy.get("p").should("not.exist");
  });
});
