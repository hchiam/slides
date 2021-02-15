import "../support/commands";

describe("memory", function () {
  beforeEach(function () {
    cy.visit("/");
    cy.get("#delete").click();
    cy.clearLocalForage();
    cy.wait(2000);
  });

  it("persists data after hitting refresh", function () {
    cy.get("p").click().type("{selectall}Edited text.").blur();

    cy.get("#add_image").click();
    cy.fixture("cells-grid.png").then((fileContent) => {
      cy.get("input#select_image").attachFile("cells-grid.png");
    });

    cy.get("body").click(); // instead of cy.wait(1);

    cy.get("#right").click();

    cy.get("#add_text").click();
    cy.get("p:visible").click().type("{selectall}text 2").blur();

    cy.reload();

    cy.get("p:visible").should("exist");
    cy.get("p:visible").should("have.text", "Edited text.");

    cy.get("img:visible").should("exist");
    cy.get("img:visible")
      .should("have.attr", "src")
      .should("equal", cellsGridSrc);

    cy.get("#right").click();

    cy.get("p:visible").should("exist");
    cy.get("p:visible").should("have.text", "text 2");

    cy.get("img:visible").should("not.exist");
  });

  it("can delete all slides", function () {
    cy.get("p").click().type("{selectall}Edited text.").blur();

    cy.get("#add_image").click();
    cy.fixture("cells-grid.png").then((fileContent) => {
      cy.get("input#select_image").attachFile("cells-grid.png");
    });

    cy.get("body").click(); // instead of cy.wait(1);

    cy.get("#right").click();

    cy.get("#add_text").click();
    cy.get("p:visible").click().type("{selectall}text 2").blur();

    cy.get("#delete").click();

    cy.get("p:visible").should("have.length", 1);

    cy.get("p:visible").should("have.text", defaultTextString);
  });

  it("can reuse slides", function () {
    cy.get("p").should("have.length", 1).should("have.text", defaultTextString);

    cy.window().then((win) => {
      win.upload(); // cy.get("#upload").click();
    });

    cy.fixture("slides_data.json").then((fileContent) => {
      cy.get("input#select_json_file").attachFile("slides_data.json");
    });

    cy.get("body").click(); // instead of cy.wait(1);

    cy.get("p:visible").its("length").should("be.gt", 1);
    cy.get("img:visible").should("exist");

    cy.get("#right").click();
    cy.get("#slide_number").should("have.value", 2);
    cy.get("p:visible").its("length").should("be.gt", 1);
    cy.get("img:visible").should("exist");

    cy.get("#right").click();
    cy.get("#slide_number").should("have.value", 3);
    cy.get("p:visible").should("have.length", 1).should("have.text", "3");
    cy.get("img:visible").should("exist");

    cy.get("#right").click();
    cy.get("#slide_number").should("have.value", 4);
    cy.get("p:visible").should("have.text", "4");
    cy.get("img:visible").should("not.exist");

    cy.get("#slide_number").focus().type("{selectall}6{enter}");
    cy.get("p:visible").should("not.exist");
    cy.get("img:visible").should("not.exist");

    cy.get("#slide_number").type("{selectall}1");
  });
});

var defaultTextString = "Drag this to move around. Double-click to edit text.";

var cellsGridSrc =
  "data:image/png;base64,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";
