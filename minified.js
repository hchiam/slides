/*! LICENSE: https://github.com/hchiam/_2DNote/blob/master/LICENSE */
var _2DNote = {
  audioContext: new (AudioContext || webkitAudioContext)(),
  note: null,
  viewXRange: [0, document.documentElement.clientWidth],
  viewYRange: [0, document.documentElement.clientHeight],
  comfyFrequencyRange: [150, 400],
  comfyVolumeRange: [0, 0.5],
  panRange: [-1, 1],
  setAs2DArea: function (e, t, n = !0) {
    this.callbackUponUpdate = t;
    const r = e || document.body;
    r.addEventListener("mousedown", this.play.bind(this)),
      r.addEventListener("mouseup", this.stop.bind(this)),
      r.addEventListener("mousemove", this.update.bind(this)),
      r.addEventListener("touchstart", this.play.bind(this)),
      r.addEventListener("touchend", this.stop.bind(this)),
      r.addEventListener("touchmove", this.update.bind(this)),
      n && this.setupExitedViewDetection(r);
  },
  play: function (e, t = !0) {
    this.stop(), t && this.setupExitedViewDetection(e);
    var n = this.getFrequency(e),
      r = this.getVolume(e),
      o = this.getPan(e),
      i = this.audioContext.createGain();
    i.connect(this.audioContext.destination),
      (i.gain.value = isNaN(r) ? 0.5 : r);
    var a = this.audioContext.createOscillator();
    (a.type = "sine"), (a.frequency.value = isNaN(n) ? 400 : n), a.connect(i);
    var s = this.audioContext.createStereoPanner();
    o && (s.pan.value = o),
      i.connect(s),
      s.connect(this.audioContext.destination),
      a.start(),
      (this.note = { oscillator: a, volumeSetup: i, panner: s });
  },
  update: function (e, t) {
    if (this.note) {
      var n = this.getFrequency(e),
        r = this.getVolume(e),
        o = this.getPan(e);
      (this.note.volumeSetup.gain.value = r),
        (this.note.oscillator.frequency.value = n),
        (this.note.panner.pan.value = o),
        t
          ? t(r, n, o)
          : this.callbackUponUpdate && this.callbackUponUpdate(r, n, o);
    }
  },
  stop: function () {
    null != this.note &&
      (this.note.oscillator.stop(this.audioContext.currentTime),
      (this.note = null));
  },
  setupExitedViewDetection: function (e) {
    const t = e || document.body;
    t.removeEventListener &&
      t.addEventListener &&
      (t.removeEventListener("mouseleave", this.warnExitedView),
      t.removeEventListener("touchcancel", this.warnExitedView),
      t.addEventListener("mouseleave", this.warnExitedView),
      t.addEventListener("touchcancel", this.warnExitedView));
  },
  warnExitedView: function (e) {
    const t = e || document.body;
    var n = {
      currentTarget: !0,
      clientX: t.clientWidth / 2,
      clientY: t.clientHeight / 2,
    };
    _2DNote.play(n),
      setTimeout(function () {
        _2DNote.stop(),
          t.removeEventListener &&
            (t.removeEventListener("mouseleave", _2DNote.warnExitedView),
            t.removeEventListener("touchcancel", _2DNote.warnExitedView));
      }, 100);
  },
  getFrequency: function (e) {
    var t = this.getX(e);
    return this.normalize(t, this.viewXRange, this.comfyFrequencyRange);
  },
  getVolume: function (e) {
    var t = this.getY(e);
    return this.normalize(t, this.viewYRange, this.comfyVolumeRange);
  },
  getPan: function (e) {
    var t = this.getX(e);
    return this.normalize(t, this.viewXRange, this.panRange);
  },
  getX: function (e) {
    var t = e.currentTarget && e.clientX,
      n = e.touches;
    return t ? e.clientX : n ? e.touches[0].clientX : e.offsetLeft;
  },
  getY: function (e) {
    var t = e.currentTarget && e.clientY,
      n = e.touches;
    return t ? e.clientY : n ? e.touches[0].clientY : e.offsetTop;
  },
  normalize: function (e, [t, n], [r, o]) {
    var i = ((o - r) / (n - t)) * (e - t) + r;
    return Math.min(Math.max(i, r), o);
  },
  copy: function () {
    return (function e(t) {
      if (null === t || "object" != typeof t) return t;
      if (Array.isArray(t)) {
        var n = [];
        return (
          t.forEach(function (t) {
            n.push(e(t));
          }),
          n
        );
      }
      var r = {};
      for (var o in t)
        t.hasOwnProperty(o) &&
          ("audioContext" === o
            ? (r.audioContext = new AudioContext())
            : (r[o] = e(t[o])));
      return r;
    })(this);
  },
};
function copyToClipboard(e, t) {
  try {
    var n = document.createElement("textarea");
    document.body.append(n),
      (n.value = e),
      n.select(),
      document.execCommand("copy"),
      n.remove(),
      t && t(e);
  } catch (t) {
    alert(
      "Could not automatically copy. \n\n Copy this text instead: \n\n" + e
    );
  }
}
"undefined" != typeof window && (window._2DNote = _2DNote),
  "undefined" != typeof module && (module.exports = _2DNote),
  (window.A11y = {
    wasFocusFromKeyboard: !1,
    initialize: function () {
      this.setUp2DNoteListeners(), this.setUpKeyboardFocusListeners();
    },
    announce: function (e) {
      document.getElementById("aria_announcer").innerText = e;
    },
    announceSlideNumber: function (e) {
      this.announce("Now on slide " + (Memory.currentSlideIndex + 1));
    },
    setUpKeyboardFocusListeners: function () {
      document.addEventListener("click", function () {
        A11y.wasFocusFromKeyboard = !1;
      }),
        document.addEventListener("keydown", function () {
          A11y.wasFocusFromKeyboard = !0;
        });
    },
    setUp2DNoteListeners: function () {
      var e;
      document.addEventListener("mousedown", function (e) {
        var t = e.target;
        ("P" != t.tagName && "IMG" != t.tagName) || _2DNote.play(t, !1);
      }),
        document.addEventListener("mouseup", function (e) {
          var t = e.target;
          ("P" != t.tagName && "IMG" != t.tagName) || _2DNote.stop(t);
        }),
        document.addEventListener("mousemove", function (t) {
          var n = t.target;
          ("P" != n.tagName && "IMG" != n.tagName) ||
            (clearTimeout(e),
            _2DNote.update(n),
            (e = setTimeout(function () {
              _2DNote.stop(n);
            }, 500)));
        }),
        document.addEventListener("keyup", function (e) {
          var t = e.target;
          !hitArrowKey(e) ||
            ("P" != t.tagName && "IMG" != t.tagName) ||
            (_2DNote.play(t, !1),
            setTimeout(() => {
              _2DNote.stop(t);
            }, 300));
        });
    },
  }),
  (window.copyToClipboard = copyToClipboard);
var enableDebugging = !1;
function debugMemory() {
  if (enableDebugging) {
    var e = Object.keys(memory.texts)[0],
      t = memory.texts[e];
    console.log(JSON.stringify(t));
  }
}
function getEventsOnElement(e) {
  if ("undefined" != typeof jQuery) {
    var t = $(e);
    if (t) {
      var n = $._data(t[0], "events");
      if (!n) return;
      console.log("vvv click to expand vvv"),
        Object.keys(n).forEach(function (e) {
          console.groupCollapsed(
            "%cEvent:%c " + e,
            "color: lime; background: black;",
            ""
          ),
            n[e].forEach(function (e) {
              console.log(e.handler.toString());
            }),
            console.groupEnd();
        });
    }
  }
}
console.log(
  "Found a bug? Feel free to report suggestions here: https://github.com/hchiam/slides/issues"
),
  (window.enableDebugging = enableDebugging),
  (window.debugMemory = debugMemory),
  (window.getEventsOnElement = getEventsOnElement);
var showLaserTimer,
  fieldValueSizeBuffer = 100,
  maxFieldValueSizeInBytes = 1048487 - fieldValueSizeBuffer;
