import "../support/commands";

describe("slides: left/right/number", function () {
  beforeEach(function () {
    cy.visit("/");
    cy.get("#delete").click();
    cy.clearLocalForage();
    cy.wait(2000);
  });

  it("can add/advance slide", function () {
    cy.get("#right").click();
    cy.get("#slide_number").should("have.value", 2);
  });

  it("can go to previous slide", function () {
    cy.get("#right").click();
    cy.get("#left").click();
    cy.get("#slide_number").should("have.value", 1);
  });

  it("can go to next/previous slide using slide number input", function () {
    cy.get("#slide_number").click().type("{uparrow}").should("have.value", 2);
    cy.get("#slide_number").click().type("{downarrow}").should("have.value", 1);
  });

  it("can go left/right when arrow keys on body", function () {
    cy.get("body").click().type("{downarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("body").click().type("{uparrow}");
    cy.get("#slide_number").should("have.value", 1);
    cy.get("body").click().type("{rightarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("body").click().type("{leftarrow}");
    cy.get("#slide_number").should("have.value", 1);
  });

  it("can go left/right when arrow keys on any buttons", function () {
    cy.get("body").click().tab();
    cy.get("#right").focus().type("{downarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#left").focus().type("{uparrow}");
    cy.get("#slide_number").should("have.value", 1);
    cy.get("#right").focus().type("{rightarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#left").focus().type("{leftarrow}");
    cy.get("#slide_number").should("have.value", 1);

    cy.get("#add_text").focus().type("{downarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#add_text").focus().type("{uparrow}");
    cy.get("#slide_number").should("have.value", 1);
    cy.get("#add_text").focus().type("{rightarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#add_text").focus().type("{leftarrow}");
    cy.get("#slide_number").should("have.value", 1);

    cy.get("#add_big_text").focus().type("{downarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#add_big_text").focus().type("{uparrow}");
    cy.get("#slide_number").should("have.value", 1);
    cy.get("#add_big_text").focus().type("{rightarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#add_big_text").focus().type("{leftarrow}");
    cy.get("#slide_number").should("have.value", 1);

    cy.get("#add_image").focus().type("{downarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#add_image").focus().type("{uparrow}");
    cy.get("#slide_number").should("have.value", 1);
    cy.get("#add_image").focus().type("{rightarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#add_image").focus().type("{leftarrow}");
    cy.get("#slide_number").should("have.value", 1);

    cy.get("#fullscreen").focus().type("{downarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#fullscreen").focus().type("{uparrow}");
    cy.get("#slide_number").should("have.value", 1);
    cy.get("#fullscreen").focus().type("{rightarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#fullscreen").focus().type("{leftarrow}");
    cy.get("#slide_number").should("have.value", 1);

    cy.get("#share").focus().type("{downarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#share").focus().type("{uparrow}");
    cy.get("#slide_number").should("have.value", 1);
    cy.get("#share").focus().type("{rightarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#share").focus().type("{leftarrow}");
    cy.get("#slide_number").should("have.value", 1);

    cy.get("#delete").focus().type("{downarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#delete").focus().type("{uparrow}");
    cy.get("#slide_number").should("have.value", 1);
    cy.get("#delete").focus().type("{rightarrow}");
    cy.get("#slide_number").should("have.value", 2);
    cy.get("#delete").focus().type("{leftarrow}");
    cy.get("#slide_number").should("have.value", 1);
  });
});
