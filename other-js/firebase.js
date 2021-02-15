var Firebase = {
  firebaseConfig: {
    projectId: "private-minilink",
  },

  database: null,
  collection: null,

  initialize: function () {
    firebase.initializeApp(this.firebaseConfig);
    this.database = window.firebase.firestore();
    this.collection = this.database.collection("links");
  },

  createLink: function (callback) {
    this.collection
      .where("short link", "==", "hymns")
      .limit(1)
      .get()
      .then((snapshot) => {
        var data = snapshot.docs.map((doc) => ({
          id: doc["id"],
          ...doc.data(),
        }));
        if (data.length) {
          var fullLink = data[0]["full link"];
          console.log("'full link' = ", fullLink);
          // TODO: save data to firebase
          // TODO: get new link from firebase
          // TODO: use callback to save link to clipboard
        }
      });
  },

  useLink: function () {
    this.collection
      .where("short link", "==", "hymns")
      .limit(1)
      .get()
      .then((snapshot) => {
        var data = snapshot.docs.map((doc) => ({
          id: doc["id"],
          ...doc.data(),
        }));
        if (data.length) {
          var fullLink = data[0]["full link"];
          console.log("'full link' = ", fullLink);
          // TODO: link -> firebase -> slides data
          // TODO:
        }
      });
  },
};
