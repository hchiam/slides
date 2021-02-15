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
  },

  createLink: function (callback) {
    this.collection
      .where("slug", "==", "test-slug")
      .limit(1)
      .get()
      .then((snapshot) => {
        var data = snapshot.docs.map((doc) => ({
          id: doc["id"],
          ...doc.data(),
        }));

        if (data.length) {
          console.log("data: ", data);
          // TODO: save data to firebase
          // TODO: get new link from firebase
          // TODO: use callback to save link to clipboard
          console.log(data[0].id);
        }

        var doc = firebase.firestore().collection("slides").doc(data[0].id);
        doc
          .set({
            ...data[0],
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .catch((error) => {
            console.log("set failed - please wait and try again later");
            console.log(error);
          });
      })
      .catch((error) => {
        console.log("could not create link");
        console.log(error);
      });
  },

  useLink: function () {
    this.collection
      .where("slug", "==", "test-slug")
      .limit(1)
      .get()
      .then((snapshot) => {
        var data = snapshot.docs.map((doc) => ({
          id: doc["id"],
          ...doc.data(),
        }));

        // snapshot.docs[0].set({
        //   timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        // });

        if (data.length) {
          console.log("data: ", data);
          // TODO: link -> firebase -> slides data
          // TODO:
        }
      })
      .catch((error) => {
        console.log("could not use link");
        console.log(error);
      });
  },
};
