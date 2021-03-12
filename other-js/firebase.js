window.Firebase = {
  firebaseConfig: {
    projectId: "simple-slides",
  },

  database: null,
  collection: null,

  initialize: function () {
    firebase.initializeApp(this.firebaseConfig);
    this.database = window.firebase.firestore();
    this.collection = this.database.collection("slides");
    this.useLink();
  },

  createLink: function (callback) {
    if (!memory) return;

    if (memory.id) {
      this.updateExistingDoc(memory.id, callback);
    } else {
      this.createNewDoc(callback);
    }
  },

  updateExistingDoc: function (docId, callback) {
    if (!memory) return;

    var existingDoc = this.database.collection("slides").doc(docId);

    existingDoc
      .set({
        data: JSON.stringify(memory),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        if (callback) callback(docId);
      })
      .catch((error) => {
        alert(
          "Could not create link - please wait and try again later. \n\nAlternatively, you can download your data."
        );
        console.log(error);
        Firebase.showShareButton(false);
        Firebase.showSaveButton();
        Firebase.showUploadButton();
        setTimeout(() => {
          Firebase.showShareButton();
          Firebase.showSaveButton(false);
          Firebase.showUploadButton(false);
        }, 60000);
      });
  },

  createNewDoc: function (callback) {
    if (!memory) return;

    this.database
      .collection("slides")
      .add({
        data: JSON.stringify(memory),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((newDoc) => {
        // store id in memory:
        memory.id = newDoc.id;
        Memory.updatePersistentMemory(memory);
        if (callback) callback(newDoc.id);
      })
      .catch((error) => {
        alert(
          "Could not create link - please wait and try again later. \n\nAlternatively, you can download your data."
        );
        console.log(error);
        Firebase.showShareButton(false);
        Firebase.showSaveButton();
        Firebase.showUploadButton();
        setTimeout(() => {
          Firebase.showShareButton();
          Firebase.showSaveButton(false);
          Firebase.showUploadButton(false);
        }, 60000);
      });
  },

  showShareButton: function (show = true) {
    document.querySelector("#share").style.display = show ? "inline" : "none";
  },
  showSaveButton: function (show = true) {
    document.querySelector("#save").style.display = show ? "inline" : "none";
  },
  showUploadButton: function (show = true) {
    document.querySelector("#upload").style.display = show ? "inline" : "none";
  },

  useLink: function () {
    if (!location.search || !location.search.slice(1)) return;

    var query = location.search.slice(1); // just the part after the "?" symbol
    if (!query) return;

    this.collection
      .doc(query) // doc id
      .get()
      .then((snapshot) => {
        var data = snapshot.data();
        if (data) {
          var slidesData = JSON.parse(data.data);
          memory = slidesData;
          memory.id = slidesData.id || query;
          memory.title = slidesData.title || "";
          if (memory && memory.title) {
            Slides.setTitle(memory.title);
          }
          Memory.recreateSlidesFromMemory(memory);
          // NOTE: do NOT reload page NOR clear .pathname NOR .search
        }
      })
      .catch((error) => {
        alert("Could not get slides data - please wait and try again later.");
        console.log(error);
      });
  },
};