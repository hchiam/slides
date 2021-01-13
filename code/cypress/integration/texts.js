import "../support/commands";

describe("texts", function () {
  beforeEach(function () {
    cy.visit("/");
    cy.get("#delete").click();
    cy.clearLocalForage();
    cy.wait(2000);
  });

  it("can edit text", function () {
    cy.contains("Drag this to move around. Double-click to edit text.")
      .click()
      .type("edited")
      .invoke("text")
      .should("match", /.*edited.*/i);
  });

  it("can delete text via emptying text, but must be after click, not after dragging", function () {
    cy.contains("Drag this to move around. Double-click to edit text.")
      .trigger("mousedown", { which: 1, clientX: 314, clientY: 298 })
      .trigger("mousemove", { clientX: 700, clientY: 100 })
      .trigger("mouseup", { force: true })
      .type("{selectall} ");
    cy.get("body").click();
    cy.get("p").should("exist");

    cy.contains("Drag this to move around. Double-click to edit text.")
      .dblclick()
      .type("{selectall} "); // trigger deleting text
    cy.get("body").click();
    cy.get("p").should("not.exist");
  });

  it("can delete text via dragging once and hitting delete", function () {
    cy.contains("Drag this to move around. Double-click to edit text.")
      .trigger("mousedown", { which: 1, clientX: 314, clientY: 298 })
      .trigger("mousemove", { clientX: 700, clientY: 100 })
      .trigger("mouseup", { force: true })
      .type("{del}");
    cy.get("body").click();
    cy.get("p").should("not.exist");
  });

  it("hitting delete while editing text should not trigger deleting whole text", function () {
    cy.contains("Drag this to move around. Double-click to edit text.")
      .dblclick()
      .type("edit and then hit delete key{del}");
    cy.get("body").click();
    cy.get("p").should("exist");
  });

  it("cannot add new default text when default text is in default position", function () {
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
    cy.get("p").click().type("{selectall} "); // trigger deleting text
    cy.get("body").click();
    cy.get("p").should("not.exist");
    cy.get("#add_text").click();
    cy.get("p").should("exist");
    cy.get("p")
      .invoke("text")
      .should("equal", "Drag this to move around. Double-click to edit text.");
  });

  it("can drag text", function () {
    cy.get("p")
      .should("have.css", "left", "154.758px")
      .should("have.css", "top", "309.5px");
    cy.get("p")
      .trigger("mousedown", { which: 1, clientX: 155, clientY: 310 })
      .trigger("mousemove", { clientX: 100, clientY: 100 })
      .trigger("mouseup", { force: true })
      .should("have.css", "left", "100px")
      .should("have.css", "top", "100px");
  });
});
