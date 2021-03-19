var justTestingForNow = true;

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

    var stringifiedData = JSON.stringify(memory);

    var promise;

    if (
      justTestingForNow &&
      this.isStringTooLongForFirestoreFieldValue(stringifiedData)
    ) {
      promise = this.updateExtraData(existingDoc, docId, stringifiedData);
    } else {
      promise = existingDoc
        .set({
          data: stringifiedData,
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
    }
  },

  createNewDoc: function (callback) {
    if (!memory) return;

    var stringifiedData = JSON.stringify(memory);

    var promise;

    if (
      justTestingForNow &&
      this.isStringTooLongForFirestoreFieldValue(stringifiedData)
    ) {
      promise = this.saveExtraData(stringifiedData);
    } else {
      promise = this.database
        .collection("slides")
        .add({
          data: stringifiedData,
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
    }
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

  isStringTooLongForFirestoreFieldValue: function (string) {
    var buffer = 100; // TODO: adjust this later
    var maxFieldValueSizeInBytes = 1048487 - buffer;
    if (justTestingForNow) maxFieldValueSizeInBytes = 50;
    return Firebase.getStringLengthInBytes(string) > maxFieldValueSizeInBytes;
  },

  getStringLengthInBytes: function (string) {
    return this.getStringAsBytesArray(string).length;
  },

  getStringAsBytesArray: function (string) {
    return new TextEncoder().encode(string);
  },

  splitStringToFitInFirestoreFieldValue: function (string) {
    var buffer = 100; // TODO: adjust this later
    var maxFieldValueSizeInBytes = 1048487 - buffer;
    if (justTestingForNow) maxFieldValueSizeInBytes = 100;

    var arrayOfByteLengths = this.getStringAsBytesArray(string).map(
      (char) => new TextEncoder().encode(char).length
    );

    var temp_sum = 0;
    var temp_chain = "";
    var arrayOfSubstrings = [];
    arrayOfByteLengths.forEach((charBytes, i) => {
      if (temp_sum + charBytes < maxFieldValueSizeInBytes) {
        temp_chain += string[i];
        temp_sum += charBytes;
      } else {
        arrayOfSubstrings.push(temp_chain);
        temp_chain = string[i];
        temp_sum = 0;
      }
    });
    if (temp_chain) {
      arrayOfSubstrings.push(temp_chain);
    }

    return arrayOfSubstrings;
  },

  updateExtraData: function (existingDoc, docId, stringifiedData) {
    // TODO: use in updateExistingDoc
    // TODO: use in createNewDoc
    var splitData = Firebase.splitStringToFitInFirestoreFieldValue(
      stringifiedData
    );
    // if too long, then add prop to doc: "extras" : "#"
    //              and collections 1, 2, 3, ... = #
    return existingDoc
      .set({
        data: splitData[0],
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

  saveExtraData: function (stringifiedData) {
    // TODO: use in updateExistingDoc
    // TODO: use in createNewDoc
    var splitData = Firebase.splitStringToFitInFirestoreFieldValue(
      stringifiedData
    );
    // if too long, then add prop to doc: "extras" : "#"
    //              and collections 1, 2, 3, ... = #
    return this.database
      .collection("slides")
      .add({
        data: splitData[0],
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

  readExtraData: function (docId) {
    // TODO: use in useLink
    // Firebase.readExtraData('HW1u9T2byRtt42Ipyvjk');
    var slidesDoc = Firebase.collection.doc(docId);
    var output = "";
    return slidesDoc.get().then((snapshot) => {
      var data = snapshot.data();
      output = data.data;
      if (data.extras && typeof data.extras == "number") {
        function getExtraData(snapshot) {
          var extraData = snapshot.docs[0].data().data;
          return extraData;
        }
        var extraDataArray = [];
        for (var i = 0; i < data.extras; i++) {
          var collectionKey = String(i + 1);
          var extraDataPromise = slidesDoc
            .collection(collectionKey)
            .get()
            .then(getExtraData);
          extraDataArray.push(extraDataPromise);
        }
        Promise.all(extraDataArray)
          .then((values) => {
            output += values.join("");
          })
          .then(() => {
            console.log(output);
          });
      }
    });
    // TODO
  },
};
