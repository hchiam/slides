var Firebase = {
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
        alert("Could not create link - please wait and try again later.");
        console.log(error);
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
        alert("Could not create link - please wait and try again later.");
        console.log(error);
      });
  },

  useLink: function () {
    if (!location.pathname || !location.pathname.slice(1)) return;
    var slug = location.pathname.slice(1).split("/")[0];
    if (!slug) return;
    this.collection
      .doc(slug) // doc id
      .get()
      .then((snapshot) => {
        var data = snapshot.data();
        if (data) {
          var slidesData = JSON.parse(data.data);
          memory = slidesData;
          memory.id = "";
          Memory.recreateSlidesFromMemory(memory);
          location.pathname = ""; // avoid incorrect link confusion
        }
      })
      .catch((error) => {
        alert("Could not get slides data - please wait and try again later.");
        console.log(error);
      });
  },
};
