var fieldValueSizeBuffer = 100; // TODO: adjust this later
var maxFieldValueSizeInBytes = 1048487 - fieldValueSizeBuffer;

window.Firebase = {
  firebaseConfig: {
    projectId: "simple-slides",
  },

  database: null,
  collection: null,

  initialize: function () {
    firebase.initializeApp(this.firebaseConfig);
    this.database = window.firebase.firestore();
    if (location.hostname === "localhost") {
      this.database.useEmulator("localhost", 8080);
    }
    this.collection = this.database.collection("slides");
    this.useLink();
  },

  createLink: function (callback) {
    Memory.readPersistentMemory((memory) => {
      if (!memory) return;
      if (memory.id) {
        this.updateExistingDoc(memory, memory.id, callback);
      } else {
        this.createNewDoc(memory, callback);
      }
    });
  },

  updateExistingDoc: function (memory, docId, callback) {
    if (!memory) return;

    var existingDoc = this.database.collection("slides").doc(docId);

    var stringifiedData = JSON.stringify(memory);

    if (this.isStringTooLongForFirestoreFieldValue(stringifiedData)) {
      this.updateExtraData(existingDoc, docId, stringifiedData, callback);
    } else {
      existingDoc
        .set({
          data: stringifiedData,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          if (callback) callback(docId);
        })
        .catch(Firebase.handleShareLinkError);
    }
  },

  createNewDoc: function (memory, callback) {
    if (!memory) return;

    var stringifiedData = JSON.stringify(memory);

    if (this.isStringTooLongForFirestoreFieldValue(stringifiedData)) {
      this.saveExtraData(stringifiedData, callback);
    } else {
      this.database
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
        .catch(Firebase.handleShareLinkError);
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

    var stringifiedData = "";

    var slidesDoc = this.collection.doc(query); // doc id

    slidesDoc
      .get()
      .then((snapshot) => {
        var data = snapshot.data();
        stringifiedData = data.data;
        var hadToSplitUpString = data.extras && typeof data.extras == "number";
        if (hadToSplitUpString) {
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
              stringifiedData += values.join("");
            })
            .then(() => {
              var undefinedRepeatedAtEnd = /([undefined]*)$/;
              var slidesData = JSON.parse(
                stringifiedData.replace(undefinedRepeatedAtEnd, "")
              );
              memory = slidesData;
              memory.id = slidesData.id || query;
              memory.title = slidesData.title || "";
              if (memory && memory.title) {
                Slides.setTitle(memory.title);
              }
              Memory.recreateSlidesFromMemory(memory);
              // NOTE: do NOT reload page NOR clear .pathname NOR .search
            });
        } else {
          // all fits in one data string:
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
    return Memory.getStringLengthInBytes(string) > maxFieldValueSizeInBytes;
  },

  splitStringToFitInFirestoreFieldValue: function (string) {
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

  updateExtraData: function (existingDoc, docId, stringifiedData, callback) {
    var splitData = Firebase.splitStringToFitInFirestoreFieldValue(
      stringifiedData
    );
    var numberOfExtraDocs = splitData.length - 1;
    return existingDoc
      .set({
        data: splitData[0],
        extras: numberOfExtraDocs,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        var extraDataPromises = [];
        var lastIndex = 0;
        for (var i = 0; i < numberOfExtraDocs; i++) {
          var collectionKey = String(i + 1);
          var extraDataPromise = existingDoc
            .collection(collectionKey)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                doc.ref.delete();
              });
            })
            .then(() => {
              lastIndex++; // starts at 1
              existingDoc
                .collection(String(lastIndex))
                .add({ data: splitData[lastIndex] });
            });
          extraDataPromises.push(extraDataPromise);
        }
        Promise.all(extraDataPromises)
          .then(() => {
            if (callback) callback(docId);
          })
          .catch(Firebase.handleShareLinkError);
      })
      .catch(Firebase.handleShareLinkError);
  },

  saveExtraData: function (stringifiedData, callback) {
    var splitData = Firebase.splitStringToFitInFirestoreFieldValue(
      stringifiedData
    );
    var numberOfExtraDocs = splitData.length - 1;
    return this.database
      .collection("slides")
      .add({
        data: splitData[0],
        extras: numberOfExtraDocs,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((newDoc) => {
        // store id in memory:
        memory.id = newDoc.id;
        // go through splitData array:
        var extraDataPromises = [];
        for (var i = 0; i < numberOfExtraDocs; i++) {
          var collectionKey = String(i + 1);
          var extraDataPromise = newDoc
            .collection(collectionKey)
            .add({ data: splitData[i + 1] });
          extraDataPromises.push(extraDataPromise);
        }
        Promise.all(extraDataPromises).then(() => {
          // store id in memory:
          Memory.updatePersistentMemory(memory);
          if (callback) callback(memory.id);
        });
      })
      .catch(Firebase.handleShareLinkError);
  },

  handleShareLinkError: function (error) {
    Spinner.hide();
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
  },
};