function hitKey(e, t, n) {
  var r = e.key || e.code || e.keyCode || e.which || e;
  return r === t || r === n;
}
function hitEnterKey(e) {
  return hitKey(e, 13, "Enter");
}
function hitArrowKey(e) {
  return (
    hitArrowLeftKey(e) ||
    hitArrowUpKey(e) ||
    hitArrowRightKey(e) ||
    hitArrowDownKey(e)
  );
}
function hitArrowLeftKey(e) {
  return hitKey(e, 37, "ArrowLeft");
}
function hitArrowUpKey(e) {
  return hitKey(e, 38, "ArrowUp");
}
function hitArrowRightKey(e) {
  return hitKey(e, 39, "ArrowRight");
}
function hitArrowDownKey(e) {
  return hitKey(e, 40, "ArrowDown");
}
function setUpKeyboardFocusTrap(e, t) {
  var n = e.querySelectorAll(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]'
    ),
    r = t || n[0],
    o = n[0],
    i = n[n.length - 1];
  (t || 0 !== n.length) &&
    (r.focus(),
    e.addEventListener("keydown", function (e) {
      var t = 9 === (e.keyCode || e.which),
        n = e.shiftKey;
      t && n
        ? document.activeElement === o && (e.preventDefault(), i.focus())
        : t &&
          !n &&
          document.activeElement === i &&
          (e.preventDefault(), o.focus());
    }),
    e.addEventListener("blur", function (e) {
      e.preventDefault(), o.focus();
    }));
}
function makeElementDraggable(e, t) {
  function n(n) {
    o(n), t && t.mouseMoveCallback && t.mouseMoveCallback(e);
  }
  function r(n) {
    o(n), t && t.touchMoveCallback && t.touchMoveCallback(e);
  }
  function o(t) {
    e.focus();
    var n = t || window.event;
    n.preventDefault();
    var r =
        n.clientX - e.mouseX ||
        (n.touches && n.touches.length && n.touches[0].pageX - e.mouseX),
      o =
        n.clientY - e.mouseY ||
        (n.touches && n.touches.length && n.touches[0].pageY - e.mouseY);
    (e.mouseX =
      n.clientX || (n.touches && n.touches.length && n.touches[0].pageX)),
      (e.mouseY =
        n.clientY || (n.touches && n.touches.length && n.touches[0].pageY)),
      (e.style.left = e.offsetLeft + r + "px"),
      (e.style.top = e.offsetTop + o + "px");
  }
  function i() {
    document.removeEventListener("mouseup", i),
      document.removeEventListener("mousemove", n),
      l(e),
      t && t.mouseUpCallback && t.mouseUpCallback(e);
  }
  function a() {
    document.removeEventListener("touchend", a),
      document.removeEventListener("touchmove", r),
      l(e),
      t && t.touchEndCallback && t.touchEndCallback(e);
  }
  var s;
  function l(e) {
    var n = e.offsetLeft,
      r = e.offsetTop,
      o = e.offsetWidth,
      i = e.offsetHeight,
      a = n + o / 2,
      l = r + i / 2,
      u = !1;
    if (t && t.snapGridSize) {
      var d = t.snapGridSize,
        f = c(a, d) - o / 2,
        m = c(l, d) - i / 2;
      (e.style.left = f + "px"), (e.style.top = m + "px"), (u = !0);
    }
    if (e.snapPoints && e.snapPoints.length) {
      d = 50;
      clearTimeout(s),
        e.snapPoints.some(function (t) {
          if (
            (function (e, t, n, r = 50) {
              var o = e.x - t,
                i = e.y - n;
              return Math.sqrt(o * o + i * i) <= r;
            })(t, a, l, d)
          ) {
            var n = t.x - o / 2,
              r = t.y - i / 2;
            (e.style.left = n + "px"),
              (e.style.top = r + "px"),
              (u = !0),
              (s = setTimeout(function () {
                return !0;
              }, 100));
          }
        });
    }
    u && t && t.snapCallback && t.snapCallback(e.style.left, e.style.top);
  }
  function c(e, t = 25) {
    return t * Math.floor(e / t);
  }
  (e.mouseX = 0),
    (e.mouseY = 0),
    (e.disableStyleReset = (t && t.disableStyleReset) || !1),
    (e.snapPoints = (t && t.snapPoints) || []),
    e.addEventListener(
      "mousedown",
      function (r) {
        var o = r || window.event;
        o.preventDefault(),
          (e.mouseX =
            o.clientX || (o.touches && o.touches.length && o.touches[0].pageX)),
          (e.mouseY =
            o.clientY || (o.touches && o.touches.length && o.touches[0].pageY)),
          document.addEventListener("mouseup", i, !1),
          document.addEventListener("mousemove", n, !1),
          t && t.mouseDownCallback && t.mouseDownCallback(e);
      },
      !1
    ),
    e.addEventListener(
      "touchstart",
      function (n) {
        var o = n || window.event;
        o.preventDefault(),
          (e.mouseX =
            o.clientX || (o.touches && o.touches.length && o.touches[0].pageX)),
          (e.mouseY =
            o.clientY || (o.touches && o.touches.length && o.touches[0].pageY)),
          document.addEventListener("touchend", a, !1),
          document.addEventListener("touchmove", r, !1),
          t && t.touchStartCallback && t.touchStartCallback(e);
      },
      { passive: !0 }
    ),
    (e.disableStyleReset && "boolean" == typeof e.disableStyleReset) ||
      ((e.style.marginBlockStart = "initial"),
      (e.style.position = "absolute"),
      (e.style.minWidth = "1ch"),
      (e.style.minHeight = "1em")),
    (function (e) {
      e.setAttribute(
        "aria-label",
        "Draggable. To drag this element around, hold down Option and hit the arrow keys."
      );
    })(e),
    (function (e) {
      e.addEventListener(
        "keyup",
        function (n) {
          n.preventDefault();
          var r = (function (e) {
            var t = e || window.event;
            switch (t.key || t.code || t.keyCode || t.which) {
              case "ArrowLeft":
              case "Left":
              case 37:
                return "ArrowLeft";
              case "ArrowUp":
              case "Up":
              case 38:
                return "ArrowUp";
              case "ArrowRight":
              case "Right":
              case 39:
                return "ArrowRight";
              case "ArrowDown":
              case "Down":
              case 40:
                return "ArrowDown";
            }
          })(n);
          !(function (e, n) {
            var r = e.offsetLeft,
              o = e.offsetTop,
              i = 10;
            switch (n) {
              case "ArrowLeft":
                r -= i;
                break;
              case "ArrowUp":
                o -= i;
                break;
              case "ArrowRight":
                r += i;
                break;
              case "ArrowDown":
                o += i;
            }
            (e.style.left = r + "px"),
              (e.style.top = o + "px"),
              t && t.keyboardMoveCallback && t.keyboardMoveCallback(e);
          })(e, r);
        },
        !1
      );
    })(e);
}
function makeElementDraggableAndEditable(e, t) {
  function n(n) {
    var r = n || window.event;
    r.preventDefault(),
      (e.mouseX =
        r.clientX || (r.touches && r.touches.length && r.touches[0].pageX)),
      (e.mouseY =
        r.clientY || (r.touches && r.touches.length && r.touches[0].pageY)),
      document.addEventListener("mouseup", s, !1),
      document.addEventListener("mousemove", o, !1),
      (e.contentEditable = !1),
      (e.detectAsClickToEdit = !e.disableEditing),
      t && t.mouseDownCallback && t.mouseDownCallback(e);
  }
  function r(n) {
    var r = n || window.event;
    r.preventDefault(),
      (e.mouseX =
        r.clientX || (r.touches && r.touches.length && r.touches[0].pageX)),
      (e.mouseY =
        r.clientY || (r.touches && r.touches.length && r.touches[0].pageY)),
      document.addEventListener("touchend", l, !1),
      document.addEventListener("touchmove", i, !1),
      (e.contentEditable = !1),
      (e.detectAsClickToEdit = !e.disableEditing),
      t && t.touchStartCallback && t.touchStartCallback(e);
  }
  function o(n) {
    a(n),
      (e.detectAsClickToEdit = !1),
      t && t.mouseMoveCallback && t.mouseMoveCallback(e);
  }
  function i(n) {
    a(n), t && t.touchMoveCallback && t.touchMoveCallback(e);
  }
  function a(t) {
    e.focus();
    var n = t || window.event;
    n.preventDefault();
    var r =
        n.clientX - e.mouseX ||
        (n.touches && n.touches.length && n.touches[0].pageX - e.mouseX),
      o =
        n.clientY - e.mouseY ||
        (n.touches && n.touches.length && n.touches[0].pageY - e.mouseY);
    (e.mouseX =
      n.clientX || (n.touches && n.touches.length && n.touches[0].pageX)),
      (e.mouseY =
        n.clientY || (n.touches && n.touches.length && n.touches[0].pageY)),
      (e.style.left = e.offsetLeft + r + "px"),
      (e.style.top = e.offsetTop + o + "px");
  }
  function s() {
    document.removeEventListener("mouseup", s),
      document.removeEventListener("mousemove", o),
      e.detectAsClickToEdit &&
        ((e.contentEditable = !0),
        e.focus(),
        e.removeEventListener("mousedown", n)),
      u(e),
      t && t.mouseUpCallback && t.mouseUpCallback(e);
  }
  function l() {
    document.removeEventListener("touchend", l),
      document.removeEventListener("touchmove", i),
      e.detectAsClickToEdit &&
        ((e.contentEditable = !0),
        e.focus(),
        e.removeEventListener("touchstart", r)),
      u(e),
      t && t.touchEndCallback && t.touchEndCallback(e);
  }
  var c;
  function u(e) {
    var n = e.offsetLeft,
      r = e.offsetTop,
      o = e.offsetWidth,
      i = e.offsetHeight,
      a = n + o / 2,
      s = r + i / 2,
      l = !1;
    if (t && t.snapGridSize) {
      var u = t.snapGridSize,
        f = d(a, u) - o / 2,
        m = d(s, u) - i / 2;
      (e.style.left = f + "px"), (e.style.top = m + "px"), (l = !0);
    }
    if (e.snapPoints && e.snapPoints.length) {
      u = 50;
      clearTimeout(c),
        e.snapPoints.some(function (t) {
          if (
            (function (e, t, n, r = 50) {
              var o = e.x - t,
                i = e.y - n;
              return Math.sqrt(o * o + i * i) <= r;
            })(t, a, s, u)
          ) {
            var n = t.x - o / 2,
              r = t.y - i / 2;
            (e.style.left = n + "px"),
              (e.style.top = r + "px"),
              (l = !0),
              (c = setTimeout(function () {
                return !0;
              }, 100));
          }
        });
    }
    l && t && t.snapCallback && t.snapCallback(e.style.left, e.style.top);
  }
  function d(e, t = 25) {
    return t * Math.floor(e / t);
  }
  (e.mouseX = 0),
    (e.mouseY = 0),
    (e.disableStyleReset = (t && t.disableStyleReset) || !1),
    (e.snapPoints = (t && t.snapPoints) || []),
    (e.disableEditing = (t && t.disableEditing) || !1),
    (e.detectAsClickToEdit = !1),
    (e.startedTyping = !1),
    e.addEventListener("mousedown", n, !1),
    e.addEventListener("touchstart", r, { passive: !0 }),
    e.addEventListener(
      "blur",
      function () {
        (e.contentEditable = !1),
          e.addEventListener("mousedown", n, !1),
          e.addEventListener("touchstart", r, { passive: !0 }),
          (e.startedTyping = !1),
          t && t.blurCallback && t.blurCallback(e);
      },
      !1
    ),
    (e.disableStyleReset && "boolean" == typeof e.disableStyleReset) ||
      ((e.style.marginBlockStart = "initial"),
      (e.style.position = "absolute"),
      (e.style.minWidth = "1ch"),
      (e.style.minHeight = "1em")),
    (function (e) {
      e.setAttribute(
        "aria-label",
        "Draggable and editable. To drag, hit Escape and then hold down Option and hit the arrow keys. To edit, start typing."
      );
    })(e),
    (function (e) {
      e.addEventListener(
        "keyup",
        function (n) {
          n.preventDefault();
          var r = (function (e) {
            var t = e || window.event;
            switch (t.key || t.code || t.keyCode || t.which) {
              case "ArrowLeft":
              case "Left":
              case 37:
                return "ArrowLeft";
              case "ArrowUp":
              case "Up":
              case 38:
                return "ArrowUp";
              case "ArrowRight":
              case "Right":
              case 39:
                return "ArrowRight";
              case "ArrowDown":
              case "Down":
              case 40:
                return "ArrowDown";
            }
          })(n);
          r && !e.startedTyping
            ? ((e.detectAsClickToEdit = !1),
              (e.contentEditable = !1),
              (function (e, n) {
                var r = e.offsetLeft,
                  o = e.offsetTop,
                  i = 10;
                switch (n) {
                  case "ArrowLeft":
                    r -= i;
                    break;
                  case "ArrowUp":
                    o -= i;
                    break;
                  case "ArrowRight":
                    r += i;
                    break;
                  case "ArrowDown":
                    o += i;
                }
                (e.style.left = r + "px"),
                  (e.style.top = o + "px"),
                  t && t.keyboardMoveCallback && t.keyboardMoveCallback(e);
              })(e, r))
            : !(function (e) {
                var t = e || window.event,
                  n = t.key || t.code || t.keyCode || t.which;
                return "Escape" === n || "Esc" === n || 27 === n;
              })(n)
            ? (function (e) {
                var t = e || window.event,
                  n = t.key || t.code || t.keyCode || t.which;
                return "Tab" === n || 9 === n;
              })(n) ||
              (e.startedTyping ||
                (function (e) {
                  var t = document.createRange();
                  t.setStart(e, 0), t.collapse(!0);
                  var n = window.getSelection();
                  n.removeAllRanges(), n.addRange(t);
                })(e),
              (e.startedTyping = !0),
              (e.detectAsClickToEdit = !0),
              (e.contentEditable = !0),
              e.focus())
            : ((e.startedTyping = !1),
              (e.detectAsClickToEdit = !1),
              (e.contentEditable = !1));
        },
        !1
      );
    })(e);
}
(window.Firebase = {
  firebaseConfig: { projectId: "simple-slides" },
  database: null,
  collection: null,
  initialize: function () {
    firebase.initializeApp(this.firebaseConfig),
      (this.database = window.firebase.firestore()),
      "localhost" === location.hostname &&
        this.database.useEmulator("localhost", 8080),
      (this.collection = this.database.collection("slides")),
      this.useLink();
  },
  createLink: function (e) {
    Memory.readPersistentMemory((t) => {
      t &&
        (t.id ? this.updateExistingDoc(t, t.id, e) : this.createNewDoc(t, e));
    });
  },
  updateExistingDoc: function (e, t, n) {
    if (e) {
      var r = this.database.collection("slides").doc(t),
        o = JSON.stringify(e);
      this.isStringTooLongForFirestoreFieldValue(o)
        ? this.updateExtraData(r, t, o, n)
        : r
            .set({
              data: o,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then(() => {
              n && n(t);
            })
            .catch(Firebase.handleShareLinkError);
    }
  },
  createNewDoc: function (e, t) {
    if (e) {
      var n = JSON.stringify(e);
      this.isStringTooLongForFirestoreFieldValue(n)
        ? this.saveExtraData(n, t)
        : this.database
            .collection("slides")
            .add({
              data: n,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then((n) => {
              (e.id = n.id), Memory.updatePersistentMemory(e), t && t(n.id);
            })
            .catch(Firebase.handleShareLinkError);
    }
  },
  showShareButton: function (e = !0) {
    document.querySelector("#share").style.display = e ? "inline" : "none";
  },
  showSaveButton: function (e = !0) {
    document.querySelector("#save").style.display = e ? "inline" : "none";
  },
  showUploadButton: function (e = !0) {
    document.querySelector("#upload").style.display = e ? "inline" : "none";
  },
  useLink: function () {
    if (location.search && location.search.slice(1)) {
      var e = location.search.slice(1);
      if (e) {
        var t = "",
          n = this.collection.doc(e);
        n.get()
          .then((r) => {
            var o = r.data();
            if (((t = o.data), o.extras && "number" == typeof o.extras)) {
              function i(e) {
                return e.docs[0].data().data;
              }
              for (var a = [], s = 0; s < o.extras; s++) {
                var l = String(s + 1),
                  c = n.collection(l).get().then(i);
                a.push(c);
              }
              Promise.all(a)
                .then((e) => {
                  t += e.join("");
                })
                .then(() => {
                  var n = JSON.parse(t.replace(/([undefined]*)$/, ""));
                  ((memory = n).id = n.id || e),
                    (memory.title = n.title || ""),
                    memory && memory.title && Slides.setTitle(memory.title),
                    Memory.recreateSlidesFromMemory(memory);
                });
            } else {
              var u = JSON.parse(o.data);
              ((memory = u).id = u.id || e),
                (memory.title = u.title || ""),
                memory && memory.title && Slides.setTitle(memory.title),
                Memory.recreateSlidesFromMemory(memory);
            }
          })
          .catch((e) => {
            alert(
              "Could not get slides data - please wait and try again later."
            ),
              console.log(e);
          });
      }
    }
  },
  isStringTooLongForFirestoreFieldValue: function (e) {
    return Memory.getStringLengthInBytes(e) > maxFieldValueSizeInBytes;
  },
  splitStringToFitInFirestoreFieldValue: function (e) {
    var t = this.getStringAsBytesArray(e).map(
        (e) => new TextEncoder().encode(e).length
      ),
      n = 0,
      r = "",
      o = [];
    return (
      t.forEach((t, i) => {
        n + t < maxFieldValueSizeInBytes
          ? ((r += e[i]), (n += t))
          : (o.push(r), (r = e[i]), (n = 0));
      }),
      r && o.push(r),
      o
    );
  },
  updateExtraData: function (e, t, n, r) {
    var o = Firebase.splitStringToFitInFirestoreFieldValue(n),
      i = o.length - 1;
    return e
      .set({
        data: o[0],
        extras: i,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        for (var n = [], a = 0, s = 0; s < i; s++) {
          var l = String(s + 1),
            c = e
              .collection(l)
              .get()
              .then((e) => {
                e.forEach((e) => {
                  e.ref.delete();
                });
              })
              .then(() => {
                a++, e.collection(String(a)).add({ data: o[a] });
              });
          n.push(c);
        }
        Promise.all(n)
          .then(() => {
            r && r(t);
          })
          .catch(Firebase.handleShareLinkError);
      })
      .catch(Firebase.handleShareLinkError);
  },
  saveExtraData: function (e, t) {
    var n = Firebase.splitStringToFitInFirestoreFieldValue(e),
      r = n.length - 1;
    return this.database
      .collection("slides")
      .add({
        data: n[0],
        extras: r,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((e) => {
        memory.id = e.id;
        for (var o = [], i = 0; i < r; i++) {
          var a = String(i + 1),
            s = e.collection(a).add({ data: n[i + 1] });
          o.push(s);
        }
        Promise.all(o).then(() => {
          Memory.updatePersistentMemory(memory), t && t(memory.id);
        });
      })
      .catch(Firebase.handleShareLinkError);
  },
  handleShareLinkError: function (e) {
    Spinner.hide(),
      alert(
        "Could not create link - please wait and try again later. \n\nAlternatively, you can download your data."
      ),
      console.log(e),
      Firebase.showShareButton(!1),
      Firebase.showSaveButton(),
      Firebase.showUploadButton(),
      setTimeout(() => {
        Firebase.showShareButton(),
          Firebase.showSaveButton(!1),
          Firebase.showUploadButton(!1);
      }, 6e4);
  },
}),
  (window.Fullscreen = {
    fullscreenKeysDebounce: null,
    fullscreenButtonFocusTimer: null,
    initialize: function () {
      this.initializeEventListeners();
    },
    initializeEventListeners: function () {
      document.addEventListener(
        "fullscreenchange",
        this.styleFullscreenButton.bind(this)
      ),
        document.addEventListener(
          "webkitfullscreenchange",
          this.styleFullscreenButton.bind(this)
        ),
        document.addEventListener(
          "mozfullscreenchange",
          this.styleFullscreenButton.bind(this)
        ),
        document.addEventListener(
          "MSFullscreenChange",
          this.styleFullscreenButton.bind(this)
        ),
        document.addEventListener(
          "keydown",
          this.detectFullscreenKeyboardShortcuts.bind(this)
        ),
        document
          .getElementById("fullscreen")
          .addEventListener("click", this.fullscreen.bind(this));
    },
    detectFullscreenKeyboardShortcuts: function (e) {
      var t = document.activeElement === document.body,
        n = "BUTTON" === document.activeElement.tagName;
      if (t || n) {
        var r = e.code || e.keyCode || e.which || window.event,
          o = !(
            ("KeyF" !== r && 70 !== r) ||
            e.ctrlKey ||
            e.metaKey ||
            e.altKey ||
            e.shiftKey
          ),
          i = "F11" === r || 122 === r,
          a =
            (e.ctrlKey || e.metaKey) &&
            e.shiftKey &&
            ("KeyF" === r || 70 === r),
          s = "Escape" === r || 27 === r;
        o || i
          ? (clearTimeout(Fullscreen.fullscreenKeysDebounce),
            (Fullscreen.fullscreenKeysDebounce = setTimeout(function () {
              Fullscreen.fullscreen();
            }, 500)))
          : a
          ? (clearTimeout(Fullscreen.fullscreenKeysDebounce),
            (Fullscreen.fullscreenKeysDebounce = setTimeout(function () {
              Fullscreen.fullscreen(!1);
            }, 500)))
          : s && this.showControls();
      }
    },
    fullscreen: function (e = !0) {
      window.innerHeight == screen.height
        ? (this.exitFullscreen(), this.showControls())
        : (this.enterFullscreen(), this.showControls(e));
    },
    exitFullscreen: function () {
      var e =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozExitFullScreen ||
        document.msExitFullscreen;
      e && (e.call(document), this.styleFullscreenButton());
    },
    enterFullscreen: function () {
      var e = document.body,
        t =
          e.requestFullScreen ||
          e.webkitRequestFullScreen ||
          e.mozRequestFullScreen ||
          e.msRequestFullScreen;
      t && (t.call(e), this.styleFullscreenButton());
    },
    styleFullscreenButton: function () {
      var e = document.getElementById("fullscreen");
      window.innerHeight == screen.height
        ? ((e.getElementsByTagName("i")[0].innerText = "fullscreen_exit"),
          e.nextElementSibling.setAttribute("data-before", "Exit fullscreen"),
          e.nextElementSibling.style.setProperty("--left", "-5.1em"))
        : (((e = document.getElementById("fullscreen")).getElementsByTagName(
            "i"
          )[0].innerText = "fullscreen"),
          e.nextElementSibling.setAttribute("data-before", "Fullscreen"),
          e.nextElementSibling.style.setProperty("--left", "-4.1em"),
          this.showControls());
      this.blurFullscreenButton(3e3);
    },
    blurFullscreenButton: function (e) {
      var t = document.getElementById("fullscreen");
      clearTimeout(Fullscreen.fullscreenButtonFocusTimer),
        (Fullscreen.fullscreenButtonFocusTimer = setTimeout(function () {
          t.blur();
        }, e));
    },
    showControls: function (e = !0) {
      document.getElementById("controls").style.visibility = e ? "" : "hidden";
    },
  }),
  (window.hitKey = hitKey),
  (window.hitEnterKey = hitEnterKey),
  (window.hitArrowKey = hitArrowKey),
  (window.hitArrowLeftKey = hitArrowLeftKey),
  (window.hitArrowUpKey = hitArrowUpKey),
  (window.hitArrowRightKey = hitArrowRightKey),
  (window.hitArrowDownKey = hitArrowDownKey),
  (window.Images = {
    currentImage: null,
    deleteImageIcon: null,
    deleteImageIconTimer: null,
    recreatingImage: !0,
    timeOfLastTap: null,
    initializeImageButtons: function () {
      document
        .querySelector("#select_image")
        .addEventListener("change", this.readImage.bind(this)),
        document
          .querySelector("#add_image")
          .addEventListener("click", this.triggerCreateNewImage.bind(this)),
        this.createImageIcon();
    },
    createImageIcon: function () {
      var e = document.createElement("button");
      (e.ariaLabel = "Delete image"),
        (e.id = "delete_image_icon"),
        (e.innerHTML = '<i class="material-icons">delete</i><span></span>'),
        (e.style.display = "none"),
        (e.style.position = "absolute"),
        (e.style.transition = "0s"),
        (e.onclick = function () {
          var e = Images.currentImage;
          Memory.removeImageFromMemory(e.id, function () {
            e.remove(), (Images.deleteImageIcon.style.display = "none");
          });
        }),
        document.body.appendChild(e),
        (Images.deleteImageIcon = e);
    },
    moveDeleteIcon: function () {
      var e = Images.currentImage.style.left.replace("px", ""),
        t = Images.currentImage.style.top.replace("px", ""),
        n = Images.deleteImageIcon,
        r = n.offsetWidth / 4,
        o = n.offsetHeight / 4,
        i = Math.max(0, e - r),
        a = Math.max(0, t - o);
      (n.style.left = i + "px"), (n.style.top = a + "px");
    },
    recreateImage: function (e = Slides.currentSlide, t, n) {
      this.recreatingImage = !0;
      var r = Memory.getSlide(n).images[t],
        o = r.file,
        i = r.fileName,
        a = r.left * Memory.getScaleForOriginalScreenSize(memory),
        s = r.top * Memory.getScaleForOriginalScreenSize(memory);
      (Slides.isInitializingMemory = !0),
        this.createImage(Slides.currentSlide, o, i, a, s, t, n);
    },
    createNewImage: function (e, t = "") {
      this.recreatingImage = !1;
      var n = new Memory.Image(e, t);
      Memory.addImageToMemory(n, n.id);
      e = n.file;
      var r = n.left,
        o = n.top,
        i = n.id;
      (Slides.isInitializingMemory = !1),
        this.createImage(
          Slides.currentSlide,
          e,
          t,
          r,
          o,
          i,
          Memory.currentSlideIndex
        ),
        A11y.announce("Added new image.");
    },
    createImage: function (e = Slides.currentSlide, t, n, r, o, i, a) {
      var s = document.createElement("img");
      (s.src = t),
        (s.fileName = encodeURI(n)),
        (s.style.left = isNaN(r) && r.endsWith("px") ? r : r + "px"),
        (s.style.top = isNaN(o) && o.endsWith("px") ? o : o + "px"),
        (s.style.zIndex = -1),
        (s.id = i),
        (s.style.display = Memory.currentSlideIndex === a ? "block" : "none"),
        (s.tabIndex = 0),
        (s.ariaLabel = this.getAriaLabelFromImage(s)),
        s.setAttribute("data-slide", a),
        s.addEventListener("dblclick", function () {
          Memory.removeImageFromMemory(s.id, function () {
            s.remove();
          });
        }),
        s.addEventListener("keyup", function (e) {
          var t = e.code || e.keyCode || e.which || window.event;
          ("Backspace" === t || 8 === t || "Delete" === t || 46 === t) &&
            Memory.removeImageFromMemory(s.id, function () {
              s.remove();
            });
        }),
        s.addEventListener("mousemove", function () {
          (Images.currentImage = s),
            (Images.deleteImageIcon.style.display = ""),
            Images.moveDeleteIcon();
        }),
        s.addEventListener("mouseout", function (e) {
          clearTimeout(Images.deleteImageIconTimer),
            (Images.deleteImageIconTimer = setTimeout(function () {
              e.target !== Images.deleteImageIcon &&
                e.target !== Images.deleteImageIcon.querySelector("i") &&
                (Images.deleteImageIcon.style.display = "none");
            }, 5e3));
        }),
        s.addEventListener("blur", function (e) {
          A11y.wasFocusFromKeyboard ||
            (Images.deleteImageIcon.style.display = "none");
        }),
        s.addEventListener("focus", function (e) {
          if (((Images.currentImage = s), A11y.wasFocusFromKeyboard)) {
            (Images.deleteImageIcon.style.display = ""),
              Images.moveDeleteIcon();
            var t = Images.deleteImageIcon.parentNode.removeChild(
              Images.deleteImageIcon
            );
            Images.currentImage.parentNode.insertBefore(
              t,
              Images.currentImage.nextSibling
            );
          }
        }),
        e.appendChild(s),
        makeElementDraggable(s, {
          mouseMoveCallback: Images.updateImagePosition,
          touchEndCallback: Images.onDoubleTap.bind(Images, s, function (e) {
            Memory.removeImageFromMemory(e.id, function () {
              e.remove();
            });
          }),
          disableEditing: !0,
          snapPoints: [{ x: window.innerWidth / 2, y: window.innerHeight / 2 }],
          snapCallback: function (e, t) {
            Images.updateImagePosition(s);
          },
        }),
        Slides.enableShareButton(),
        Slides.isInitializingMemory ||
          alert("Note: you can delete images by double-clicking on them."),
        setTimeout(() => {
          Images.setMaxImageSize(s),
            Images.centerImage(s),
            runImagePluginsWhenImageCreated(s);
        }, 0);
    },
    getAriaLabelFromImage: function (e) {
      var t = e.fileName,
        n = "";
      return (
        t && t.length <= 20
          ? (n += " with file name " + t)
          : t &&
            (n +=
              " with file name starting with " +
              this.getStartOfImageFileNameForA11y(t)),
        "image " +
          n +
          " at " +
          e.style.left +
          " left and " +
          e.style.top +
          " top"
      );
    },
    getStartOfImageFileNameForA11y: function (e) {
      var t = "string" == typeof e ? e : e.fileName,
        n = e.match(/\.[^.]+$/)[0];
      if ((t = t.replace(new RegExp(n + "$"), "")).length <= 20) return t;
      var r = t.slice(0, 20).lastIndexOf(" ");
      return t.slice(0, r);
    },
    updateImagePosition: function (e) {
      var t = e.offsetLeft,
        n = e.offsetTop;
      Memory.updateImagePositionInMemory(e.id, t, n),
        (e.ariaLabel = Images.getAriaLabelFromImage(e)),
        (Images.deleteImageIcon.style.display = "none"),
        debugMemory();
    },
    createImageCallback: function (e, t) {
      this.recreateImage(Slides.currentSlide, e.id, t);
    },
    triggerCreateNewImage: function () {
      (document.getElementById("select_image").value = ""),
        document.getElementById("select_image").click();
    },
    readImage: function () {
      var e = document.querySelector("#select_image");
      if (e.files && e.files[0]) {
        var t = e.files[0],
          n = t ? t.name : "",
          r = new FileReader(),
          o = this;
        (r.onload = function (e) {
          var t = e.target.result;
          o.createNewImage(t, n);
        }),
          (e.onchange = function (e) {
            const t = e.target.files[0];
            r.readAsDataURL(t);
          });
        const i = t;
        r.readAsDataURL(i);
      }
    },
    setMaxImageSize: function (e) {
      var t = document.documentElement.clientHeight,
        n = document.documentElement.clientWidth,
        r = e.height - t,
        o = e.width - n;
      r > o && r > 0
        ? (e.style.height = (e.height > t ? t : e.height) + "px")
        : o >= r &&
          o > 0 &&
          (e.style.width = (e.width > n ? n : e.width) + "px");
    },
    centerImage: function (e) {
      if (
        e.height &&
        e.width &&
        !Slides.isInitializingMemory &&
        !this.recreatingImage
      ) {
        var t = document.documentElement.clientHeight,
          n = document.documentElement.clientWidth;
        (e.style.top = t / 2 - e.height / 2 + "px"),
          (e.style.left = n / 2 - e.width / 2 + "px"),
          this.updateImagePosition(e);
      }
    },
    onDoubleTap: function (e, t) {
      var n = new Date().getTime() - this.timeOfLastTap;
      0 < n && n < 600 && t && t(e),
        (this.timeOfLastTap = new Date().getTime());
    },
  }),
  (window.setUpKeyboardFocusTrap = setUpKeyboardFocusTrap),
  document.addEventListener("mousemove", function (e) {
    var t = document.documentElement.clientWidth,
      n = document.getElementById("laser");
    t <= 600
      ? (n.style.display = "none")
      : ((n.style.left = e.pageX - 10 + "px"),
        (n.style.top = e.pageY - 10 + "px"),
        (n.style.display = "block"),
        clearTimeout(showLaserTimer),
        (showLaserTimer = setTimeout(function () {
          n.style.display = "none";
        }, 3e3)));
  }),
  (function (e) {
    if ("object" == typeof exports && "undefined" != typeof module)
      module.exports = e();
    else if ("function" == typeof define && define.amd) define([], e);
    else {
      ("undefined" != typeof window
        ? window
        : "undefined" != typeof global
        ? global
        : "undefined" != typeof self
        ? self
        : this
      ).localforage = e();
    }
  })(function () {
    return (function e(t, n, r) {
      function o(a, s) {
        if (!n[a]) {
          if (!t[a]) {
            var l = "function" == typeof require && require;
            if (!s && l) return l(a, !0);
            if (i) return i(a, !0);
            var c = new Error("Cannot find module '" + a + "'");
            throw ((c.code = "MODULE_NOT_FOUND"), c);
          }
          var u = (n[a] = { exports: {} });
          t[a][0].call(
            u.exports,
            function (e) {
              return o(t[a][1][e] || e);
            },
            u,
            u.exports,
            e,
            t,
            n,
            r
          );
        }
        return n[a].exports;
      }
      for (
        var i = "function" == typeof require && require, a = 0;
        a < r.length;
        a++
      )
        o(r[a]);
      return o;
    })(
      {
        1: [
          function (e, t, n) {
            (function (e) {
              "use strict";
              function n() {
                c = !0;
                for (var e, t, n = u.length; n; ) {
                  for (t = u, u = [], e = -1; ++e < n; ) t[e]();
                  n = u.length;
                }
                c = !1;
              }
              var r,
                o = e.MutationObserver || e.WebKitMutationObserver;
              if (o) {
                var i = 0,
                  a = new o(n),
                  s = e.document.createTextNode("");
                a.observe(s, { characterData: !0 }),
                  (r = function () {
                    s.data = i = ++i % 2;
                  });
              } else if (e.setImmediate || void 0 === e.MessageChannel)
                r =
                  "document" in e &&
                  "onreadystatechange" in e.document.createElement("script")
                    ? function () {
                        var t = e.document.createElement("script");
                        (t.onreadystatechange = function () {
                          n(),
                            (t.onreadystatechange = null),
                            t.parentNode.removeChild(t),
                            (t = null);
                        }),
                          e.document.documentElement.appendChild(t);
                      }
                    : function () {
                        setTimeout(n, 0);
                      };
              else {
                var l = new e.MessageChannel();
                (l.port1.onmessage = n),
                  (r = function () {
                    l.port2.postMessage(0);
                  });
              }
              var c,
                u = [];
              t.exports = function (e) {
                1 !== u.push(e) || c || r();
              };
            }.call(
              this,
              "undefined" != typeof global
                ? global
                : "undefined" != typeof self
                ? self
                : "undefined" != typeof window
                ? window
                : {}
            ));
          },
          {},
        ],
        2: [
          function (e, t, n) {
            "use strict";
            function r() {}
            function o(e) {
              if ("function" != typeof e)
                throw new TypeError("resolver must be a function");
              (this.state = h),
                (this.queue = []),
                (this.outcome = void 0),
                e !== r && l(this, e);
            }
            function i(e, t, n) {
              (this.promise = e),
                "function" == typeof t &&
                  ((this.onFulfilled = t),
                  (this.callFulfilled = this.otherCallFulfilled)),
                "function" == typeof n &&
                  ((this.onRejected = n),
                  (this.callRejected = this.otherCallRejected));
            }
            function a(e, t, n) {
              u(function () {
                var r;
                try {
                  r = t(n);
                } catch (t) {
                  return d.reject(e, t);
                }
                r === e
                  ? d.reject(
                      e,
                      new TypeError("Cannot resolve promise with itself")
                    )
                  : d.resolve(e, r);
              });
            }
            function s(e) {
              var t = e && e.then;
              if (
                e &&
                ("object" == typeof e || "function" == typeof e) &&
                "function" == typeof t
              )
                return function () {
                  t.apply(e, arguments);
                };
            }
            function l(e, t) {
              function n(t) {
                o || ((o = !0), d.reject(e, t));
              }
              function r(t) {
                o || ((o = !0), d.resolve(e, t));
              }
              var o = !1,
                i = c(function () {
                  t(r, n);
                });
              "error" === i.status && n(i.value);
            }
            function c(e, t) {
              var n = {};
              try {
                (n.value = e(t)), (n.status = "success");
              } catch (e) {
                (n.status = "error"), (n.value = e);
              }
              return n;
            }
            var u = e(1),
              d = {},
              f = ["REJECTED"],
              m = ["FULFILLED"],
              h = ["PENDING"];
            (t.exports = o),
              (o.prototype.catch = function (e) {
                return this.then(null, e);
              }),
              (o.prototype.then = function (e, t) {
                if (
                  ("function" != typeof e && this.state === m) ||
                  ("function" != typeof t && this.state === f)
                )
                  return this;
                var n = new this.constructor(r);
                return (
                  this.state !== h
                    ? a(n, this.state === m ? e : t, this.outcome)
                    : this.queue.push(new i(n, e, t)),
                  n
                );
              }),
              (i.prototype.callFulfilled = function (e) {
                d.resolve(this.promise, e);
              }),
              (i.prototype.otherCallFulfilled = function (e) {
                a(this.promise, this.onFulfilled, e);
              }),
              (i.prototype.callRejected = function (e) {
                d.reject(this.promise, e);
              }),
              (i.prototype.otherCallRejected = function (e) {
                a(this.promise, this.onRejected, e);
              }),
              (d.resolve = function (e, t) {
                var n = c(s, t);
                if ("error" === n.status) return d.reject(e, n.value);
                var r = n.value;
                if (r) l(e, r);
                else {
                  (e.state = m), (e.outcome = t);
                  for (var o = -1, i = e.queue.length; ++o < i; )
                    e.queue[o].callFulfilled(t);
                }
                return e;
              }),
              (d.reject = function (e, t) {
                (e.state = f), (e.outcome = t);
                for (var n = -1, r = e.queue.length; ++n < r; )
                  e.queue[n].callRejected(t);
                return e;
              }),
              (o.resolve = function (e) {
                return e instanceof this ? e : d.resolve(new this(r), e);
              }),
              (o.reject = function (e) {
                var t = new this(r);
                return d.reject(t, e);
              }),
              (o.all = function (e) {
                function t(e, t) {
                  n.resolve(e).then(
                    function (e) {
                      (a[t] = e), ++s !== o || i || ((i = !0), d.resolve(c, a));
                    },
                    function (e) {
                      i || ((i = !0), d.reject(c, e));
                    }
                  );
                }
                var n = this;
                if ("[object Array]" !== Object.prototype.toString.call(e))
                  return this.reject(new TypeError("must be an array"));
                var o = e.length,
                  i = !1;
                if (!o) return this.resolve([]);
                for (
                  var a = new Array(o), s = 0, l = -1, c = new this(r);
                  ++l < o;

                )
                  t(e[l], l);
                return c;
              }),
              (o.race = function (e) {
                function t(e) {
                  n.resolve(e).then(
                    function (e) {
                      i || ((i = !0), d.resolve(s, e));
                    },
                    function (e) {
                      i || ((i = !0), d.reject(s, e));
                    }
                  );
                }
                var n = this;
                if ("[object Array]" !== Object.prototype.toString.call(e))
                  return this.reject(new TypeError("must be an array"));
                var o = e.length,
                  i = !1;
                if (!o) return this.resolve([]);
                for (var a = -1, s = new this(r); ++a < o; ) t(e[a]);
                return s;
              });
          },
          { 1: 1 },
        ],
        3: [
          function (e, t, n) {
            (function (t) {
              "use strict";
              "function" != typeof t.Promise && (t.Promise = e(2));
            }.call(
              this,
              "undefined" != typeof global
                ? global
                : "undefined" != typeof self
                ? self
                : "undefined" != typeof window
                ? window
                : {}
            ));
          },
          { 2: 2 },
        ],
        4: [
          function (e, t, n) {
            "use strict";
            function r(e, t) {
              (e = e || []), (t = t || {});
              try {
                return new Blob(e, t);
              } catch (o) {
                if ("TypeError" !== o.name) throw o;
                for (
                  var n = new (
                      "undefined" != typeof BlobBuilder
                        ? BlobBuilder
                        : "undefined" != typeof MSBlobBuilder
                        ? MSBlobBuilder
                        : "undefined" != typeof MozBlobBuilder
                        ? MozBlobBuilder
                        : WebKitBlobBuilder
                    )(),
                    r = 0;
                  r < e.length;
                  r += 1
                )
                  n.append(e[r]);
                return n.getBlob(t.type);
              }
            }
            function o(e, t) {
              t &&
                e.then(
                  function (e) {
                    t(null, e);
                  },
                  function (e) {
                    t(e);
                  }
                );
            }
            function i(e, t, n) {
              "function" == typeof t && e.then(t),
                "function" == typeof n && e.catch(n);
            }
            function a(e) {
              return (
                "string" != typeof e &&
                  (console.warn(e + " used as a key, but it is not a string."),
                  (e = String(e))),
                e
              );
            }
            function s() {
              if (
                arguments.length &&
                "function" == typeof arguments[arguments.length - 1]
              )
                return arguments[arguments.length - 1];
            }
            function l(e) {
              for (
                var t = e.length,
                  n = new ArrayBuffer(t),
                  r = new Uint8Array(n),
                  o = 0;
                o < t;
                o++
              )
                r[o] = e.charCodeAt(o);
              return n;
            }
            function c(e) {
              return "boolean" == typeof D
                ? N.resolve(D)
                : (function (e) {
                    return new N(function (t) {
                      var n = e.transaction(B, z),
                        o = r([""]);
                      n.objectStore(B).put(o, "key"),
                        (n.onabort = function (e) {
                          e.preventDefault(), e.stopPropagation(), t(!1);
                        }),
                        (n.oncomplete = function () {
                          var e = navigator.userAgent.match(/Chrome\/(\d+)/),
                            n = navigator.userAgent.match(/Edge\//);
                          t(n || !e || parseInt(e[1], 10) >= 43);
                        });
                    }).catch(function () {
                      return !1;
                    });
                  })(e).then(function (e) {
                    return (D = e);
                  });
            }
            function u(e) {
              var t = P[e.name],
                n = {};
              (n.promise = new N(function (e, t) {
                (n.resolve = e), (n.reject = t);
              })),
                t.deferredOperations.push(n),
                t.dbReady
                  ? (t.dbReady = t.dbReady.then(function () {
                      return n.promise;
                    }))
                  : (t.dbReady = n.promise);
            }
            function d(e) {
              var t = P[e.name].deferredOperations.pop();
              if (t) return t.resolve(), t.promise;
            }
            function f(e, t) {
              var n = P[e.name].deferredOperations.pop();
              if (n) return n.reject(t), n.promise;
            }
            function m(e, t) {
              return new N(function (n, r) {
                if (
                  ((P[e.name] = P[e.name] || {
                    forages: [],
                    db: null,
                    dbReady: null,
                    deferredOperations: [],
                  }),
                  e.db)
                ) {
                  if (!t) return n(e.db);
                  u(e), e.db.close();
                }
                var o = [e.name];
                t && o.push(e.version);
                var i = C.open.apply(C, o);
                t &&
                  (i.onupgradeneeded = function (t) {
                    var n = i.result;
                    try {
                      n.createObjectStore(e.storeName),
                        t.oldVersion <= 1 && n.createObjectStore(B);
                    } catch (n) {
                      if ("ConstraintError" !== n.name) throw n;
                      console.warn(
                        'The database "' +
                          e.name +
                          '" has been upgraded from version ' +
                          t.oldVersion +
                          " to version " +
                          t.newVersion +
                          ', but the storage "' +
                          e.storeName +
                          '" already exists.'
                      );
                    }
                  }),
                  (i.onerror = function (e) {
                    e.preventDefault(), r(i.error);
                  }),
                  (i.onsuccess = function () {
                    n(i.result), d(e);
                  });
              });
            }
            function h(e) {
              return m(e, !1);
            }
            function y(e) {
              return m(e, !0);
            }
            function g(e, t) {
              if (!e.db) return !0;
              var n = !e.db.objectStoreNames.contains(e.storeName),
                r = e.version < e.db.version,
                o = e.version > e.db.version;
              if (
                (r &&
                  (e.version !== t &&
                    console.warn(
                      'The database "' +
                        e.name +
                        "\" can't be downgraded from version " +
                        e.db.version +
                        " to version " +
                        e.version +
                        "."
                    ),
                  (e.version = e.db.version)),
                o || n)
              ) {
                if (n) {
                  var i = e.db.version + 1;
                  i > e.version && (e.version = i);
                }
                return !0;
              }
              return !1;
            }
            function p(e) {
              return r([l(atob(e.data))], { type: e.type });
            }
            function v(e) {
              return e && e.__local_forage_encoded_blob;
            }
            function b(e) {
              var t = this,
                n = t._initReady().then(function () {
                  var e = P[t._dbInfo.name];
                  if (e && e.dbReady) return e.dbReady;
                });
              return i(n, e, e), n;
            }
            function x(e, t, n, r) {
              void 0 === r && (r = 1);
              try {
                var o = e.db.transaction(e.storeName, t);
                n(null, o);
              } catch (o) {
                if (
                  r > 0 &&
                  (!e.db ||
                    "InvalidStateError" === o.name ||
                    "NotFoundError" === o.name)
                )
                  return N.resolve()
                    .then(function () {
                      if (
                        !e.db ||
                        ("NotFoundError" === o.name &&
                          !e.db.objectStoreNames.contains(e.storeName) &&
                          e.version <= e.db.version)
                      )
                        return e.db && (e.version = e.db.version + 1), y(e);
                    })
                    .then(function () {
                      return (function (e) {
                        u(e);
                        for (
                          var t = P[e.name], n = t.forages, r = 0;
                          r < n.length;
                          r++
                        ) {
                          var o = n[r];
                          o._dbInfo.db &&
                            (o._dbInfo.db.close(), (o._dbInfo.db = null));
                        }
                        return (
                          (e.db = null),
                          h(e)
                            .then(function (t) {
                              return (e.db = t), g(e) ? y(e) : t;
                            })
                            .then(function (r) {
                              e.db = t.db = r;
                              for (var o = 0; o < n.length; o++)
                                n[o]._dbInfo.db = r;
                            })
                            .catch(function (t) {
                              throw (f(e, t), t);
                            })
                        );
                      })(e).then(function () {
                        x(e, t, n, r - 1);
                      });
                    })
                    .catch(n);
                n(o);
              }
            }
            function w(e) {
              var t,
                n,
                r,
                o,
                i,
                a = 0.75 * e.length,
                s = e.length,
                l = 0;
              "=" === e[e.length - 1] && (a--, "=" === e[e.length - 2] && a--);
              var c = new ArrayBuffer(a),
                u = new Uint8Array(c);
              for (t = 0; t < s; t += 4)
                (n = U.indexOf(e[t])),
                  (r = U.indexOf(e[t + 1])),
                  (o = U.indexOf(e[t + 2])),
                  (i = U.indexOf(e[t + 3])),
                  (u[l++] = (n << 2) | (r >> 4)),
                  (u[l++] = ((15 & r) << 4) | (o >> 2)),
                  (u[l++] = ((3 & o) << 6) | (63 & i));
              return c;
            }
            function S(e) {
              var t,
                n = new Uint8Array(e),
                r = "";
              for (t = 0; t < n.length; t += 3)
                (r += U[n[t] >> 2]),
                  (r += U[((3 & n[t]) << 4) | (n[t + 1] >> 4)]),
                  (r += U[((15 & n[t + 1]) << 2) | (n[t + 2] >> 6)]),
                  (r += U[63 & n[t + 2]]);
              return (
                n.length % 3 == 2
                  ? (r = r.substring(0, r.length - 1) + "=")
                  : n.length % 3 == 1 &&
                    (r = r.substring(0, r.length - 2) + "=="),
                r
              );
            }
            function I(e, t, n, r) {
              e.executeSql(
                "CREATE TABLE IF NOT EXISTS " +
                  t.storeName +
                  " (id INTEGER PRIMARY KEY, key unique, value)",
                [],
                n,
                r
              );
            }
            function T(e, t, n, r, o, i) {
              e.executeSql(
                n,
                r,
                o,
                function (e, a) {
                  a.code === a.SYNTAX_ERR
                    ? e.executeSql(
                        "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
                        [t.storeName],
                        function (e, s) {
                          s.rows.length
                            ? i(e, a)
                            : I(
                                e,
                                t,
                                function () {
                                  e.executeSql(n, r, o, i);
                                },
                                i
                              );
                        },
                        i
                      )
                    : i(e, a);
                },
                i
              );
            }
            function E(e, t, n, r) {
              var i = this;
              e = a(e);
              var s = new N(function (o, a) {
                i.ready()
                  .then(function () {
                    void 0 === t && (t = null);
                    var s = t,
                      l = i._dbInfo;
                    l.serializer.serialize(t, function (t, c) {
                      c
                        ? a(c)
                        : l.db.transaction(
                            function (n) {
                              T(
                                n,
                                l,
                                "INSERT OR REPLACE INTO " +
                                  l.storeName +
                                  " (key, value) VALUES (?, ?)",
                                [e, t],
                                function () {
                                  o(s);
                                },
                                function (e, t) {
                                  a(t);
                                }
                              );
                            },
                            function (t) {
                              if (t.code === t.QUOTA_ERR) {
                                if (r > 0)
                                  return void o(E.apply(i, [e, s, n, r - 1]));
                                a(t);
                              }
                            }
                          );
                    });
                  })
                  .catch(a);
              });
              return o(s, n), s;
            }
            function M(e) {
              return new N(function (t, n) {
                e.transaction(
                  function (r) {
                    r.executeSql(
                      "SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'",
                      [],
                      function (n, r) {
                        for (var o = [], i = 0; i < r.rows.length; i++)
                          o.push(r.rows.item(i).name);
                        t({ db: e, storeNames: o });
                      },
                      function (e, t) {
                        n(t);
                      }
                    );
                  },
                  function (e) {
                    n(e);
                  }
                );
              });
            }
            function k(e, t) {
              var n = e.name + "/";
              return e.storeName !== t.storeName && (n += e.storeName + "/"), n;
            }
            function _() {
              return (
                !(function () {
                  var e = "_localforage_support_test";
                  try {
                    return (
                      localStorage.setItem(e, !0),
                      localStorage.removeItem(e),
                      !1
                    );
                  } catch (e) {
                    return !0;
                  }
                })() || localStorage.length > 0
              );
            }
            function L(e, t) {
              e[t] = function () {
                var n = arguments;
                return e.ready().then(function () {
                  return e[t].apply(e, n);
                });
              };
            }
            function A() {
              for (var e = 1; e < arguments.length; e++) {
                var t = arguments[e];
                if (t)
                  for (var n in t)
                    t.hasOwnProperty(n) &&
                      (ue(t[n])
                        ? (arguments[0][n] = t[n].slice())
                        : (arguments[0][n] = t[n]));
              }
              return arguments[0];
            }
            var F =
                "function" == typeof Symbol &&
                "symbol" == typeof Symbol.iterator
                  ? function (e) {
                      return typeof e;
                    }
                  : function (e) {
                      return e &&
                        "function" == typeof Symbol &&
                        e.constructor === Symbol &&
                        e !== Symbol.prototype
                        ? "symbol"
                        : typeof e;
                    },
              C = (function () {
                try {
                  if ("undefined" != typeof indexedDB) return indexedDB;
                  if ("undefined" != typeof webkitIndexedDB)
                    return webkitIndexedDB;
                  if ("undefined" != typeof mozIndexedDB) return mozIndexedDB;
                  if ("undefined" != typeof OIndexedDB) return OIndexedDB;
                  if ("undefined" != typeof msIndexedDB) return msIndexedDB;
                } catch (e) {
                  return;
                }
              })();
            "undefined" == typeof Promise && e(3);
            var N = Promise,
              B = "local-forage-detect-blob-support",
              D = void 0,
              P = {},
              R = Object.prototype.toString,
              O = "readonly",
              z = "readwrite",
              j = {
                _driver: "asyncStorage",
                _initStorage: function (e) {
                  function t() {
                    return N.resolve();
                  }
                  var n = this,
                    r = { db: null };
                  if (e) for (var o in e) r[o] = e[o];
                  var i = P[r.name];
                  i ||
                    ((i = {
                      forages: [],
                      db: null,
                      dbReady: null,
                      deferredOperations: [],
                    }),
                    (P[r.name] = i)),
                    i.forages.push(n),
                    n._initReady || ((n._initReady = n.ready), (n.ready = b));
                  for (var a = [], s = 0; s < i.forages.length; s++) {
                    var l = i.forages[s];
                    l !== n && a.push(l._initReady().catch(t));
                  }
                  var c = i.forages.slice(0);
                  return N.all(a)
                    .then(function () {
                      return (r.db = i.db), h(r);
                    })
                    .then(function (e) {
                      return (
                        (r.db = e), g(r, n._defaultConfig.version) ? y(r) : e
                      );
                    })
                    .then(function (e) {
                      (r.db = i.db = e), (n._dbInfo = r);
                      for (var t = 0; t < c.length; t++) {
                        var o = c[t];
                        o !== n &&
                          ((o._dbInfo.db = r.db),
                          (o._dbInfo.version = r.version));
                      }
                    });
                },
                _support: (function () {
                  try {
                    if (!C || !C.open) return !1;
                    var e =
                        "undefined" != typeof openDatabase &&
                        /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) &&
                        !/Chrome/.test(navigator.userAgent) &&
                        !/BlackBerry/.test(navigator.platform),
                      t =
                        "function" == typeof fetch &&
                        -1 !== fetch.toString().indexOf("[native code");
                    return (
                      (!e || t) &&
                      "undefined" != typeof indexedDB &&
                      "undefined" != typeof IDBKeyRange
                    );
                  } catch (e) {
                    return !1;
                  }
                })(),
                iterate: function (e, t) {
                  var n = this,
                    r = new N(function (t, r) {
                      n.ready()
                        .then(function () {
                          x(n._dbInfo, O, function (o, i) {
                            if (o) return r(o);
                            try {
                              var a = i
                                  .objectStore(n._dbInfo.storeName)
                                  .openCursor(),
                                s = 1;
                              (a.onsuccess = function () {
                                var n = a.result;
                                if (n) {
                                  var r = n.value;
                                  v(r) && (r = p(r));
                                  var o = e(r, n.key, s++);
                                  void 0 !== o ? t(o) : n.continue();
                                } else t();
                              }),
                                (a.onerror = function () {
                                  r(a.error);
                                });
                            } catch (e) {
                              r(e);
                            }
                          });
                        })
                        .catch(r);
                    });
                  return o(r, t), r;
                },
                getItem: function (e, t) {
                  var n = this;
                  e = a(e);
                  var r = new N(function (t, r) {
                    n.ready()
                      .then(function () {
                        x(n._dbInfo, O, function (o, i) {
                          if (o) return r(o);
                          try {
                            var a = i.objectStore(n._dbInfo.storeName).get(e);
                            (a.onsuccess = function () {
                              var e = a.result;
                              void 0 === e && (e = null),
                                v(e) && (e = p(e)),
                                t(e);
                            }),
                              (a.onerror = function () {
                                r(a.error);
                              });
                          } catch (e) {
                            r(e);
                          }
                        });
                      })
                      .catch(r);
                  });
                  return o(r, t), r;
                },
                setItem: function (e, t, n) {
                  var r = this;
                  e = a(e);
                  var i = new N(function (n, o) {
                    var i;
                    r.ready()
                      .then(function () {
                        return (
                          (i = r._dbInfo),
                          "[object Blob]" === R.call(t)
                            ? c(i.db).then(function (e) {
                                return e
                                  ? t
                                  : (function (e) {
                                      return new N(function (t, n) {
                                        var r = new FileReader();
                                        (r.onerror = n),
                                          (r.onloadend = function (n) {
                                            var r = btoa(n.target.result || "");
                                            t({
                                              __local_forage_encoded_blob: !0,
                                              data: r,
                                              type: e.type,
                                            });
                                          }),
                                          r.readAsBinaryString(e);
                                      });
                                    })(t);
                              })
                            : t
                        );
                      })
                      .then(function (t) {
                        x(r._dbInfo, z, function (i, a) {
                          if (i) return o(i);
                          try {
                            var s = a.objectStore(r._dbInfo.storeName);
                            null === t && (t = void 0);
                            var l = s.put(t, e);
                            (a.oncomplete = function () {
                              void 0 === t && (t = null), n(t);
                            }),
                              (a.onabort = a.onerror =
                                function () {
                                  var e = l.error
                                    ? l.error
                                    : l.transaction.error;
                                  o(e);
                                });
                          } catch (e) {
                            o(e);
                          }
                        });
                      })
                      .catch(o);
                  });
                  return o(i, n), i;
                },
                removeItem: function (e, t) {
                  var n = this;
                  e = a(e);
                  var r = new N(function (t, r) {
                    n.ready()
                      .then(function () {
                        x(n._dbInfo, z, function (o, i) {
                          if (o) return r(o);
                          try {
                            var a = i
                              .objectStore(n._dbInfo.storeName)
                              .delete(e);
                            (i.oncomplete = function () {
                              t();
                            }),
                              (i.onerror = function () {
                                r(a.error);
                              }),
                              (i.onabort = function () {
                                var e = a.error ? a.error : a.transaction.error;
                                r(e);
                              });
                          } catch (e) {
                            r(e);
                          }
                        });
                      })
                      .catch(r);
                  });
                  return o(r, t), r;
                },
                clear: function (e) {
                  var t = this,
                    n = new N(function (e, n) {
                      t.ready()
                        .then(function () {
                          x(t._dbInfo, z, function (r, o) {
                            if (r) return n(r);
                            try {
                              var i = o
                                .objectStore(t._dbInfo.storeName)
                                .clear();
                              (o.oncomplete = function () {
                                e();
                              }),
                                (o.onabort = o.onerror =
                                  function () {
                                    var e = i.error
                                      ? i.error
                                      : i.transaction.error;
                                    n(e);
                                  });
                            } catch (e) {
                              n(e);
                            }
                          });
                        })
                        .catch(n);
                    });
                  return o(n, e), n;
                },
                length: function (e) {
                  var t = this,
                    n = new N(function (e, n) {
                      t.ready()
                        .then(function () {
                          x(t._dbInfo, O, function (r, o) {
                            if (r) return n(r);
                            try {
                              var i = o
                                .objectStore(t._dbInfo.storeName)
                                .count();
                              (i.onsuccess = function () {
                                e(i.result);
                              }),
                                (i.onerror = function () {
                                  n(i.error);
                                });
                            } catch (e) {
                              n(e);
                            }
                          });
                        })
                        .catch(n);
                    });
                  return o(n, e), n;
                },
                key: function (e, t) {
                  var n = this,
                    r = new N(function (t, r) {
                      e < 0
                        ? t(null)
                        : n
                            .ready()
                            .then(function () {
                              x(n._dbInfo, O, function (o, i) {
                                if (o) return r(o);
                                try {
                                  var a = i.objectStore(n._dbInfo.storeName),
                                    s = !1,
                                    l = a.openKeyCursor();
                                  (l.onsuccess = function () {
                                    var n = l.result;
                                    n
                                      ? 0 === e || s
                                        ? t(n.key)
                                        : ((s = !0), n.advance(e))
                                      : t(null);
                                  }),
                                    (l.onerror = function () {
                                      r(l.error);
                                    });
                                } catch (e) {
                                  r(e);
                                }
                              });
                            })
                            .catch(r);
                    });
                  return o(r, t), r;
                },
                keys: function (e) {
                  var t = this,
                    n = new N(function (e, n) {
                      t.ready()
                        .then(function () {
                          x(t._dbInfo, O, function (r, o) {
                            if (r) return n(r);
                            try {
                              var i = o
                                  .objectStore(t._dbInfo.storeName)
                                  .openKeyCursor(),
                                a = [];
                              (i.onsuccess = function () {
                                var t = i.result;
                                t ? (a.push(t.key), t.continue()) : e(a);
                              }),
                                (i.onerror = function () {
                                  n(i.error);
                                });
                            } catch (e) {
                              n(e);
                            }
                          });
                        })
                        .catch(n);
                    });
                  return o(n, e), n;
                },
                dropInstance: function (e, t) {
                  t = s.apply(this, arguments);
                  var n = this.config();
                  (e = ("function" != typeof e && e) || {}).name ||
                    ((e.name = e.name || n.name),
                    (e.storeName = e.storeName || n.storeName));
                  var r,
                    i = this;
                  if (e.name) {
                    var a = e.name === n.name && i._dbInfo.db,
                      l = a
                        ? N.resolve(i._dbInfo.db)
                        : h(e).then(function (t) {
                            var n = P[e.name],
                              r = n.forages;
                            n.db = t;
                            for (var o = 0; o < r.length; o++)
                              r[o]._dbInfo.db = t;
                            return t;
                          });
                    r = e.storeName
                      ? l.then(function (t) {
                          if (t.objectStoreNames.contains(e.storeName)) {
                            var n = t.version + 1;
                            u(e);
                            var r = P[e.name],
                              o = r.forages;
                            t.close();
                            for (var i = 0; i < o.length; i++) {
                              var a = o[i];
                              (a._dbInfo.db = null), (a._dbInfo.version = n);
                            }
                            return new N(function (t, r) {
                              var o = C.open(e.name, n);
                              (o.onerror = function (e) {
                                o.result.close(), r(e);
                              }),
                                (o.onupgradeneeded = function () {
                                  o.result.deleteObjectStore(e.storeName);
                                }),
                                (o.onsuccess = function () {
                                  var e = o.result;
                                  e.close(), t(e);
                                });
                            })
                              .then(function (e) {
                                r.db = e;
                                for (var t = 0; t < o.length; t++) {
                                  var n = o[t];
                                  (n._dbInfo.db = e), d(n._dbInfo);
                                }
                              })
                              .catch(function (t) {
                                throw (
                                  ((f(e, t) || N.resolve()).catch(
                                    function () {}
                                  ),
                                  t)
                                );
                              });
                          }
                        })
                      : l.then(function (t) {
                          u(e);
                          var n = P[e.name],
                            r = n.forages;
                          t.close();
                          for (var o = 0; o < r.length; o++)
                            r[o]._dbInfo.db = null;
                          return new N(function (t, n) {
                            var r = C.deleteDatabase(e.name);
                            (r.onerror = r.onblocked =
                              function (e) {
                                var t = r.result;
                                t && t.close(), n(e);
                              }),
                              (r.onsuccess = function () {
                                var e = r.result;
                                e && e.close(), t(e);
                              });
                          })
                            .then(function (e) {
                              n.db = e;
                              for (var t = 0; t < r.length; t++)
                                d(r[t]._dbInfo);
                            })
                            .catch(function (t) {
                              throw (
                                ((f(e, t) || N.resolve()).catch(function () {}),
                                t)
                              );
                            });
                        });
                  } else r = N.reject("Invalid arguments");
                  return o(r, t), r;
                },
              },
              U =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
              K = "~~local_forage_type~",
              q = /^~~local_forage_type~([^~]+)~/,
              W = "__lfsc__:",
              H = W.length,
              X = "arbf",
              Y = "blob",
              V = "si08",
              J = "ui08",
              G = "uic8",
              Q = "si16",
              $ = "si32",
              Z = "ur16",
              ee = "ui32",
              te = "fl32",
              ne = "fl64",
              re = H + X.length,
              oe = Object.prototype.toString,
              ie = {
                serialize: function (e, t) {
                  var n = "";
                  if (
                    (e && (n = oe.call(e)),
                    e &&
                      ("[object ArrayBuffer]" === n ||
                        (e.buffer &&
                          "[object ArrayBuffer]" === oe.call(e.buffer))))
                  ) {
                    var r,
                      o = W;
                    e instanceof ArrayBuffer
                      ? ((r = e), (o += X))
                      : ((r = e.buffer),
                        "[object Int8Array]" === n
                          ? (o += V)
                          : "[object Uint8Array]" === n
                          ? (o += J)
                          : "[object Uint8ClampedArray]" === n
                          ? (o += G)
                          : "[object Int16Array]" === n
                          ? (o += Q)
                          : "[object Uint16Array]" === n
                          ? (o += Z)
                          : "[object Int32Array]" === n
                          ? (o += $)
                          : "[object Uint32Array]" === n
                          ? (o += ee)
                          : "[object Float32Array]" === n
                          ? (o += te)
                          : "[object Float64Array]" === n
                          ? (o += ne)
                          : t(new Error("Failed to get type for BinaryArray"))),
                      t(o + S(r));
                  } else if ("[object Blob]" === n) {
                    var i = new FileReader();
                    (i.onload = function () {
                      var n = K + e.type + "~" + S(this.result);
                      t(W + Y + n);
                    }),
                      i.readAsArrayBuffer(e);
                  } else
                    try {
                      t(JSON.stringify(e));
                    } catch (n) {
                      console.error(
                        "Couldn't convert value into a JSON string: ",
                        e
                      ),
                        t(null, n);
                    }
                },
                deserialize: function (e) {
                  if (e.substring(0, H) !== W) return JSON.parse(e);
                  var t,
                    n = e.substring(re),
                    o = e.substring(H, re);
                  if (o === Y && q.test(n)) {
                    var i = n.match(q);
                    (t = i[1]), (n = n.substring(i[0].length));
                  }
                  var a = w(n);
                  switch (o) {
                    case X:
                      return a;
                    case Y:
                      return r([a], { type: t });
                    case V:
                      return new Int8Array(a);
                    case J:
                      return new Uint8Array(a);
                    case G:
                      return new Uint8ClampedArray(a);
                    case Q:
                      return new Int16Array(a);
                    case Z:
                      return new Uint16Array(a);
                    case $:
                      return new Int32Array(a);
                    case ee:
                      return new Uint32Array(a);
                    case te:
                      return new Float32Array(a);
                    case ne:
                      return new Float64Array(a);
                    default:
                      throw new Error("Unkown type: " + o);
                  }
                },
                stringToBuffer: w,
                bufferToString: S,
              },
              ae = {
                _driver: "webSQLStorage",
                _initStorage: function (e) {
                  var t = this,
                    n = { db: null };
                  if (e)
                    for (var r in e)
                      n[r] = "string" != typeof e[r] ? e[r].toString() : e[r];
                  var o = new N(function (e, r) {
                    try {
                      n.db = openDatabase(
                        n.name,
                        String(n.version),
                        n.description,
                        n.size
                      );
                    } catch (e) {
                      return r(e);
                    }
                    n.db.transaction(function (o) {
                      I(
                        o,
                        n,
                        function () {
                          (t._dbInfo = n), e();
                        },
                        function (e, t) {
                          r(t);
                        }
                      );
                    }, r);
                  });
                  return (n.serializer = ie), o;
                },
                _support: "function" == typeof openDatabase,
                iterate: function (e, t) {
                  var n = this,
                    r = new N(function (t, r) {
                      n.ready()
                        .then(function () {
                          var o = n._dbInfo;
                          o.db.transaction(function (n) {
                            T(
                              n,
                              o,
                              "SELECT * FROM " + o.storeName,
                              [],
                              function (n, r) {
                                for (
                                  var i = r.rows, a = i.length, s = 0;
                                  s < a;
                                  s++
                                ) {
                                  var l = i.item(s),
                                    c = l.value;
                                  if (
                                    (c && (c = o.serializer.deserialize(c)),
                                    void 0 !== (c = e(c, l.key, s + 1)))
                                  )
                                    return void t(c);
                                }
                                t();
                              },
                              function (e, t) {
                                r(t);
                              }
                            );
                          });
                        })
                        .catch(r);
                    });
                  return o(r, t), r;
                },
                getItem: function (e, t) {
                  var n = this;
                  e = a(e);
                  var r = new N(function (t, r) {
                    n.ready()
                      .then(function () {
                        var o = n._dbInfo;
                        o.db.transaction(function (n) {
                          T(
                            n,
                            o,
                            "SELECT * FROM " +
                              o.storeName +
                              " WHERE key = ? LIMIT 1",
                            [e],
                            function (e, n) {
                              var r = n.rows.length
                                ? n.rows.item(0).value
                                : null;
                              r && (r = o.serializer.deserialize(r)), t(r);
                            },
                            function (e, t) {
                              r(t);
                            }
                          );
                        });
                      })
                      .catch(r);
                  });
                  return o(r, t), r;
                },
                setItem: function (e, t, n) {
                  return E.apply(this, [e, t, n, 1]);
                },
                removeItem: function (e, t) {
                  var n = this;
                  e = a(e);
                  var r = new N(function (t, r) {
                    n.ready()
                      .then(function () {
                        var o = n._dbInfo;
                        o.db.transaction(function (n) {
                          T(
                            n,
                            o,
                            "DELETE FROM " + o.storeName + " WHERE key = ?",
                            [e],
                            function () {
                              t();
                            },
                            function (e, t) {
                              r(t);
                            }
                          );
                        });
                      })
                      .catch(r);
                  });
                  return o(r, t), r;
                },
                clear: function (e) {
                  var t = this,
                    n = new N(function (e, n) {
                      t.ready()
                        .then(function () {
                          var r = t._dbInfo;
                          r.db.transaction(function (t) {
                            T(
                              t,
                              r,
                              "DELETE FROM " + r.storeName,
                              [],
                              function () {
                                e();
                              },
                              function (e, t) {
                                n(t);
                              }
                            );
                          });
                        })
                        .catch(n);
                    });
                  return o(n, e), n;
                },
                length: function (e) {
                  var t = this,
                    n = new N(function (e, n) {
                      t.ready()
                        .then(function () {
                          var r = t._dbInfo;
                          r.db.transaction(function (t) {
                            T(
                              t,
                              r,
                              "SELECT COUNT(key) as c FROM " + r.storeName,
                              [],
                              function (t, n) {
                                var r = n.rows.item(0).c;
                                e(r);
                              },
                              function (e, t) {
                                n(t);
                              }
                            );
                          });
                        })
                        .catch(n);
                    });
                  return o(n, e), n;
                },
                key: function (e, t) {
                  var n = this,
                    r = new N(function (t, r) {
                      n.ready()
                        .then(function () {
                          var o = n._dbInfo;
                          o.db.transaction(function (n) {
                            T(
                              n,
                              o,
                              "SELECT key FROM " +
                                o.storeName +
                                " WHERE id = ? LIMIT 1",
                              [e + 1],
                              function (e, n) {
                                var r = n.rows.length
                                  ? n.rows.item(0).key
                                  : null;
                                t(r);
                              },
                              function (e, t) {
                                r(t);
                              }
                            );
                          });
                        })
                        .catch(r);
                    });
                  return o(r, t), r;
                },
                keys: function (e) {
                  var t = this,
                    n = new N(function (e, n) {
                      t.ready()
                        .then(function () {
                          var r = t._dbInfo;
                          r.db.transaction(function (t) {
                            T(
                              t,
                              r,
                              "SELECT key FROM " + r.storeName,
                              [],
                              function (t, n) {
                                for (var r = [], o = 0; o < n.rows.length; o++)
                                  r.push(n.rows.item(o).key);
                                e(r);
                              },
                              function (e, t) {
                                n(t);
                              }
                            );
                          });
                        })
                        .catch(n);
                    });
                  return o(n, e), n;
                },
                dropInstance: function (e, t) {
                  t = s.apply(this, arguments);
                  var n = this.config();
                  (e = ("function" != typeof e && e) || {}).name ||
                    ((e.name = e.name || n.name),
                    (e.storeName = e.storeName || n.storeName));
                  var r,
                    i = this;
                  return (
                    o(
                      (r = e.name
                        ? new N(function (t) {
                            var r;
                            (r =
                              e.name === n.name
                                ? i._dbInfo.db
                                : openDatabase(e.name, "", "", 0)),
                              t(
                                e.storeName
                                  ? { db: r, storeNames: [e.storeName] }
                                  : M(r)
                              );
                          }).then(function (e) {
                            return new N(function (t, n) {
                              e.db.transaction(
                                function (r) {
                                  function o(e) {
                                    return new N(function (t, n) {
                                      r.executeSql(
                                        "DROP TABLE IF EXISTS " + e,
                                        [],
                                        function () {
                                          t();
                                        },
                                        function (e, t) {
                                          n(t);
                                        }
                                      );
                                    });
                                  }
                                  for (
                                    var i = [], a = 0, s = e.storeNames.length;
                                    a < s;
                                    a++
                                  )
                                    i.push(o(e.storeNames[a]));
                                  N.all(i)
                                    .then(function () {
                                      t();
                                    })
                                    .catch(function (e) {
                                      n(e);
                                    });
                                },
                                function (e) {
                                  n(e);
                                }
                              );
                            });
                          })
                        : N.reject("Invalid arguments")),
                      t
                    ),
                    r
                  );
                },
              },
              se = {
                _driver: "localStorageWrapper",
                _initStorage: function (e) {
                  var t = {};
                  if (e) for (var n in e) t[n] = e[n];
                  return (
                    (t.keyPrefix = k(e, this._defaultConfig)),
                    _()
                      ? ((this._dbInfo = t), (t.serializer = ie), N.resolve())
                      : N.reject()
                  );
                },
                _support: (function () {
                  try {
                    return (
                      "undefined" != typeof localStorage &&
                      "setItem" in localStorage &&
                      !!localStorage.setItem
                    );
                  } catch (e) {
                    return !1;
                  }
                })(),
                iterate: function (e, t) {
                  var n = this,
                    r = n.ready().then(function () {
                      for (
                        var t = n._dbInfo,
                          r = t.keyPrefix,
                          o = r.length,
                          i = localStorage.length,
                          a = 1,
                          s = 0;
                        s < i;
                        s++
                      ) {
                        var l = localStorage.key(s);
                        if (0 === l.indexOf(r)) {
                          var c = localStorage.getItem(l);
                          if (
                            (c && (c = t.serializer.deserialize(c)),
                            void 0 !== (c = e(c, l.substring(o), a++)))
                          )
                            return c;
                        }
                      }
                    });
                  return o(r, t), r;
                },
                getItem: function (e, t) {
                  var n = this;
                  e = a(e);
                  var r = n.ready().then(function () {
                    var t = n._dbInfo,
                      r = localStorage.getItem(t.keyPrefix + e);
                    return r && (r = t.serializer.deserialize(r)), r;
                  });
                  return o(r, t), r;
                },
                setItem: function (e, t, n) {
                  var r = this;
                  e = a(e);
                  var i = r.ready().then(function () {
                    void 0 === t && (t = null);
                    var n = t;
                    return new N(function (o, i) {
                      var a = r._dbInfo;
                      a.serializer.serialize(t, function (t, r) {
                        if (r) i(r);
                        else
                          try {
                            localStorage.setItem(a.keyPrefix + e, t), o(n);
                          } catch (e) {
                            ("QuotaExceededError" !== e.name &&
                              "NS_ERROR_DOM_QUOTA_REACHED" !== e.name) ||
                              i(e),
                              i(e);
                          }
                      });
                    });
                  });
                  return o(i, n), i;
                },
                removeItem: function (e, t) {
                  var n = this;
                  e = a(e);
                  var r = n.ready().then(function () {
                    var t = n._dbInfo;
                    localStorage.removeItem(t.keyPrefix + e);
                  });
                  return o(r, t), r;
                },
                clear: function (e) {
                  var t = this,
                    n = t.ready().then(function () {
                      for (
                        var e = t._dbInfo.keyPrefix,
                          n = localStorage.length - 1;
                        n >= 0;
                        n--
                      ) {
                        var r = localStorage.key(n);
                        0 === r.indexOf(e) && localStorage.removeItem(r);
                      }
                    });
                  return o(n, e), n;
                },
                length: function (e) {
                  var t = this.keys().then(function (e) {
                    return e.length;
                  });
                  return o(t, e), t;
                },
                key: function (e, t) {
                  var n = this,
                    r = n.ready().then(function () {
                      var t,
                        r = n._dbInfo;
                      try {
                        t = localStorage.key(e);
                      } catch (e) {
                        t = null;
                      }
                      return t && (t = t.substring(r.keyPrefix.length)), t;
                    });
                  return o(r, t), r;
                },
                keys: function (e) {
                  var t = this,
                    n = t.ready().then(function () {
                      for (
                        var e = t._dbInfo,
                          n = localStorage.length,
                          r = [],
                          o = 0;
                        o < n;
                        o++
                      ) {
                        var i = localStorage.key(o);
                        0 === i.indexOf(e.keyPrefix) &&
                          r.push(i.substring(e.keyPrefix.length));
                      }
                      return r;
                    });
                  return o(n, e), n;
                },
                dropInstance: function (e, t) {
                  if (
                    ((t = s.apply(this, arguments)),
                    !(e = ("function" != typeof e && e) || {}).name)
                  ) {
                    var n = this.config();
                    (e.name = e.name || n.name),
                      (e.storeName = e.storeName || n.storeName);
                  }
                  var r,
                    i = this;
                  return (
                    o(
                      (r = e.name
                        ? new N(function (t) {
                            t(
                              e.storeName
                                ? k(e, i._defaultConfig)
                                : e.name + "/"
                            );
                          }).then(function (e) {
                            for (var t = localStorage.length - 1; t >= 0; t--) {
                              var n = localStorage.key(t);
                              0 === n.indexOf(e) && localStorage.removeItem(n);
                            }
                          })
                        : N.reject("Invalid arguments")),
                      t
                    ),
                    r
                  );
                },
              },
              le = function (e, t) {
                return (
                  e === t ||
                  ("number" == typeof e &&
                    "number" == typeof t &&
                    isNaN(e) &&
                    isNaN(t))
                );
              },
              ce = function (e, t) {
                for (var n = e.length, r = 0; r < n; ) {
                  if (le(e[r], t)) return !0;
                  r++;
                }
                return !1;
              },
              ue =
                Array.isArray ||
                function (e) {
                  return "[object Array]" === Object.prototype.toString.call(e);
                },
              de = {},
              fe = {},
              me = { INDEXEDDB: j, WEBSQL: ae, LOCALSTORAGE: se },
              he = [
                me.INDEXEDDB._driver,
                me.WEBSQL._driver,
                me.LOCALSTORAGE._driver,
              ],
              ye = ["dropInstance"],
              ge = [
                "clear",
                "getItem",
                "iterate",
                "key",
                "keys",
                "length",
                "removeItem",
                "setItem",
              ].concat(ye),
              pe = {
                description: "",
                driver: he.slice(),
                name: "localforage",
                size: 4980736,
                storeName: "keyvaluepairs",
                version: 1,
              },
              ve = new ((function () {
                function e(t) {
                  for (var n in ((function (e, t) {
                    if (!(e instanceof t))
                      throw new TypeError("Cannot call a class as a function");
                  })(this, e),
                  me))
                    if (me.hasOwnProperty(n)) {
                      var r = me[n],
                        o = r._driver;
                      (this[n] = o), de[o] || this.defineDriver(r);
                    }
                  (this._defaultConfig = A({}, pe)),
                    (this._config = A({}, this._defaultConfig, t)),
                    (this._driverSet = null),
                    (this._initDriver = null),
                    (this._ready = !1),
                    (this._dbInfo = null),
                    this._wrapLibraryMethodsWithReady(),
                    this.setDriver(this._config.driver).catch(function () {});
                }
                return (
                  (e.prototype.config = function (e) {
                    if ("object" === (void 0 === e ? "undefined" : F(e))) {
                      if (this._ready)
                        return new Error(
                          "Can't call config() after localforage has been used."
                        );
                      for (var t in e) {
                        if (
                          ("storeName" === t &&
                            (e[t] = e[t].replace(/\W/g, "_")),
                          "version" === t && "number" != typeof e[t])
                        )
                          return new Error(
                            "Database version must be a number."
                          );
                        this._config[t] = e[t];
                      }
                      return (
                        !("driver" in e && e.driver) ||
                        this.setDriver(this._config.driver)
                      );
                    }
                    return "string" == typeof e
                      ? this._config[e]
                      : this._config;
                  }),
                  (e.prototype.defineDriver = function (e, t, n) {
                    var r = new N(function (t, n) {
                      try {
                        var r = e._driver,
                          i = new Error(
                            "Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver"
                          );
                        if (!e._driver) return void n(i);
                        for (
                          var a = ge.concat("_initStorage"),
                            s = 0,
                            l = a.length;
                          s < l;
                          s++
                        ) {
                          var c = a[s];
                          if ((!ce(ye, c) || e[c]) && "function" != typeof e[c])
                            return void n(i);
                        }
                        !(function () {
                          for (
                            var t = function (e) {
                                return function () {
                                  var t = new Error(
                                      "Method " +
                                        e +
                                        " is not implemented by the current driver"
                                    ),
                                    n = N.reject(t);
                                  return (
                                    o(n, arguments[arguments.length - 1]), n
                                  );
                                };
                              },
                              n = 0,
                              r = ye.length;
                            n < r;
                            n++
                          ) {
                            var i = ye[n];
                            e[i] || (e[i] = t(i));
                          }
                        })();
                        var u = function (n) {
                          de[r] &&
                            console.info("Redefining LocalForage driver: " + r),
                            (de[r] = e),
                            (fe[r] = n),
                            t();
                        };
                        "_support" in e
                          ? e._support && "function" == typeof e._support
                            ? e._support().then(u, n)
                            : u(!!e._support)
                          : u(!0);
                      } catch (e) {
                        n(e);
                      }
                    });
                    return i(r, t, n), r;
                  }),
                  (e.prototype.driver = function () {
                    return this._driver || null;
                  }),
                  (e.prototype.getDriver = function (e, t, n) {
                    var r = de[e]
                      ? N.resolve(de[e])
                      : N.reject(new Error("Driver not found."));
                    return i(r, t, n), r;
                  }),
                  (e.prototype.getSerializer = function (e) {
                    var t = N.resolve(ie);
                    return i(t, e), t;
                  }),
                  (e.prototype.ready = function (e) {
                    var t = this,
                      n = t._driverSet.then(function () {
                        return (
                          null === t._ready && (t._ready = t._initDriver()),
                          t._ready
                        );
                      });
                    return i(n, e, e), n;
                  }),
                  (e.prototype.setDriver = function (e, t, n) {
                    function r() {
                      a._config.driver = a.driver();
                    }
                    function o(e) {
                      return (
                        a._extend(e),
                        r(),
                        (a._ready = a._initStorage(a._config)),
                        a._ready
                      );
                    }
                    var a = this;
                    ue(e) || (e = [e]);
                    var s = this._getSupportedDrivers(e),
                      l =
                        null !== this._driverSet
                          ? this._driverSet.catch(function () {
                              return N.resolve();
                            })
                          : N.resolve();
                    return (
                      (this._driverSet = l
                        .then(function () {
                          var e = s[0];
                          return (
                            (a._dbInfo = null),
                            (a._ready = null),
                            a.getDriver(e).then(function (e) {
                              (a._driver = e._driver),
                                r(),
                                a._wrapLibraryMethodsWithReady(),
                                (a._initDriver = (function (e) {
                                  return function () {
                                    var t = 0;
                                    return (function n() {
                                      for (; t < e.length; ) {
                                        var i = e[t];
                                        return (
                                          t++,
                                          (a._dbInfo = null),
                                          (a._ready = null),
                                          a.getDriver(i).then(o).catch(n)
                                        );
                                      }
                                      r();
                                      var s = new Error(
                                        "No available storage method found."
                                      );
                                      return (
                                        (a._driverSet = N.reject(s)),
                                        a._driverSet
                                      );
                                    })();
                                  };
                                })(s));
                            })
                          );
                        })
                        .catch(function () {
                          r();
                          var e = new Error(
                            "No available storage method found."
                          );
                          return (a._driverSet = N.reject(e)), a._driverSet;
                        })),
                      i(this._driverSet, t, n),
                      this._driverSet
                    );
                  }),
                  (e.prototype.supports = function (e) {
                    return !!fe[e];
                  }),
                  (e.prototype._extend = function (e) {
                    A(this, e);
                  }),
                  (e.prototype._getSupportedDrivers = function (e) {
                    for (var t = [], n = 0, r = e.length; n < r; n++) {
                      var o = e[n];
                      this.supports(o) && t.push(o);
                    }
                    return t;
                  }),
                  (e.prototype._wrapLibraryMethodsWithReady = function () {
                    for (var e = 0, t = ge.length; e < t; e++) L(this, ge[e]);
                  }),
                  (e.prototype.createInstance = function (t) {
                    return new e(t);
                  }),
                  e
                );
              })())();
            t.exports = ve;
          },
          { 3: 3 },
        ],
      },
      {},
      [4]
    )(4);
  }),
  (window.makeElementDraggable = makeElementDraggable),
  (window.makeElementDraggableAndEditable = makeElementDraggableAndEditable);
var memory = {
    originalScreenSize: {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    },
    id: "",
    title: "",
    slides: [{ texts: {}, images: {} }],
  },
  defaultTextString = "Drag to move. To edit, hover then click pencil icon.",
  goldenRatio = 1.6,
  defaultTextWidth = 690.484,
  defaultTextHeight = 41,
  defaultTextFontSize = 30,
  defaultText = {
    text: defaultTextString,
    left: document.documentElement.clientWidth / 2 - defaultTextWidth / 2,
    top: document.documentElement.clientHeight / 2 - defaultTextHeight / 2,
    slide: 0,
    fontSize: defaultTextFontSize + "px",
  },
  defaultTextWidthBig = defaultTextWidth * goldenRatio,
  defaultTextHeightBig = defaultTextHeight * goldenRatio,
  defaultTextFontSizeBig = Math.round(defaultTextFontSize * goldenRatio),
  bytesIn1MiB = Math.pow(2, 20),
  localStorageLimit = 5 * bytesIn1MiB;
(window.Memory = {
  currentSlideIndex: 0,
  idCounter: 0,
  Text: function (e = "", t) {
    (this.text = e || defaultText.text),
      (this.left = defaultText.left),
      (this.top = defaultText.top),
      (this.slide = defaultText.slide),
      (this.fontSize = defaultText.fontSize),
      (this.id = t || Memory.generateId());
  },
  Image: function (e = "", t, n) {
    (this.file = e),
      (this.fileName = t),
      (this.left = 0),
      (this.top = 0),
      (this.slide = defaultText.slide),
      (this.id = n || Memory.generateId());
  },
  initialize: function () {
    this.initializeDefaultText(),
      this.initializeEventListeners(),
      this.initializeConsoleCommands();
  },
  initializeDefaultText: function () {
    (defaultText.text = defaultTextString),
      (defaultText.left =
        document.documentElement.clientWidth / 2 - defaultTextWidth / 2),
      (defaultText.top =
        document.documentElement.clientHeight / 2 - defaultTextHeight / 2);
  },
  initializeEventListeners: function () {
    document
      .querySelector("#save")
      .addEventListener("click", this.save.bind(this)),
      document
        .querySelector("#upload")
        .addEventListener("click", this.upload.bind(this)),
      document
        .querySelector("#share")
        .addEventListener("click", this.share.bind(this)),
      document
        .querySelector("#delete")
        .addEventListener("click", this.deleteAll.bind(this)),
      Morphing_button.setup(document.querySelector("#share"));
  },
  initializeConsoleCommands: function () {
    (document.querySelector("#save").style.display = "none"),
      (document.querySelector("#upload").style.display = "none"),
      (window.save = Memory.save.bind(Memory)),
      (window.upload = Memory.upload.bind(Memory)),
      (window.shareSaveUpload = function () {
        (document.querySelector("#share").style.display = "inline"),
          (document.querySelector("#save").style.display = "inline"),
          (document.querySelector("#upload").style.display = "inline");
      });
  },
  generateId: function () {
    var e = new Date().getTime();
    return this.idCounter++, this.idCounter + "_" + e;
  },
  createSlideInMemory: function (e) {
    memory.slides.push({ texts: {}, images: {} }),
      this.updatePersistentMemory(memory),
      e && e();
  },
  getCurrentSlide: function () {
    return memory.slides[this.currentSlideIndex];
  },
  getSlide: function (e) {
    return memory.slides[e];
  },
  getTextIds: function (e) {
    var t = this.getSlide(e);
    return t && t.texts ? Object.keys(t.texts) : [];
  },
  getImageIds: function (e) {
    var t = this.getSlide(e);
    return t && t.images ? Object.keys(t.images) : [];
  },
  haveContentInSlide: function (e) {
    var t = this.getSlide(e);
    return Object.keys(t.texts).length > 0 || Object.keys(t.images).length > 0;
  },
  addTextToMemory: function (e, t, n) {
    var r = "";
    if ("string" == typeof e) {
      var o = new this.Text(e, t);
      (r = o.id),
        (memory.slides[this.currentSlideIndex].texts[o.id] = {
          text: o.text,
          left: o.left,
          top: o.top,
          slide: o.slide,
          id: o.id,
        });
    } else
      (r = e.id),
        (memory.slides[this.currentSlideIndex].texts[e.id] = {
          text: e.text,
          left: e.left,
          top: e.top,
          slide: e.slide,
          id: e.id,
        });
    n && (memory.slides[this.currentSlideIndex].texts[r].textProps = n),
      this.updatePersistentMemory(memory);
  },
  removeTextFromMemory: function (e, t) {
    delete memory.slides[this.currentSlideIndex].texts[e],
      this.updatePersistentMemory(memory),
      t && t();
  },
  updateTextPositionInMemory: function (e, t, n) {
    memory.slides[this.currentSlideIndex].texts[e] &&
      ((memory.slides[this.currentSlideIndex].texts[e].left = t),
      (memory.slides[this.currentSlideIndex].texts[e].top = n),
      this.updatePersistentMemory(memory));
  },
  updateImagePositionInMemory: function (e, t, n) {
    memory.slides[this.currentSlideIndex].images[e] &&
      ((memory.slides[this.currentSlideIndex].images[e].left = t),
      (memory.slides[this.currentSlideIndex].images[e].top = n),
      this.updatePersistentMemory(memory));
  },
  updateTextInMemory: function (e, t) {
    memory.slides[this.currentSlideIndex].texts[e] &&
      ((memory.slides[this.currentSlideIndex].texts[e].text = t),
      this.updatePersistentMemory(memory));
  },
  updatePersistentMemory: function (e) {
    (memory = e),
      !this.isStringTooLongForLocalStorageLimit(JSON.stringify(memory)) &&
        ("undefined" != typeof localforage
          ? localforage.setItem("slidesMemory", JSON.stringify(e || memory))
          : sessionStorage.slidesMemory
          ? (sessionStorage.slidesMemory = JSON.stringify(e || memory))
          : (localStorage.slidesMemory = JSON.stringify(e || memory)));
  },
  readPersistentMemory: function (e) {
    "undefined" != typeof localforage
      ? localforage.getItem("slidesMemory", function (t, n) {
          (memory = JSON.parse(n) || memory), e && e(memory);
        })
      : (sessionStorage.slidesMemory
          ? (memory = JSON.parse(sessionStorage.slidesMemory))
          : localStorage.slidesMemory &&
            (memory = JSON.parse(localStorage.slidesMemory)),
        e && e(memory));
  },
  useMemory: function (e, t, n) {
    var r = memory.slides;
    if (0 !== r.length) {
      r.forEach(function (n, r) {
        Object.keys(n.texts).length > 0 && Memory.useTextsFromMemory(n, r, e),
          Object.keys(n.images).length > 0 &&
            Memory.useImagesFromMemory(n, r, t);
      });
      var o = this.getScaleForOriginalScreenSize(memory);
      (document.getElementById("current_slide").style.transform =
        "scale(" + o + ")"),
        n && n(memory);
    }
  },
  useTextsFromMemory: function (e, t, n) {
    Object.keys(e.texts).forEach(function (r) {
      var o = e.texts[r];
      n && n(o, t);
    });
  },
  useImagesFromMemory: function (e, t, n) {
    Object.keys(e.images).forEach(function (r) {
      var o = e.images[r];
      n && n(o, t);
    });
  },
  getScaleForOriginalScreenSize: function (e) {
    var t = e.originalScreenSize || {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      },
      n = document.documentElement.clientWidth,
      r = document.documentElement.clientHeight,
      o = n / t.width,
      i = r / t.height;
    return Math.min(o, i);
  },
  addImageToMemory: function (e, t, n) {
    if ("string" == typeof e) {
      var r = e,
        o = new this.Image(r, t, n);
      memory.slides[this.currentSlideIndex].images[o.id] = {
        file: o.file,
        fileName: o.fileName,
        left: o.left,
        top: o.top,
        slide: o.slide,
        id: o.id,
      };
    } else
      memory.slides[this.currentSlideIndex].images[e.id] = {
        file: e.file,
        fileName: e.fileName,
        left: e.left,
        top: e.top,
        slide: e.slide,
        id: e.id,
      };
    this.updatePersistentMemory(memory);
  },
  removeImageFromMemory: function (e, t) {
    confirm("Do you want to delete this image?") &&
      (delete memory.slides[this.currentSlideIndex].images[e],
      this.updatePersistentMemory(memory),
      t && t());
  },
  recreateSlidesFromMemory: function (e) {
    this.updatePersistentMemory(e),
      Slides.clearSlides(),
      this.useMemory(
        Texts.createTextCallback.bind(Texts),
        Images.createImageCallback.bind(Images)
      );
  },
  save: function () {
    confirm(
      "Your slides are already automatically saved in your browser, \nas long as you don't clear cache. \n\nDo you still want to save the slides data in a JSON file?"
    ) &&
      (this.readPersistentMemory(),
      this.download(
        JSON.stringify(memory, null, 2),
        "slides_data.json",
        "application/json"
      ));
  },
  download: function (e, t, n) {
    var r = document.createElement("a"),
      o = new Blob([e], { type: n });
    (r.href = URL.createObjectURL(o)), (r.download = t), r.click(), r.remove();
  },
  upload: function () {
    var e = document.getElementById("select_json_file");
    (e.onchange = (e) => {
      var t = e.target.files[0],
        n = new FileReader();
      n.readAsText(t, "UTF-8"),
        (n.onload = (e) => {
          var t = e.target.result,
            n = JSON.parse(t);
          this.recreateSlidesFromMemory(n), console.log(memory);
        });
    }),
      e.click();
  },
  share: function () {
    this.areAllSlidesBlankInMemory() ||
      (confirm(
        "This will create a public link that you can use to share your slides. \n\nYour slides data will be saved in Google Firebase, and may be deleted at any time at the discretion of the maintainer of this app. \n\nContinue?"
      ) &&
        (Spinner.show(),
        this.readPersistentMemory(),
        Firebase.createLink(function (e) {
          Spinner.hide();
          var t = location.protocol + "//" + location.host + "/?" + e;
          copyToClipboard(t, function () {
            console.log("Copied link: \n\n" + t);
          });
          var n = document.querySelector("#share");
          Morphing_button.morph(n),
            n.classList.add("modal"),
            (n.innerHTML = `\n        <div>You can share your slides at this public link (no login necessary):</div>\n        <br/>\n        <div class="modal-share-link" tabindex="0" autofocus \n            onclick="copyToClipboard('${t}', function() { alert('Copied link:\\n\\n' + '${t}') })">\n            ${t}\n        </div>\n        <br/>\n        <div><button onclick="Memory.closeShareModal(event)" aria-label="Close">X</button></div>\n      `),
            setUpKeyboardFocusTrap(n);
        })));
  },
  closeShareModal: function (e) {
    var t = document.querySelector("#share");
    Morphing_button.revert(t, e), t.classList.remove("modal");
  },
  deleteAll: function () {
    var e = "Do you want to delete all slides?";
    location.search &&
      (e += " \n\nNOTE: This does NOT delete the public link."),
      confirm(e) && (this.clearMemory(), (location.href = location.origin));
  },
  clearMemory: function () {
    (sessionStorage.slidesMemory = ""),
      (localStorage.slidesMemory = ""),
      (memory = {
        originalScreenSize: {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        },
        id: "",
        slides: [{ texts: {}, images: {} }],
      }),
      "undefined" != typeof localforage && localforage.clear();
  },
  areAllSlidesBlankInMemory: function () {
    if (!memory) return !0;
    if (!memory.slides || 0 === memory.slides.length) return !0;
    var e = memory.slides.some((e) => {
      var t = e.texts && Object.keys(e.texts).length > 0,
        n = e.images && Object.keys(e.images).length > 0;
      return t || n;
    });
    return e ? Slides.enableShareButton() : Slides.disableShareButton(), !e;
  },
  isStringTooLongForLocalStorageLimit: function (e) {
    return this.getStringLengthInBytes(e) > localStorageLimit;
  },
  getStringLengthInBytes: function (e) {
    return this.getStringAsBytesArray(e).length;
  },
  getStringAsBytesArray: function (e) {
    return new TextEncoder().encode(e);
  },
}),
  (window.memory = memory),
  (window.defaultTextString = defaultTextString),
  (window.goldenRatio = goldenRatio),
  (window.defaultTextWidth = defaultTextWidth),
  (window.defaultTextHeight = defaultTextHeight),
  (window.defaultTextFontSize = defaultTextFontSize),
  (window.defaultText = defaultText),
  (window.defaultTextWidthBig = defaultTextWidthBig),
  (window.defaultTextHeightBig = defaultTextHeightBig),
  (window.defaultTextFontSizeBig = defaultTextFontSizeBig);
var Morphing_button = (function () {
  function e(e) {
    const t = e.getBoundingClientRect();
    (e.style.left = t.left + "px"),
      (e.style.top = t.top + "px"),
      e.classList.add("morphing"),
      e.classList.remove("reverting"),
      (e.isExpanding = !0),
      (e.previousContent = e.innerHTML),
      (e.disabled = !0);
    var n = e.getElementsByClassName("hidden");
    n.length &&
      n.map((e) => {
        e && e.classList && e.classList.remove("hidden");
      });
  }
  function t(e, t) {
    t && t.stopPropagation && t.stopPropagation(),
      e.classList.remove("morphing"),
      e.classList.add("reverting"),
      (e.isExpanding = !1),
      (e.disabled = !1),
      e.previousContent &&
        ((e.innerHTML = e.previousContent), (e.previousContent = null));
    var n = e.getElementsByClassName("hidden");
    n.length &&
      n.map((e) => {
        e && e.classList && e.classList.add("hidden");
      });
  }
  Array.from(document.querySelectorAll(".morphing_button")).map((n) => {
    n.addEventListener("click", function (r) {
      n &&
        ((n.isExpanding = !n.isExpanding),
        (n.previousContent = n.innerHTML),
        n.isExpanding ? (e(this), (n.disabled = !1)) : t(this));
    }),
      n.addEventListener("animationend", function () {
        n && n.classList && n.classList.remove("reverting");
      });
  });
  var n = document.createElement("style");
  return (
    (n.type = "text/css"),
    (n.className = "morphing_button-style-sheet"),
    (n.innerHTML =
      "\n    .morphing_button {\n      transition: 0.2s;\n    }\n    \n    .morphing {\n      animation: morph 1s forwards;\n      margin: 0;\n      outline: none;\n      border: none;\n      overflow: hidden;\n      width: 5ch;\n      height: 5ch;\n    }\n    \n    .morphing.fill-screen {\n      animation: move_to_center 0.3s forwards, morph_to_fill_screen 0.7s 0.3s forwards;\n      position: fixed;\n      z-index: 9001;\n    }\n    \n    .reverting {\n      animation: move_from_center 0.3s forwards, revert_morph 0.3s forwards;\n      border: none;\n    }\n    \n    .morphing *,\n    .reverting * {\n      visibility: collapse;\n      height: 0;\n    }\n    \n    .morphing * {\n      animation: show_children_after_morph 1s forwards;\n    }\n\n    @keyframes move_to_center {\n      0% {\n        position: fixed;\n      }\n      100% {\n        position: fixed;\n        top: calc(50vh - 2.5ch);\n        left: calc(50vw - 2.5ch);\n      }\n    }\n\n    @keyframes move_from_center {\n      0% {\n        position: fixed;\n        top: calc(50vh - 2.5ch);\n        left: calc(50vw - 2.5ch);\n      }\n      100% {\n        position: fixed;\n      }\n    }\n    \n    @keyframes morph {\n      0% {\n        color: transparent;\n        clip-path: circle(75%);\n      }\n      50% {\n        clip-path: circle(25%);\n        width: 7ch;\n        height: 7ch;\n      }\n      90% {\n        /* defer showing text: */\n        color: transparent;\n      }\n      100% {\n        clip-path: circle(75%);\n        width: 100vw;\n        height: 100vh;\n      }\n    }\n    \n    @keyframes morph_to_fill_screen {\n      0% {\n        color: transparent;\n        clip-path: circle(75%);\n      }\n      50% {\n        clip-path: circle(25%);\n        width: 7ch;\n        height: 7ch;\n        top: calc(50vh - 3.5ch);\n        left: calc(50vw - 3.5ch);\n      }\n      90% {\n        /* defer showing text: */\n        color: transparent;\n        position: fixed;\n      }\n      100% {\n        clip-path: circle(75%);\n        width: 100vw;\n        height: 100vh;\n        top: 0;\n        left: 0;\n      }\n    }\n    \n    @keyframes show_children_after_morph {\n      0% {\n        visibility: collapse;\n        height: 0;\n        display: none;\n      }\n      90% {\n        visibility: collapse;\n        height: 0;\n        display: none;\n      }\n      100% {\n        visibility: visible;\n        height: auto;\n        display: block;\n      }\n    }\n    \n    @keyframes revert_morph {\n      0% {\n        /* copy of 100% of morph: */\n        clip-path: circle(75%);\n        width: 100vw;\n        height: 100vh;\n        color: transparent;\n        top: 0;\n        left: 0;\n      }\n      10% {\n        /* defer showing text: */\n        color: transparent;\n        position: fixed;\n      }\n      50% {\n        clip-path: circle(25%);\n        width: 7ch;\n        height: 7ch;\n        top: calc(50vh - 3.5ch);\n        left: calc(50vw - 3.5ch);\n      }\n    }\n    \n    .collapsed {\n      visibility: collapse;\n    }\n\n    "),
    document.head.appendChild(n),
    {
      setup: function (e) {
        e.addEventListener("animationend", function () {
          e && e.classList && e.classList.remove("reverting");
        });
      },
      morph: e,
      revert: t,
    }
  );
})();
window.Morphing_button = Morphing_button;
var usePlugins = !1,
  useTextPlugins = usePlugins,
  useImagePlugins = usePlugins,
  pluginCallbacksToParseTexts = [],
  pluginCallbacksToParseImages = [];
function runTextPluginsWhenTextUpdated(e, t) {
  usePlugins &&
    useTextPlugins &&
    (pluginCallbacksToParseTexts.forEach(function (t) {
      t(e);
    }),
    t && t(e));
}
function runImagePluginsWhenImageCreated(e, t) {
  usePlugins &&
    useImagePlugins &&
    (pluginCallbacksToParseTexts.forEach(function (t) {
      t(e);
    }),
    t && t(e));
}
(window.usePlugins = usePlugins),
  (window.useTextPlugins = useTextPlugins),
  (window.useImagePlugins = useImagePlugins),
  (window.pluginCallbacksToParseTexts = pluginCallbacksToParseTexts),
  (window.pluginCallbacksToParseImages = pluginCallbacksToParseImages),
  (window.runTextPluginsWhenTextUpdated = runTextPluginsWhenTextUpdated),
  (window.runImagePluginsWhenImageCreated = runImagePluginsWhenImageCreated),
  (window.Spinner = {
    previousFocus: null,
    focusTrap: null,
    initialize: function () {
      this.createSpinner(), this.createFocusTrap();
    },
    createSpinner: function () {
      var e = document.createElement("style");
      (e.type = "text/css"),
        (e.className = "spinner-style-sheet"),
        (e.innerText =
          'body.loading {  user-select: none;}body.loading:before {  z-index: 9001;  content: "";  position: absolute;  width: 120px;  height: 120px;  top: calc(50% - 120px/2); /* -1/2 of height */  left: calc(50% - 120px/2); /* -1/2 of width */  box-sizing: border-box;  border: 16px solid black;  border-radius: 50%;  border-top: 16px solid lime;  box-shadow: 0 0 20px 0 #00000050, inset 0 0 20px 0 #00000050;  -webkit-animation: spin 2s linear infinite; /* Safari */  animation: spin 2s linear infinite;  cursor: progress;}body.loading:after {  z-index: 9000;  content: "";  position: absolute;  width: 100vw;  height: 100vh;  top: 0;  left: 0;  background: #333;  opacity: 0.5;  cursor: progress;}/* Safari */@-webkit-keyframes spin {  0% { -webkit-transform: rotate(0deg); }  100% { -webkit-transform: rotate(360deg); }}@keyframes spin {  0% { transform: rotate(0deg); }  100% { transform: rotate(360deg); }}'),
        document.head.appendChild(e);
    },
    show: function () {
      document.body.classList.add("loading"), this.enableFocusTrap();
    },
    hide: function () {
      document.body.classList.remove("loading"), this.disableFocusTrap();
    },
    createFocusTrap: function () {
      (this.focusTrap = document.createElement("span")),
        (this.focusTrap.innerText = "Action in progress. Please wait."),
        (this.focusTrap.tabIndex = -1),
        (this.focusTrap.style.left = "-100vw"),
        (this.focusTrap.style.top = "-100vh");
      var e = document.createElement("button");
      (e.tabIndex = -1),
        this.focusTrap.appendChild(e),
        document.body.appendChild(this.focusTrap);
    },
    enableFocusTrap: function () {
      (this.previousFocus = document.activeElement),
        (this.focusTrap.autofocus = !0),
        (this.focusTrap.querySelector("button").tabIndex = 0),
        setUpKeyboardFocusTrap(this.focusTrap),
        this.focusTrap.focus(),
        A11y.announce("Action in progress. Please wait.");
    },
    disableFocusTrap: function () {
      (this.focusTrap.autofocus = !1),
        (this.focusTrap.querySelector("button").tabIndex = -1),
        (document.activeElement = this.previousFocus),
        document.activeElement.focus();
    },
  }),
  (window.Texts = {
    currentText: null,
    editTextIcon: null,
    editTextIconTimer: null,
    initializeTextButtons: function () {
      document
        .querySelector("#add_text")
        .addEventListener(
          "click",
          this.createNewText.bind(
            this,
            Slides.currentSlide,
            defaultText ? defaultText.text : ""
          )
        ),
        document
          .querySelector("#add_big_text")
          .addEventListener(
            "click",
            this.createNewBigText.bind(
              this,
              Slides.currentSlide,
              defaultText ? defaultText.text : ""
            )
          ),
        this.createEditIcon();
    },
    createEditIcon: function () {
      var e = document.createElement("button");
      (e.ariaLabel = "Edit text"),
        (e.id = "edit_text_icon"),
        (e.innerHTML = '<i class="material-icons">edit</i><span></span>'),
        (e.style.display = "none"),
        (e.style.position = "absolute"),
        (e.style.cursor = "text"),
        (e.style.transition = "0s"),
        (e.onclick = function () {
          var t = Texts.currentText;
          if (
            ((t.contentEditable = !0),
            (t.style.cursor = "auto"),
            t.focus(),
            (e.style.display = "none"),
            t.innerText === defaultTextString)
          ) {
            var n = document.createRange(),
              r = window.getSelection();
            n.selectNodeContents(Texts.currentText),
              r.removeAllRanges(),
              r.addRange(n);
          }
        }),
        document.body.appendChild(e),
        (Texts.editTextIcon = e);
    },
    moveEditIcon: function () {
      var e = Texts.currentText,
        t = Texts.editTextIcon,
        n = t.offsetWidth / 3,
        r = t.offsetHeight / 3;
      if (t && e) {
        var o = e.style.left.replace("px", ""),
          i = e.style.top.replace("px", ""),
          a = Math.max(0, o - n),
          s = Math.max(0, i - r);
        (t.style.left = a + "px"), (t.style.top = s + "px");
      }
    },
    recreateText: function (e = Slides.currentSlide, t, n) {
      var r = Memory.getSlide(n).texts[t],
        o = r.text,
        i = r.left * Memory.getScaleForOriginalScreenSize(memory),
        a = r.top * Memory.getScaleForOriginalScreenSize(memory),
        s = r.id,
        l = r.textProps;
      this.createText(e, o, i, a, s, n, l);
    },
    createNewText: function (
      e = Slides.currentSlide,
      t = defaultText.text,
      n = defaultText.left,
      r = defaultText.top,
      o
    ) {
      if (!this.alreadyHasDefaultText()) {
        var i = new Memory.Text(t);
        (i.left = n), (i.top = r), (i.slide = Memory.currentSlideIndex);
        var a = i.id;
        Memory.addTextToMemory(i, a, o),
          this.createText(e, t, n, r, a, Memory.currentSlideIndex, o),
          Slides.styleLeftRightButtons(),
          A11y.announce("Added new text.");
      }
    },
    createNewBigText: function (
      e = Slides.currentSlide,
      t = defaultText.text,
      n = defaultText.left + defaultTextWidth / 2 - defaultTextWidthBig / 2,
      r = defaultText.top + defaultTextHeight / 2 - defaultTextHeightBig / 2
    ) {
      var o = { fontSize: defaultTextFontSizeBig + "px" };
      this.createNewText(e, t, n, r, o);
    },
    createText: function (
      e = Slides.currentSlide,
      t = defaultText.text,
      n = defaultText.left,
      r = defaultText.top,
      o,
      i = Memory.currentSlideIndex,
      a
    ) {
      var s = document.createElement("p");
      (s.innerText = t),
        (s.style.left = n + "px"),
        (s.style.top = r + "px"),
        (s.id = o),
        (s.style.boxShadow = "none"),
        (s.style.display = Memory.currentSlideIndex === i ? "block" : "none"),
        (s.tabIndex = 0),
        (s.ariaLabel = this.getAriaLabelFromTextElement(s)),
        (s.role = "textbox"),
        s.setAttribute("data-slide", i),
        a
          ? a.fontSize && (s.style.fontSize = a.fontSize)
          : (s.style.fontSize = defaultText.fontSize),
        makeElementDraggableAndEditable(s, {
          mouseMoveCallback: Texts.updateTextPosition.bind(Texts),
          snapPoints: [
            { x: window.innerWidth / 2, y: window.innerHeight / 10 },
            { x: window.innerWidth / 2, y: window.innerHeight / 2 },
          ],
          snapCallback: function (e, t) {
            Texts.updateTextPosition(s);
          },
        }),
        (s.onpaste = function (e) {
          e.stopPropagation(), e.preventDefault();
          var t = (e.clipboardData || window.clipboardData).getData(
            "text/plain"
          );
          document.execCommand
            ? document.execCommand("insertHTML", !1, t)
            : (s.innerText = t);
        }),
        s.addEventListener("keyup", function (e) {
          var t = e.code || e.keyCode || e.which || window.event;
          if (
            ("Backspace" === t || 8 === t || "Delete" === t || 46 === t) &&
            "true" !== s.contentEditable
          ) {
            if (
              !confirm(
                "Do you want to delete this text? It starts with: " +
                  Texts.getStartOfTextStringForA11y(s.innerText)
              )
            )
              return;
            Memory.removeTextFromMemory(s.id, function () {
              s.remove();
            });
          } else
            "true" === s.contentEditable && runTextPluginsWhenTextUpdated(s);
        }),
        s.addEventListener("mousemove", function () {
          (Texts.currentText = s),
            "true" !== Texts.currentText.contentEditable &&
              ((Texts.editTextIcon.style.display = ""), Texts.moveEditIcon());
        }),
        s.addEventListener("mouseout", function (e) {
          clearTimeout(Texts.editTextIconTimer),
            (Texts.editTextIconTimer = setTimeout(function () {
              e.target !== Texts.editTextIcon &&
                e.target !== Texts.editTextIcon.querySelector("i") &&
                (Texts.editTextIcon.style.display = "none");
            }, 5e3));
        }),
        s.addEventListener("blur", function () {
          (s.contentEditable = !1),
            (s.style.cursor = "move"),
            Texts.updateText(s);
        }),
        s.addEventListener("focus", function (e) {
          if (((Texts.currentText = s), A11y.wasFocusFromKeyboard)) {
            (Texts.editTextIcon.style.display = ""), Texts.moveEditIcon();
            var t = Texts.editTextIcon.parentNode.removeChild(
              Texts.editTextIcon
            );
            Texts.currentText.parentNode.insertBefore(
              t,
              Texts.currentText.nextSibling
            );
          }
        }),
        e.appendChild(s),
        Slides.enableShareButton();
    },
    getAriaLabelFromTextElement: function (e) {
      var t = this.getStartOfTextStringForA11y(e.innerText),
        n = t ? 'Text starting with: "' + t : "(empty text)";
      return (n +=
        '" at ' + e.style.left + " left and " + e.style.top + " top");
    },
    getStartOfTextStringForA11y: function (e) {
      var t = "string" == typeof e ? e : e.text;
      if (t.length <= 20) return t;
      var n = t.slice(0, 20).lastIndexOf(" ");
      return t.slice(0, n);
    },
    updateTextPosition: function (e) {
      var t = e.offsetLeft,
        n = e.offsetTop;
      Memory.updateTextPositionInMemory(e.id, t, n),
        (e.ariaLabel = this.getAriaLabelFromTextElement(e)),
        this.moveEditIcon(),
        (Texts.editTextIcon.style.display = "none"),
        debugMemory();
    },
    updateText: function (e) {
      var t = e.innerText;
      (e.innerText = t),
        Memory.updateTextInMemory(e.id, t),
        (e.ariaLabel = this.getAriaLabelFromTextElement(e)),
        "" === t.trim() && (Memory.removeTextFromMemory(e.id), e.remove()),
        debugMemory();
    },
    alreadyHasDefaultText: function () {
      var e = Memory.getCurrentSlide().texts,
        t = Object.keys(Memory.getCurrentSlide().texts),
        n = !1;
      return (
        t.forEach(function (t) {
          var r = e[t];
          r.text !== defaultText.text ||
            r.left !== defaultText.left ||
            r.top !== defaultText.top ||
            (n = !0);
        }),
        n
      );
    },
    createTextCallback: function (e, t) {
      this.recreateText(Slides.currentSlide, e.id, t);
    },
  }),
  (window.Slides = {
    currentSlide: document.getElementById("current_slide"),
    leftButton: document.getElementById("left"),
    rightButton: document.getElementById("right"),
    isInitializingMemory: !0,
    slideNumberTimer: null,
    initialize: function () {
      "undefined" != typeof localforage ||
      sessionStorage.slidesMemory ||
      localStorage.slidesMemory
        ? Memory.readPersistentMemory(
            Memory.recreateSlidesFromMemory.bind(Memory)
          )
        : Memory.updatePersistentMemory(memory),
        this.setUpSlides(),
        (this.isInitializingMemory = !1),
        this.initializeEventListeners(),
        this.initializeConsoleCommands();
    },
    initializeEventListeners: function () {
      document.body.addEventListener("keyup", this.detectArrowKeys.bind(this)),
        this.leftButton.addEventListener("click", this.left.bind(this)),
        this.rightButton.addEventListener("click", this.right.bind(this));
      var e = document.getElementById("slide_number");
      e.addEventListener("keyup", this.delayedSetSlideNumber.bind(this)),
        e.addEventListener("change", this.setSlideNumber.bind(this, e.value));
    },
    initializeConsoleCommands: function () {
      window.title = function (e) {
        Slides.addTitle(e || "");
      };
    },
    addTitle: function (e) {
      var t = "";
      (t =
        e ||
        prompt(
          "Edit title that shows on every slide:",
          document.body.getAttribute("data-content")
        )),
        Slides.setTitle(t),
        (memory.title = t),
        Memory.updatePersistentMemory(memory);
    },
    setTitle: function (e) {
      document.body.setAttribute("data-content", e);
    },
    delayedSetSlideNumber: function () {
      var e = document.getElementById("slide_number");
      clearTimeout(this.slideNumberTimer),
        (this.slideNumberTimer = setTimeout(function () {
          Slides.setSlideNumber(e.value);
        }, 1e3));
    },
    setUpSlides: function () {
      Memory.areAllSlidesBlankInMemory() && this.setUpInitialSlide(),
        this.styleLeftRightButtons(),
        this.updateSlideNumberInputMax(),
        this.setSlideNumber(Memory.currentSlideIndex + 1),
        Memory.readPersistentMemory(function (e) {
          e && e.title && Slides.setTitle(e.title);
        });
    },
    setSlideNumber: function (e) {
      "number" != typeof e &&
        (e = parseInt(document.getElementById("slide_number").value));
      var t = e - 1,
        n = document.getElementById("slide_number");
      (n.value = e),
        t !== memory.slides.length ||
          this.isLastSlideBlank() ||
          (Memory.createSlideInMemory(),
          this.updateSlideNumberInputMax(),
          this.leftButton.classList.remove("hide-on-first-load")),
        0 < e && e < memory.slides.length + 1
          ? (t > 0 && this.leftButton.classList.remove("hide-on-first-load"),
            this.hideSlide(Memory.currentSlideIndex),
            (Memory.currentSlideIndex = t),
            this.showSlide(Memory.currentSlideIndex),
            A11y.announceSlideNumber(Memory.currentSlideIndex + 1),
            this.styleLeftRightButtons(),
            (n.style.width = n.value.length + 5 + "ch"),
            (Texts.editTextIcon.style.display = "none"),
            (Images.deleteImageIcon.style.display = "none"))
          : (n.value = Memory.currentSlideIndex + 1);
    },
    detectArrowKeys: function (e) {
      var t = document.activeElement === document.body,
        n = "BUTTON" === document.activeElement.tagName,
        r = "IMG" === document.activeElement.tagName;
      if (t || n || r) {
        var o = e.code || e.keyCode || e.which || window.event,
          i = "ArrowRight" === o || 39 === o,
          a = "ArrowDown" === o || 40 === o;
        "ArrowLeft" === o || 37 === o || "ArrowUp" === o || 38 === o
          ? this.left()
          : (i || a) && this.right();
      }
    },
    left: function () {
      0 !== Memory.currentSlideIndex &&
        (this.hideSlide(Memory.currentSlideIndex),
        Memory.currentSlideIndex--,
        this.showSlide(Memory.currentSlideIndex),
        this.styleLeftRightButtons(),
        this.setSlideNumber(Memory.currentSlideIndex + 1),
        A11y.announceSlideNumber(Memory.currentSlideIndex + 1));
    },
    right: function () {
      Memory.haveContentInSlide(Memory.currentSlideIndex) &&
        (this.hideSlide(Memory.currentSlideIndex),
        Memory.currentSlideIndex++,
        Memory.currentSlideIndex >= memory.slides.length &&
          (Memory.createSlideInMemory(), this.updateSlideNumberInputMax()),
        this.showSlide(Memory.currentSlideIndex),
        this.styleLeftRightButtons(),
        this.setSlideNumber(Memory.currentSlideIndex + 1),
        this.leftButton.classList.remove("hide-on-first-load"),
        A11y.announceSlideNumber(Memory.currentSlideIndex + 1));
    },
    styleLeftRightButtons: function () {
      Memory.currentSlideIndex < 1
        ? (this.leftButton.setAttribute("disabled", !0),
          this.leftButton.nextElementSibling.setAttribute(
            "data-before",
            "(You're on the first slide)"
          ),
          this.leftButton.nextElementSibling.style.setProperty(
            "--left",
            "-7.1em"
          ))
        : (this.leftButton.removeAttribute("disabled"),
          this.leftButton.nextElementSibling.setAttribute(
            "data-before",
            "Previous slide"
          ),
          this.leftButton.nextElementSibling.style.setProperty(
            "--left",
            "-5em"
          )),
        Memory.currentSlideIndex === memory.slides.length - 1 &&
        !Memory.haveContentInSlide(Memory.currentSlideIndex)
          ? (this.rightButton.setAttribute("disabled", !0),
            this.rightButton.nextElementSibling.setAttribute(
              "data-before",
              "(You're on the last slide)"
            ),
            this.rightButton.nextElementSibling.style.setProperty(
              "--left",
              "-7.2em"
            ))
          : (this.rightButton.removeAttribute("disabled"),
            this.rightButton.nextElementSibling.setAttribute(
              "data-before",
              "Next slide"
            ),
            this.rightButton.nextElementSibling.style.setProperty(
              "--left",
              "-4.2em"
            ));
    },
    updateSlideNumberInputMax: function () {
      var e = document.getElementById("slide_number"),
        t = memory.slides.length + 1;
      e.setAttribute("max", t);
    },
    hideSlide: function (e) {
      Memory.getTextIds(e).map(function (e) {
        var t = document.getElementById(e);
        t && (t.style.display = "none");
      }),
        Memory.getImageIds(e).map(function (e) {
          var t = document.getElementById(e);
          t && (t.style.display = "none");
        });
    },
    showSlide: function (e) {
      Memory.getTextIds(e).map(function (e) {
        var t = document.getElementById(e);
        t && (t.style.display = "block");
      }),
        Memory.getImageIds(e).map(function (e) {
          var t = document.getElementById(e);
          t && (t.style.display = "block");
        });
    },
    setUpInitialSlide: function () {
      var e = Memory.getCurrentSlide().texts;
      Object.keys(e).length > 0 || Texts.createNewText(this.currentSlide);
    },
    clearSlides: function () {
      document.querySelector("#current_slide").innerHTML = "";
    },
    isLastSlideBlank: function () {
      var e = memory.slides.length - 1,
        t = Object.keys(memory.slides[e].texts).length,
        n = Object.keys(memory.slides[e].images).length;
      return 0 === t && 0 === n;
    },
    disableShareButton: function () {
      document.getElementById("share").setAttribute("disabled", !0);
    },
    enableShareButton: function () {
      document.getElementById("share").removeAttribute("disabled");
    },
  });
