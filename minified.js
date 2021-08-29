/*! LICENSE: https://github.com/hchiam/_2DNote/blob/master/LICENSE */
var _2DNote = {
  audioContext: new (AudioContext || webkitAudioContext)(),
  note: null,
  viewXRange: [0, document.documentElement.clientWidth],
  viewYRange: [0, document.documentElement.clientHeight],
  comfyFrequencyRange: [150, 400],
  comfyVolumeRange: [0, 0.5],
  panRange: [-1, 1],
  setAs2DArea: function (e, t, n) {
    (n = n || !0), (this.callbackUponUpdate = t);
    var r = e || document.body;
    r.addEventListener("mousedown", this.play.bind(this)),
      r.addEventListener("mouseup", this.stop.bind(this)),
      r.addEventListener("mousemove", this.update.bind(this)),
      r.addEventListener("touchstart", this.play.bind(this)),
      r.addEventListener("touchend", this.stop.bind(this)),
      r.addEventListener("touchmove", this.update.bind(this)),
      n && this.setupExitedViewDetection(r);
  },
  play: function (e, t) {
    (t = t || !0), this.stop(), t && this.setupExitedViewDetection(e);
    var n = this.getFrequency(e),
      r = this.getVolume(e),
      i = this.getPan(e),
      o = this.audioContext.createGain();
    o.connect(this.audioContext.destination),
      (o.gain.value = isNaN(r) ? 0.5 : r);
    var a = this.audioContext.createOscillator();
    (a.type = "sine"), (a.frequency.value = isNaN(n) ? 400 : n), a.connect(o);
    var s = this.audioContext.createStereoPanner();
    i && (s.pan.value = i),
      o.connect(s),
      s.connect(this.audioContext.destination),
      a.start(),
      (this.note = { oscillator: a, volumeSetup: o, panner: s });
  },
  update: function (e, t) {
    if (this.note) {
      var n = this.getFrequency(e),
        r = this.getVolume(e),
        i = this.getPan(e);
      (this.note.volumeSetup.gain.value = r),
        (this.note.oscillator.frequency.value = n),
        (this.note.panner.pan.value = i),
        t
          ? t(r, n, i)
          : this.callbackUponUpdate && this.callbackUponUpdate(r, n, i);
    }
  },
  stop: function () {
    null != this.note &&
      (this.note.oscillator.stop(this.audioContext.currentTime),
      (this.note = null));
  },
  setupExitedViewDetection: function (e) {
    var t = e || document.body;
    t.removeEventListener &&
      t.addEventListener &&
      (t.removeEventListener("mouseleave", this.warnExitedView),
      t.removeEventListener("touchcancel", this.warnExitedView),
      t.addEventListener("mouseleave", this.warnExitedView),
      t.addEventListener("touchcancel", this.warnExitedView));
  },
  warnExitedView: function (e) {
    var t = e || document.body,
      n = {
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
  normalize: function (e, t, n) {
    var r = t[0],
      i = t[1],
      o = n[0],
      a = n[1],
      s = ((a - o) / (i - r)) * (e - r) + o;
    return Math.min(Math.max(s, o), a);
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
      for (var i in t)
        t.hasOwnProperty(i) &&
          ("audioContext" === i
            ? (r.audioContext = new AudioContext())
            : (r[i] = e(t[i])));
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
            setTimeout(function () {
              _2DNote.stop(t);
            }, 300));
        });
    },
  }),
  (window.copyToClipboard = copyToClipboard);
var isDebuggingEnabled = !1;
function enableDebugging() {
  (isDebuggingEnabled = !0), debugMemory();
}
function debugMemory() {
  isDebuggingEnabled &&
    console.log(
      JSON.stringify(memory, null, 2),
      "and memory.slides.length: ",
      memory.slides.length
    );
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
  (window.isDebuggingEnabled = isDebuggingEnabled),
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
    i = n[0],
    o = n[n.length - 1];
  (t || 0 !== n.length) &&
    (r.focus(),
    e.addEventListener("keydown", function (e) {
      var t = 9 === (e.keyCode || e.which),
        n = e.shiftKey;
      t && n
        ? document.activeElement === i && (e.preventDefault(), o.focus())
        : t &&
          !n &&
          document.activeElement === o &&
          (e.preventDefault(), i.focus());
    }),
    e.addEventListener("blur", function (e) {
      e.preventDefault(), i.focus();
    }));
}
function makeElementDraggable(e, t) {
  function n(n) {
    i(n), t && t.mouseMoveCallback && t.mouseMoveCallback(e);
  }
  function r(n) {
    i(n), t && t.touchMoveCallback && t.touchMoveCallback(e);
  }
  function i(t) {
    e.focus();
    var n = t || window.event;
    n.preventDefault();
    var r =
        n.clientX - e.mouseX ||
        (n.touches && n.touches.length && n.touches[0].pageX - e.mouseX),
      i =
        n.clientY - e.mouseY ||
        (n.touches && n.touches.length && n.touches[0].pageY - e.mouseY);
    (e.mouseX =
      n.clientX || (n.touches && n.touches.length && n.touches[0].pageX)),
      (e.mouseY =
        n.clientY || (n.touches && n.touches.length && n.touches[0].pageY)),
      (e.style.left = e.offsetLeft + r + "px"),
      (e.style.top = e.offsetTop + i + "px");
  }
  function o() {
    document.removeEventListener("mouseup", o),
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
      i = e.offsetWidth,
      o = e.offsetHeight,
      a = n + i / 2,
      l = r + o / 2,
      u = !1;
    if (t && t.snapGridSize) {
      var d = t.snapGridSize,
        f = c(a, d) - i / 2,
        m = c(l, d) - o / 2;
      (e.style.left = f + "px"), (e.style.top = m + "px"), (u = !0);
    }
    if (e.snapPoints && e.snapPoints.length) {
      d = 50;
      clearTimeout(s),
        e.snapPoints.some(function (t) {
          if (
            (function (e, t, n, r) {
              r = r || 50;
              var i = e.x - t,
                o = e.y - n;
              return Math.sqrt(i * i + o * o) <= r;
            })(t, a, l, d)
          ) {
            var n = t.x - i / 2,
              r = t.y - o / 2;
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
  function c(e, t) {
    return (t = t || 25) * Math.floor(e / t);
  }
  (e.mouseX = 0),
    (e.mouseY = 0),
    (e.disableStyleReset = (t && t.disableStyleReset) || !1),
    (e.snapPoints = (t && t.snapPoints) || []),
    e.addEventListener(
      "mousedown",
      function (r) {
        var i = r || window.event;
        i.preventDefault(),
          (e.mouseX =
            i.clientX || (i.touches && i.touches.length && i.touches[0].pageX)),
          (e.mouseY =
            i.clientY || (i.touches && i.touches.length && i.touches[0].pageY)),
          document.addEventListener("mouseup", o, !1),
          document.addEventListener("mousemove", n, !1),
          t && t.mouseDownCallback && t.mouseDownCallback(e);
      },
      !1
    ),
    e.addEventListener(
      "touchstart",
      function (n) {
        var i = n || window.event;
        i.preventDefault(),
          (e.mouseX =
            i.clientX || (i.touches && i.touches.length && i.touches[0].pageX)),
          (e.mouseY =
            i.clientY || (i.touches && i.touches.length && i.touches[0].pageY)),
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
        "Draggable. To drag this element around, hit the arrow keys. Text: " +
          e.innerText
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
              i = e.offsetTop,
              o = 10;
            switch (n) {
              case "ArrowLeft":
                r -= o;
                break;
              case "ArrowUp":
                i -= o;
                break;
              case "ArrowRight":
                r += o;
                break;
              case "ArrowDown":
                i += o;
            }
            (e.style.left = r + "px"),
              (e.style.top = i + "px"),
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
      document.addEventListener("mousemove", i, !1),
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
      document.addEventListener("touchmove", o, !1),
      (e.contentEditable = !1),
      (e.detectAsClickToEdit = !e.disableEditing),
      t && t.touchStartCallback && t.touchStartCallback(e);
  }
  function i(n) {
    a(n),
      (e.detectAsClickToEdit = !1),
      t && t.mouseMoveCallback && t.mouseMoveCallback(e);
  }
  function o(n) {
    a(n), t && t.touchMoveCallback && t.touchMoveCallback(e);
  }
  function a(t) {
    e.focus();
    var n = t || window.event;
    n.preventDefault();
    var r =
        n.clientX - e.mouseX ||
        (n.touches && n.touches.length && n.touches[0].pageX - e.mouseX),
      i =
        n.clientY - e.mouseY ||
        (n.touches && n.touches.length && n.touches[0].pageY - e.mouseY);
    (e.mouseX =
      n.clientX || (n.touches && n.touches.length && n.touches[0].pageX)),
      (e.mouseY =
        n.clientY || (n.touches && n.touches.length && n.touches[0].pageY)),
      (e.style.left = e.offsetLeft + r + "px"),
      (e.style.top = e.offsetTop + i + "px");
  }
  function s() {
    document.removeEventListener("mouseup", s),
      document.removeEventListener("mousemove", i),
      e.detectAsClickToEdit &&
        ((e.contentEditable = !0),
        e.focus(),
        e.removeEventListener("mousedown", n)),
      u(e),
      t && t.mouseUpCallback && t.mouseUpCallback(e);
  }
  function l() {
    document.removeEventListener("touchend", l),
      document.removeEventListener("touchmove", o),
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
      i = e.offsetWidth,
      o = e.offsetHeight,
      a = n + i / 2,
      s = r + o / 2,
      l = !1;
    if (t && t.snapGridSize) {
      var u = t.snapGridSize,
        f = d(a, u) - i / 2,
        m = d(s, u) - o / 2;
      (e.style.left = f + "px"), (e.style.top = m + "px"), (l = !0);
    }
    if (e.snapPoints && e.snapPoints.length) {
      u = 50;
      clearTimeout(c),
        e.snapPoints.some(function (t) {
          if (
            (function (e, t, n, r) {
              r = r || 50;
              var i = e.x - t,
                o = e.y - n;
              return Math.sqrt(i * i + o * o) <= r;
            })(t, a, s, u)
          ) {
            var n = t.x - i / 2,
              r = t.y - o / 2;
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
  function d(e, t) {
    return (t = t || 25) * Math.floor(e / t);
  }
  function f(e) {
    var t = e || window.event,
      n = t.key || t.code || t.keyCode || t.which;
    return "Tab" === n || 9 === n;
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
        "Draggable and editable. To enter drag mode, hit Escape and then hit the arrow keys. To enter edit mode, hit any letter. Text: " +
          e.innerText
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
            })(n),
            i = window.getSelection() && window.getSelection().getRangeAt(0),
            o = i && !i.startOffset;
          if (!r || (e.startedTyping && !o)) {
            if (
              (function (e) {
                var t = e || window.event,
                  n = t.key || t.code || t.keyCode || t.which;
                return "Escape" === n || "Esc" === n || 27 === n;
              })(n) ||
              f(n)
            )
              (e.startedTyping = !1),
                (e.detectAsClickToEdit = !1),
                (e.contentEditable = !1),
                e.blur(),
                e.focus();
            else if (!f(n)) {
              var a =
                i && (!i.startOffset || i.startOffset > e.innerText.length);
              !e.startedTyping &&
                a &&
                (function (e) {
                  var t = document.createRange();
                  t.setStart(e, 0), t.collapse(!0);
                  var n = window.getSelection();
                  n.removeAllRanges(), n.addRange(t);
                })(e),
                (e.startedTyping = !0),
                (e.detectAsClickToEdit = !0),
                (e.contentEditable = !0),
                e.focus();
            }
          } else
            (e.detectAsClickToEdit = !1),
              (e.contentEditable = !1),
              (function (e, n) {
                var r = e.offsetLeft,
                  i = e.offsetTop,
                  o = 10;
                switch (n) {
                  case "ArrowLeft":
                    r -= o;
                    break;
                  case "ArrowUp":
                    i -= o;
                    break;
                  case "ArrowRight":
                    r += o;
                    break;
                  case "ArrowDown":
                    i += o;
                }
                (e.style.left = r + "px"),
                  (e.style.top = i + "px"),
                  t && t.keyboardMoveCallback && t.keyboardMoveCallback(e);
              })(e, r);
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
    Memory.readPersistentMemory(function (t) {
      t &&
        (t.id
          ? Firebase.updateExistingDoc(t, t.id, e)
          : Firebase.createNewDoc(t, e));
    });
  },
  updateExistingDoc: function (e, t, n) {
    if (e) {
      var r = this.database.collection("slides").doc(t),
        i = JSON.stringify(e);
      this.isStringTooLongForFirestoreFieldValue(i)
        ? this.updateExtraData(r, t, i, n)
        : r
            .set({
              data: i,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then(function () {
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
            .then(function (n) {
              (e.id = n.id), Memory.updatePersistentMemory(e), t && t(n.id);
            })
            .catch(Firebase.handleShareLinkError);
    }
  },
  showShareButton: function (e) {
    (e = e || !0),
      (document.querySelector("#share").style.display = e ? "inline" : "none");
  },
  showSaveButton: function (e) {
    (e = e || !0),
      (document.querySelector("#save").style.display = e ? "inline" : "none");
  },
  showUploadButton: function (e) {
    (e = e || !0),
      (document.querySelector("#upload").style.display = e ? "inline" : "none");
  },
  useLink: function () {
    if (location.search && location.search.slice(1)) {
      var e = location.search.slice(1);
      if (e) {
        var t = "",
          n = this.collection.doc(e);
        n.get()
          .then(function (r) {
            var i = r.data();
            if (((t = i.data), i.extras && "number" == typeof i.extras)) {
              function o(e) {
                return e.docs[0].data().data;
              }
              for (var a = [], s = 0; s < i.extras; s++) {
                var l = String(s + 1),
                  c = n.collection(l).get().then(o);
                a.push(c);
              }
              Promise.all(a)
                .then(function (e) {
                  t += e.join("");
                })
                .then(function () {
                  var n = JSON.parse(t.replace(/([undefined]*)$/, ""));
                  (memory = n),
                    (memory.id = n.id || e),
                    (memory.title = n.title || ""),
                    memory && memory.title && Slides.setTitle(memory.title),
                    Memory.recreateSlidesFromMemory(memory);
                });
            } else {
              var u = JSON.parse(i.data);
              (memory = u),
                (memory.id = u.id || e),
                (memory.title = u.title || ""),
                memory && memory.title && Slides.setTitle(memory.title),
                Memory.recreateSlidesFromMemory(memory);
            }
          })
          .catch(function (e) {
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
    var t = Memory.getStringAsBytesArray(e).map(function (e) {
        return new TextEncoder().encode(e).length;
      }),
      n = 0,
      r = "",
      i = [];
    return (
      t.forEach(function (t, o) {
        n + t < maxFieldValueSizeInBytes
          ? ((r += e[o]), (n += t))
          : (i.push(r), (r = e[o]), (n = 0));
      }),
      r && i.push(r),
      i
    );
  },
  updateExtraData: function (e, t, n, r) {
    var i = Firebase.splitStringToFitInFirestoreFieldValue(n),
      o = i.length - 1;
    return e
      .set({
        data: i[0],
        extras: o,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(function () {
        for (var n = [], a = 0, s = 0; s < o; s++) {
          var l = String(s + 1),
            c = e
              .collection(l)
              .get()
              .then(function (e) {
                e.forEach(function (e) {
                  e.ref.delete();
                });
              })
              .then(function () {
                a++, e.collection(String(a)).add({ data: i[a] });
              });
          n.push(c);
        }
        Promise.all(n)
          .then(function () {
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
      .then(function (e) {
        memory.id = e.id;
        for (var i = [], o = 0; o < r; o++) {
          var a = String(o + 1),
            s = e.collection(a).add({ data: n[o + 1] });
          i.push(s);
        }
        Promise.all(i).then(function () {
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
      setTimeout(function () {
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
          i = !(
            ("KeyF" !== r && 70 !== r) ||
            e.ctrlKey ||
            e.metaKey ||
            e.altKey ||
            e.shiftKey
          ),
          o = "F11" === r || 122 === r,
          a =
            (e.ctrlKey || e.metaKey) &&
            e.shiftKey &&
            ("KeyF" === r || 70 === r),
          s = "Escape" === r || 27 === r;
        i || o
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
    fullscreen: function (e) {
      (e = e || !0),
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
    showControls: function (e) {
      (e = e || !0),
        (document.getElementById("controls").style.visibility = e
          ? ""
          : "hidden");
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
        i = n.offsetHeight / 4,
        o = Math.max(0, e - r),
        a = Math.max(0, t - i);
      (n.style.left = o + "px"), (n.style.top = a + "px");
    },
    recreateImage: function (e, t, n) {
      (e = e || Slides.currentSlide), (this.recreatingImage = !0);
      var r = Memory.getSlide(n).images[t],
        i = r.file,
        o = r.fileName,
        a = r.left * Memory.getScaleForOriginalScreenSize(memory),
        s = r.top * Memory.getScaleForOriginalScreenSize(memory);
      (Slides.isInitializingMemory = !0),
        this.createImage(Slides.currentSlide, i, o, a, s, t, n);
    },
    createNewImage: function (e, t) {
      (t = t || ""), (this.recreatingImage = !1);
      var n = new Memory.Image(e, t);
      Memory.addImageToMemory(n, n.id);
      e = n.file;
      var r = n.left,
        i = n.top,
        o = n.id;
      (Slides.isInitializingMemory = !1),
        this.createImage(
          Slides.currentSlide,
          e,
          t,
          r,
          i,
          o,
          Memory.currentSlideIndex
        ),
        A11y.announce("Added new image.");
    },
    createImage: function (e, t, n, r, i, o, a) {
      e = e || Slides.currentSlide;
      var s = document.createElement("img");
      (s.src = t),
        (s.fileName = encodeURI(n)),
        (s.style.left = isNaN(r) && r.endsWith("px") ? r : r + "px"),
        (s.style.top = isNaN(i) && i.endsWith("px") ? i : i + "px"),
        (s.style.zIndex = -1),
        (s.id = o),
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
        setTimeout(function () {
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
          i = this;
        (r.onload = function (e) {
          var t = e.target.result;
          i.createNewImage(t, n);
        }),
          (e.onchange = function (e) {
            var t = e.target.files[0];
            r.readAsDataURL(t);
          });
        var o = t;
        r.readAsDataURL(o);
      }
    },
    setMaxImageSize: function (e) {
      var t = document.documentElement.clientHeight,
        n = document.documentElement.clientWidth,
        r = e.height - t,
        i = e.width - n;
      r > i && r > 0
        ? (e.style.height = (e.height > t ? t : e.height) + "px")
        : i >= r &&
          i > 0 &&
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
      function i(a, s) {
        if (!n[a]) {
          if (!t[a]) {
            var l = "function" == typeof require && require;
            if (!s && l) return l(a, !0);
            if (o) return o(a, !0);
            var c = new Error("Cannot find module '" + a + "'");
            throw ((c.code = "MODULE_NOT_FOUND"), c);
          }
          var u = (n[a] = { exports: {} });
          t[a][0].call(
            u.exports,
            function (e) {
              return i(t[a][1][e] || e);
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
        var o = "function" == typeof require && require, a = 0;
        a < r.length;
        a++
      )
        i(r[a]);
      return i;
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
                i = e.MutationObserver || e.WebKitMutationObserver;
              if (i) {
                var o = 0,
                  a = new i(n),
                  s = e.document.createTextNode("");
                a.observe(s, { characterData: !0 }),
                  (r = function () {
                    s.data = o = ++o % 2;
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
            function i(e) {
              if ("function" != typeof e)
                throw new TypeError("resolver must be a function");
              (this.state = h),
                (this.queue = []),
                (this.outcome = void 0),
                e !== r && l(this, e);
            }
            function o(e, t, n) {
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
                i || ((i = !0), d.reject(e, t));
              }
              function r(t) {
                i || ((i = !0), d.resolve(e, t));
              }
              var i = !1,
                o = c(function () {
                  t(r, n);
                });
              "error" === o.status && n(o.value);
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
            (t.exports = i),
              (i.prototype.catch = function (e) {
                return this.then(null, e);
              }),
              (i.prototype.then = function (e, t) {
                if (
                  ("function" != typeof e && this.state === m) ||
                  ("function" != typeof t && this.state === f)
                )
                  return this;
                var n = new this.constructor(r);
                return (
                  this.state !== h
                    ? a(n, this.state === m ? e : t, this.outcome)
                    : this.queue.push(new o(n, e, t)),
                  n
                );
              }),
              (o.prototype.callFulfilled = function (e) {
                d.resolve(this.promise, e);
              }),
              (o.prototype.otherCallFulfilled = function (e) {
                a(this.promise, this.onFulfilled, e);
              }),
              (o.prototype.callRejected = function (e) {
                d.reject(this.promise, e);
              }),
              (o.prototype.otherCallRejected = function (e) {
                a(this.promise, this.onRejected, e);
              }),
              (d.resolve = function (e, t) {
                var n = c(s, t);
                if ("error" === n.status) return d.reject(e, n.value);
                var r = n.value;
                if (r) l(e, r);
                else {
                  (e.state = m), (e.outcome = t);
                  for (var i = -1, o = e.queue.length; ++i < o; )
                    e.queue[i].callFulfilled(t);
                }
                return e;
              }),
              (d.reject = function (e, t) {
                (e.state = f), (e.outcome = t);
                for (var n = -1, r = e.queue.length; ++n < r; )
                  e.queue[n].callRejected(t);
                return e;
              }),
              (i.resolve = function (e) {
                return e instanceof this ? e : d.resolve(new this(r), e);
              }),
              (i.reject = function (e) {
                var t = new this(r);
                return d.reject(t, e);
              }),
              (i.all = function (e) {
                function t(e, t) {
                  n.resolve(e).then(
                    function (e) {
                      (a[t] = e), ++s !== i || o || ((o = !0), d.resolve(c, a));
                    },
                    function (e) {
                      o || ((o = !0), d.reject(c, e));
                    }
                  );
                }
                var n = this;
                if ("[object Array]" !== Object.prototype.toString.call(e))
                  return this.reject(new TypeError("must be an array"));
                var i = e.length,
                  o = !1;
                if (!i) return this.resolve([]);
                for (
                  var a = new Array(i), s = 0, l = -1, c = new this(r);
                  ++l < i;

                )
                  t(e[l], l);
                return c;
              }),
              (i.race = function (e) {
                function t(e) {
                  n.resolve(e).then(
                    function (e) {
                      o || ((o = !0), d.resolve(s, e));
                    },
                    function (e) {
                      o || ((o = !0), d.reject(s, e));
                    }
                  );
                }
                var n = this;
                if ("[object Array]" !== Object.prototype.toString.call(e))
                  return this.reject(new TypeError("must be an array"));
                var i = e.length,
                  o = !1;
                if (!i) return this.resolve([]);
                for (var a = -1, s = new this(r); ++a < i; ) t(e[a]);
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
              } catch (i) {
                if ("TypeError" !== i.name) throw i;
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
            function i(e, t) {
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
            function o(e, t, n) {
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
                  i = 0;
                i < t;
                i++
              )
                r[i] = e.charCodeAt(i);
              return n;
            }
            function c(e) {
              return "boolean" == typeof D
                ? N.resolve(D)
                : (function (e) {
                    return new N(function (t) {
                      var n = e.transaction(B, z),
                        i = r([""]);
                      n.objectStore(B).put(i, "key"),
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
              var t = R[e.name],
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
              var t = R[e.name].deferredOperations.pop();
              if (t) return t.resolve(), t.promise;
            }
            function f(e, t) {
              var n = R[e.name].deferredOperations.pop();
              if (n) return n.reject(t), n.promise;
            }
            function m(e, t) {
              return new N(function (n, r) {
                if (
                  ((R[e.name] = R[e.name] || {
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
                var i = [e.name];
                t && i.push(e.version);
                var o = C.open.apply(C, i);
                t &&
                  (o.onupgradeneeded = function (t) {
                    var n = o.result;
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
                  (o.onerror = function (e) {
                    e.preventDefault(), r(o.error);
                  }),
                  (o.onsuccess = function () {
                    n(o.result), d(e);
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
                i = e.version > e.db.version;
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
                i || n)
              ) {
                if (n) {
                  var o = e.db.version + 1;
                  o > e.version && (e.version = o);
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
                  var e = R[t._dbInfo.name];
                  if (e && e.dbReady) return e.dbReady;
                });
              return o(n, e, e), n;
            }
            function x(e, t, n, r) {
              void 0 === r && (r = 1);
              try {
                var i = e.db.transaction(e.storeName, t);
                n(null, i);
              } catch (i) {
                if (
                  r > 0 &&
                  (!e.db ||
                    "InvalidStateError" === i.name ||
                    "NotFoundError" === i.name)
                )
                  return N.resolve()
                    .then(function () {
                      if (
                        !e.db ||
                        ("NotFoundError" === i.name &&
                          !e.db.objectStoreNames.contains(e.storeName) &&
                          e.version <= e.db.version)
                      )
                        return e.db && (e.version = e.db.version + 1), y(e);
                    })
                    .then(function () {
                      return (function (e) {
                        u(e);
                        for (
                          var t = R[e.name], n = t.forages, r = 0;
                          r < n.length;
                          r++
                        ) {
                          var i = n[r];
                          i._dbInfo.db &&
                            (i._dbInfo.db.close(), (i._dbInfo.db = null));
                        }
                        return (
                          (e.db = null),
                          h(e)
                            .then(function (t) {
                              return (e.db = t), g(e) ? y(e) : t;
                            })
                            .then(function (r) {
                              e.db = t.db = r;
                              for (var i = 0; i < n.length; i++)
                                n[i]._dbInfo.db = r;
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
                n(i);
              }
            }
            function w(e) {
              var t,
                n,
                r,
                i,
                o,
                a = 0.75 * e.length,
                s = e.length,
                l = 0;
              "=" === e[e.length - 1] && (a--, "=" === e[e.length - 2] && a--);
              var c = new ArrayBuffer(a),
                u = new Uint8Array(c);
              for (t = 0; t < s; t += 4)
                (n = U.indexOf(e[t])),
                  (r = U.indexOf(e[t + 1])),
                  (i = U.indexOf(e[t + 2])),
                  (o = U.indexOf(e[t + 3])),
                  (u[l++] = (n << 2) | (r >> 4)),
                  (u[l++] = ((15 & r) << 4) | (i >> 2)),
                  (u[l++] = ((3 & i) << 6) | (63 & o));
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
            function T(e, t, n, r, i, o) {
              e.executeSql(
                n,
                r,
                i,
                function (e, a) {
                  a.code === a.SYNTAX_ERR
                    ? e.executeSql(
                        "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
                        [t.storeName],
                        function (e, s) {
                          s.rows.length
                            ? o(e, a)
                            : I(
                                e,
                                t,
                                function () {
                                  e.executeSql(n, r, i, o);
                                },
                                o
                              );
                        },
                        o
                      )
                    : o(e, a);
                },
                o
              );
            }
            function E(e, t, n, r) {
              var o = this;
              e = a(e);
              var s = new N(function (i, a) {
                o.ready()
                  .then(function () {
                    void 0 === t && (t = null);
                    var s = t,
                      l = o._dbInfo;
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
                                  i(s);
                                },
                                function (e, t) {
                                  a(t);
                                }
                              );
                            },
                            function (t) {
                              if (t.code === t.QUOTA_ERR) {
                                if (r > 0)
                                  return void i(E.apply(o, [e, s, n, r - 1]));
                                a(t);
                              }
                            }
                          );
                    });
                  })
                  .catch(a);
              });
              return i(s, n), s;
            }
            function M(e) {
              return new N(function (t, n) {
                e.transaction(
                  function (r) {
                    r.executeSql(
                      "SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'",
                      [],
                      function (n, r) {
                        for (var i = [], o = 0; o < r.rows.length; o++)
                          i.push(r.rows.item(o).name);
                        t({ db: e, storeNames: i });
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
            function F() {
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
            var A =
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
              R = {},
              P = Object.prototype.toString,
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
                  if (e) for (var i in e) r[i] = e[i];
                  var o = R[r.name];
                  o ||
                    ((o = {
                      forages: [],
                      db: null,
                      dbReady: null,
                      deferredOperations: [],
                    }),
                    (R[r.name] = o)),
                    o.forages.push(n),
                    n._initReady || ((n._initReady = n.ready), (n.ready = b));
                  for (var a = [], s = 0; s < o.forages.length; s++) {
                    var l = o.forages[s];
                    l !== n && a.push(l._initReady().catch(t));
                  }
                  var c = o.forages.slice(0);
                  return N.all(a)
                    .then(function () {
                      return (r.db = o.db), h(r);
                    })
                    .then(function (e) {
                      return (
                        (r.db = e), g(r, n._defaultConfig.version) ? y(r) : e
                      );
                    })
                    .then(function (e) {
                      (r.db = o.db = e), (n._dbInfo = r);
                      for (var t = 0; t < c.length; t++) {
                        var i = c[t];
                        i !== n &&
                          ((i._dbInfo.db = r.db),
                          (i._dbInfo.version = r.version));
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
                          x(n._dbInfo, O, function (i, o) {
                            if (i) return r(i);
                            try {
                              var a = o
                                  .objectStore(n._dbInfo.storeName)
                                  .openCursor(),
                                s = 1;
                              (a.onsuccess = function () {
                                var n = a.result;
                                if (n) {
                                  var r = n.value;
                                  v(r) && (r = p(r));
                                  var i = e(r, n.key, s++);
                                  void 0 !== i ? t(i) : n.continue();
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
                  return i(r, t), r;
                },
                getItem: function (e, t) {
                  var n = this;
                  e = a(e);
                  var r = new N(function (t, r) {
                    n.ready()
                      .then(function () {
                        x(n._dbInfo, O, function (i, o) {
                          if (i) return r(i);
                          try {
                            var a = o.objectStore(n._dbInfo.storeName).get(e);
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
                  return i(r, t), r;
                },
                setItem: function (e, t, n) {
                  var r = this;
                  e = a(e);
                  var o = new N(function (n, i) {
                    var o;
                    r.ready()
                      .then(function () {
                        return (
                          (o = r._dbInfo),
                          "[object Blob]" === P.call(t)
                            ? c(o.db).then(function (e) {
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
                        x(r._dbInfo, z, function (o, a) {
                          if (o) return i(o);
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
                                  i(e);
                                });
                          } catch (e) {
                            i(e);
                          }
                        });
                      })
                      .catch(i);
                  });
                  return i(o, n), o;
                },
                removeItem: function (e, t) {
                  var n = this;
                  e = a(e);
                  var r = new N(function (t, r) {
                    n.ready()
                      .then(function () {
                        x(n._dbInfo, z, function (i, o) {
                          if (i) return r(i);
                          try {
                            var a = o
                              .objectStore(n._dbInfo.storeName)
                              .delete(e);
                            (o.oncomplete = function () {
                              t();
                            }),
                              (o.onerror = function () {
                                r(a.error);
                              }),
                              (o.onabort = function () {
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
                  return i(r, t), r;
                },
                clear: function (e) {
                  var t = this,
                    n = new N(function (e, n) {
                      t.ready()
                        .then(function () {
                          x(t._dbInfo, z, function (r, i) {
                            if (r) return n(r);
                            try {
                              var o = i
                                .objectStore(t._dbInfo.storeName)
                                .clear();
                              (i.oncomplete = function () {
                                e();
                              }),
                                (i.onabort = i.onerror =
                                  function () {
                                    var e = o.error
                                      ? o.error
                                      : o.transaction.error;
                                    n(e);
                                  });
                            } catch (e) {
                              n(e);
                            }
                          });
                        })
                        .catch(n);
                    });
                  return i(n, e), n;
                },
                length: function (e) {
                  var t = this,
                    n = new N(function (e, n) {
                      t.ready()
                        .then(function () {
                          x(t._dbInfo, O, function (r, i) {
                            if (r) return n(r);
                            try {
                              var o = i
                                .objectStore(t._dbInfo.storeName)
                                .count();
                              (o.onsuccess = function () {
                                e(o.result);
                              }),
                                (o.onerror = function () {
                                  n(o.error);
                                });
                            } catch (e) {
                              n(e);
                            }
                          });
                        })
                        .catch(n);
                    });
                  return i(n, e), n;
                },
                key: function (e, t) {
                  var n = this,
                    r = new N(function (t, r) {
                      e < 0
                        ? t(null)
                        : n
                            .ready()
                            .then(function () {
                              x(n._dbInfo, O, function (i, o) {
                                if (i) return r(i);
                                try {
                                  var a = o.objectStore(n._dbInfo.storeName),
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
                  return i(r, t), r;
                },
                keys: function (e) {
                  var t = this,
                    n = new N(function (e, n) {
                      t.ready()
                        .then(function () {
                          x(t._dbInfo, O, function (r, i) {
                            if (r) return n(r);
                            try {
                              var o = i
                                  .objectStore(t._dbInfo.storeName)
                                  .openKeyCursor(),
                                a = [];
                              (o.onsuccess = function () {
                                var t = o.result;
                                t ? (a.push(t.key), t.continue()) : e(a);
                              }),
                                (o.onerror = function () {
                                  n(o.error);
                                });
                            } catch (e) {
                              n(e);
                            }
                          });
                        })
                        .catch(n);
                    });
                  return i(n, e), n;
                },
                dropInstance: function (e, t) {
                  t = s.apply(this, arguments);
                  var n = this.config();
                  (e = ("function" != typeof e && e) || {}).name ||
                    ((e.name = e.name || n.name),
                    (e.storeName = e.storeName || n.storeName));
                  var r,
                    o = this;
                  if (e.name) {
                    var a = e.name === n.name && o._dbInfo.db,
                      l = a
                        ? N.resolve(o._dbInfo.db)
                        : h(e).then(function (t) {
                            var n = R[e.name],
                              r = n.forages;
                            n.db = t;
                            for (var i = 0; i < r.length; i++)
                              r[i]._dbInfo.db = t;
                            return t;
                          });
                    r = e.storeName
                      ? l.then(function (t) {
                          if (t.objectStoreNames.contains(e.storeName)) {
                            var n = t.version + 1;
                            u(e);
                            var r = R[e.name],
                              i = r.forages;
                            t.close();
                            for (var o = 0; o < i.length; o++) {
                              var a = i[o];
                              (a._dbInfo.db = null), (a._dbInfo.version = n);
                            }
                            return new N(function (t, r) {
                              var i = C.open(e.name, n);
                              (i.onerror = function (e) {
                                i.result.close(), r(e);
                              }),
                                (i.onupgradeneeded = function () {
                                  i.result.deleteObjectStore(e.storeName);
                                }),
                                (i.onsuccess = function () {
                                  var e = i.result;
                                  e.close(), t(e);
                                });
                            })
                              .then(function (e) {
                                r.db = e;
                                for (var t = 0; t < i.length; t++) {
                                  var n = i[t];
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
                          var n = R[e.name],
                            r = n.forages;
                          t.close();
                          for (var i = 0; i < r.length; i++)
                            r[i]._dbInfo.db = null;
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
                  return i(r, t), r;
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
              ie = Object.prototype.toString,
              oe = {
                serialize: function (e, t) {
                  var n = "";
                  if (
                    (e && (n = ie.call(e)),
                    e &&
                      ("[object ArrayBuffer]" === n ||
                        (e.buffer &&
                          "[object ArrayBuffer]" === ie.call(e.buffer))))
                  ) {
                    var r,
                      i = W;
                    e instanceof ArrayBuffer
                      ? ((r = e), (i += X))
                      : ((r = e.buffer),
                        "[object Int8Array]" === n
                          ? (i += V)
                          : "[object Uint8Array]" === n
                          ? (i += J)
                          : "[object Uint8ClampedArray]" === n
                          ? (i += G)
                          : "[object Int16Array]" === n
                          ? (i += Q)
                          : "[object Uint16Array]" === n
                          ? (i += Z)
                          : "[object Int32Array]" === n
                          ? (i += $)
                          : "[object Uint32Array]" === n
                          ? (i += ee)
                          : "[object Float32Array]" === n
                          ? (i += te)
                          : "[object Float64Array]" === n
                          ? (i += ne)
                          : t(new Error("Failed to get type for BinaryArray"))),
                      t(i + S(r));
                  } else if ("[object Blob]" === n) {
                    var o = new FileReader();
                    (o.onload = function () {
                      var n = K + e.type + "~" + S(this.result);
                      t(W + Y + n);
                    }),
                      o.readAsArrayBuffer(e);
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
                    i = e.substring(H, re);
                  if (i === Y && q.test(n)) {
                    var o = n.match(q);
                    (t = o[1]), (n = n.substring(o[0].length));
                  }
                  var a = w(n);
                  switch (i) {
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
                      throw new Error("Unkown type: " + i);
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
                  var i = new N(function (e, r) {
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
                    n.db.transaction(function (i) {
                      I(
                        i,
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
                  return (n.serializer = oe), i;
                },
                _support: "function" == typeof openDatabase,
                iterate: function (e, t) {
                  var n = this,
                    r = new N(function (t, r) {
                      n.ready()
                        .then(function () {
                          var i = n._dbInfo;
                          i.db.transaction(function (n) {
                            T(
                              n,
                              i,
                              "SELECT * FROM " + i.storeName,
                              [],
                              function (n, r) {
                                for (
                                  var o = r.rows, a = o.length, s = 0;
                                  s < a;
                                  s++
                                ) {
                                  var l = o.item(s),
                                    c = l.value;
                                  if (
                                    (c && (c = i.serializer.deserialize(c)),
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
                  return i(r, t), r;
                },
                getItem: function (e, t) {
                  var n = this;
                  e = a(e);
                  var r = new N(function (t, r) {
                    n.ready()
                      .then(function () {
                        var i = n._dbInfo;
                        i.db.transaction(function (n) {
                          T(
                            n,
                            i,
                            "SELECT * FROM " +
                              i.storeName +
                              " WHERE key = ? LIMIT 1",
                            [e],
                            function (e, n) {
                              var r = n.rows.length
                                ? n.rows.item(0).value
                                : null;
                              r && (r = i.serializer.deserialize(r)), t(r);
                            },
                            function (e, t) {
                              r(t);
                            }
                          );
                        });
                      })
                      .catch(r);
                  });
                  return i(r, t), r;
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
                        var i = n._dbInfo;
                        i.db.transaction(function (n) {
                          T(
                            n,
                            i,
                            "DELETE FROM " + i.storeName + " WHERE key = ?",
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
                  return i(r, t), r;
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
                  return i(n, e), n;
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
                  return i(n, e), n;
                },
                key: function (e, t) {
                  var n = this,
                    r = new N(function (t, r) {
                      n.ready()
                        .then(function () {
                          var i = n._dbInfo;
                          i.db.transaction(function (n) {
                            T(
                              n,
                              i,
                              "SELECT key FROM " +
                                i.storeName +
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
                  return i(r, t), r;
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
                                for (var r = [], i = 0; i < n.rows.length; i++)
                                  r.push(n.rows.item(i).key);
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
                  return i(n, e), n;
                },
                dropInstance: function (e, t) {
                  t = s.apply(this, arguments);
                  var n = this.config();
                  (e = ("function" != typeof e && e) || {}).name ||
                    ((e.name = e.name || n.name),
                    (e.storeName = e.storeName || n.storeName));
                  var r,
                    o = this;
                  return (
                    i(
                      (r = e.name
                        ? new N(function (t) {
                            var r;
                            (r =
                              e.name === n.name
                                ? o._dbInfo.db
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
                                  function i(e) {
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
                                    var o = [], a = 0, s = e.storeNames.length;
                                    a < s;
                                    a++
                                  )
                                    o.push(i(e.storeNames[a]));
                                  N.all(o)
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
                      ? ((this._dbInfo = t), (t.serializer = oe), N.resolve())
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
                          i = r.length,
                          o = localStorage.length,
                          a = 1,
                          s = 0;
                        s < o;
                        s++
                      ) {
                        var l = localStorage.key(s);
                        if (0 === l.indexOf(r)) {
                          var c = localStorage.getItem(l);
                          if (
                            (c && (c = t.serializer.deserialize(c)),
                            void 0 !== (c = e(c, l.substring(i), a++)))
                          )
                            return c;
                        }
                      }
                    });
                  return i(r, t), r;
                },
                getItem: function (e, t) {
                  var n = this;
                  e = a(e);
                  var r = n.ready().then(function () {
                    var t = n._dbInfo,
                      r = localStorage.getItem(t.keyPrefix + e);
                    return r && (r = t.serializer.deserialize(r)), r;
                  });
                  return i(r, t), r;
                },
                setItem: function (e, t, n) {
                  var r = this;
                  e = a(e);
                  var o = r.ready().then(function () {
                    void 0 === t && (t = null);
                    var n = t;
                    return new N(function (i, o) {
                      var a = r._dbInfo;
                      a.serializer.serialize(t, function (t, r) {
                        if (r) o(r);
                        else
                          try {
                            localStorage.setItem(a.keyPrefix + e, t), i(n);
                          } catch (e) {
                            ("QuotaExceededError" !== e.name &&
                              "NS_ERROR_DOM_QUOTA_REACHED" !== e.name) ||
                              o(e),
                              o(e);
                          }
                      });
                    });
                  });
                  return i(o, n), o;
                },
                removeItem: function (e, t) {
                  var n = this;
                  e = a(e);
                  var r = n.ready().then(function () {
                    var t = n._dbInfo;
                    localStorage.removeItem(t.keyPrefix + e);
                  });
                  return i(r, t), r;
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
                  return i(n, e), n;
                },
                length: function (e) {
                  var t = this.keys().then(function (e) {
                    return e.length;
                  });
                  return i(t, e), t;
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
                  return i(r, t), r;
                },
                keys: function (e) {
                  var t = this,
                    n = t.ready().then(function () {
                      for (
                        var e = t._dbInfo,
                          n = localStorage.length,
                          r = [],
                          i = 0;
                        i < n;
                        i++
                      ) {
                        var o = localStorage.key(i);
                        0 === o.indexOf(e.keyPrefix) &&
                          r.push(o.substring(e.keyPrefix.length));
                      }
                      return r;
                    });
                  return i(n, e), n;
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
                    o = this;
                  return (
                    i(
                      (r = e.name
                        ? new N(function (t) {
                            t(
                              e.storeName
                                ? k(e, o._defaultConfig)
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
                        i = r._driver;
                      (this[n] = i), de[i] || this.defineDriver(r);
                    }
                  (this._defaultConfig = F({}, pe)),
                    (this._config = F({}, this._defaultConfig, t)),
                    (this._driverSet = null),
                    (this._initDriver = null),
                    (this._ready = !1),
                    (this._dbInfo = null),
                    this._wrapLibraryMethodsWithReady(),
                    this.setDriver(this._config.driver).catch(function () {});
                }
                return (
                  (e.prototype.config = function (e) {
                    if ("object" === (void 0 === e ? "undefined" : A(e))) {
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
                          o = new Error(
                            "Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver"
                          );
                        if (!e._driver) return void n(o);
                        for (
                          var a = ge.concat("_initStorage"),
                            s = 0,
                            l = a.length;
                          s < l;
                          s++
                        ) {
                          var c = a[s];
                          if ((!ce(ye, c) || e[c]) && "function" != typeof e[c])
                            return void n(o);
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
                                    i(n, arguments[arguments.length - 1]), n
                                  );
                                };
                              },
                              n = 0,
                              r = ye.length;
                            n < r;
                            n++
                          ) {
                            var o = ye[n];
                            e[o] || (e[o] = t(o));
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
                    return o(r, t, n), r;
                  }),
                  (e.prototype.driver = function () {
                    return this._driver || null;
                  }),
                  (e.prototype.getDriver = function (e, t, n) {
                    var r = de[e]
                      ? N.resolve(de[e])
                      : N.reject(new Error("Driver not found."));
                    return o(r, t, n), r;
                  }),
                  (e.prototype.getSerializer = function (e) {
                    var t = N.resolve(oe);
                    return o(t, e), t;
                  }),
                  (e.prototype.ready = function (e) {
                    var t = this,
                      n = t._driverSet.then(function () {
                        return (
                          null === t._ready && (t._ready = t._initDriver()),
                          t._ready
                        );
                      });
                    return o(n, e, e), n;
                  }),
                  (e.prototype.setDriver = function (e, t, n) {
                    function r() {
                      a._config.driver = a.driver();
                    }
                    function i(e) {
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
                                        var o = e[t];
                                        return (
                                          t++,
                                          (a._dbInfo = null),
                                          (a._ready = null),
                                          a.getDriver(o).then(i).catch(n)
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
                      o(this._driverSet, t, n),
                      this._driverSet
                    );
                  }),
                  (e.prototype.supports = function (e) {
                    return !!fe[e];
                  }),
                  (e.prototype._extend = function (e) {
                    F(this, e);
                  }),
                  (e.prototype._getSupportedDrivers = function (e) {
                    for (var t = [], n = 0, r = e.length; n < r; n++) {
                      var i = e[n];
                      this.supports(i) && t.push(i);
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
  (window.makeElementDraggableAndEditable = makeElementDraggableAndEditable),
  (window.memory = {
    originalScreenSize: {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    },
    id: "",
    title: "",
    slides: [{ texts: {}, images: {} }],
  });
var defaultTextString = "Drag to move. To edit, hover then click pencil icon.",
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
  Text: function (e, t) {
    (e = e || ""),
      (this.text = e || defaultText.text),
      (this.left = defaultText.left),
      (this.top = defaultText.top),
      (this.slide = defaultText.slide),
      (this.fontSize = defaultText.fontSize),
      (this.id = t || Memory.generateId());
  },
  Image: function (e, t, n) {
    (e = e || ""),
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
        .addEventListener("click", this.deleteJustThisSlide.bind(this)),
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
    return (
      t && (Object.keys(t.texts).length > 0 || Object.keys(t.images).length > 0)
    );
  },
  addTextToMemory: function (e, t, n) {
    var r = "";
    if ("string" == typeof e) {
      var i = new this.Text(e, t);
      (r = i.id),
        (memory.slides[this.currentSlideIndex].texts[i.id] = {
          text: i.text,
          left: i.left,
          top: i.top,
          slide: i.slide,
          id: i.id,
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
        (sessionStorage.slidesMemory
          ? (sessionStorage.slidesMemory = JSON.stringify(e || memory))
          : (localStorage.slidesMemory = JSON.stringify(e || memory)));
  },
  readPersistentMemory: function (e) {
    sessionStorage.slidesMemory
      ? (memory = JSON.parse(sessionStorage.slidesMemory))
      : localStorage.slidesMemory &&
        (memory = JSON.parse(localStorage.slidesMemory)),
      e && e(memory);
  },
  useMemory: function (e, t, n) {
    var r = memory.slides;
    if (0 !== r.length) {
      r.forEach(function (n, r) {
        Object.keys(n.texts).length > 0 && Memory.useTextsFromMemory(n, r, e),
          Object.keys(n.images).length > 0 &&
            Memory.useImagesFromMemory(n, r, t);
      });
      var i = this.getScaleForOriginalScreenSize(memory);
      (document.getElementById("current_slide").style.transform =
        "scale(" + i + ")"),
        n && n(memory);
    }
  },
  useTextsFromMemory: function (e, t, n) {
    Object.keys(e.texts).forEach(function (r) {
      var i = e.texts[r];
      n && n(i, t);
    });
  },
  useImagesFromMemory: function (e, t, n) {
    Object.keys(e.images).forEach(function (r) {
      var i = e.images[r];
      n && n(i, t);
    });
  },
  getScaleForOriginalScreenSize: function (e) {
    var t = e.originalScreenSize || {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      },
      n = document.documentElement.clientWidth,
      r = document.documentElement.clientHeight,
      i = n / t.width,
      o = r / t.height;
    return Math.min(i, o);
  },
  addImageToMemory: function (e, t, n) {
    if ("string" == typeof e) {
      var r = e,
        i = new this.Image(r, t, n);
      memory.slides[this.currentSlideIndex].images[i.id] = {
        file: i.file,
        fileName: i.fileName,
        left: i.left,
        top: i.top,
        slide: i.slide,
        id: i.id,
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
      i = new Blob([e], { type: n });
    (r.href = URL.createObjectURL(i)), (r.download = t), r.click(), r.remove();
  },
  upload: function () {
    var e = document.getElementById("select_json_file");
    (e.onchange = function (e) {
      var t = e.target.files[0],
        n = new FileReader();
      n.readAsText(t, "UTF-8"),
        (n.onload = function (e) {
          var t = e.target.result,
            n = JSON.parse(t);
          Memory.recreateSlidesFromMemory(n), console.log(memory);
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
            (n.innerHTML =
              '<div>You can share your slides at this public link (no login necessary):</div><br/><div class="modal-share-link" tabindex="0" autofocus     onclick="copyToClipboard(' +
              t +
              ", function() { alert('Copied link:\\n\\n" +
              t +
              ') })">' +
              t +
              '</div><br/><div><button onclick="Memory.closeShareModal(event)" aria-label="Close">X</button></div>'),
            setUpKeyboardFocusTrap(n);
        })));
  },
  closeShareModal: function (e) {
    var t = document.querySelector("#share");
    Morphing_button.revert(t, e), t.classList.remove("modal");
  },
  deleteAll: function () {
    var e = "CONFIRM: \n\n  Do you want to delete ALL slides?";
    location.search &&
      (e += " \n\nNOTE: This does NOT delete the public link."),
      confirm(e) && (this.clearMemory(), (location.href = location.origin));
  },
  deleteJustThisSlide: function () {
    var e =
      "CONFIRM: \n\n  Do you want to delete JUST THIS slide? (Slide " +
      (this.currentSlideIndex + 1) +
      ".)";
    if (
      (location.search &&
        (e += " \n\nNOTE: This does NOT delete the public link."),
      confirm(e))
    ) {
      this.deleteElementsOnSlide(this.currentSlideIndex),
        this.currentSlideIndex > 0 &&
          this.deleteSlideFromMemory(this.currentSlideIndex);
      var t = Math.min(this.currentSlideIndex + 1, memory.slides.length - 1);
      Slides.setSlideNumber(t + 1);
    }
  },
  deleteElementsOnSlide: function (e) {
    var t = memory.slides[e].texts,
      n = memory.slides[e].images,
      r = Object.keys(t).map(function (t) {
        return memory.slides[e].texts[t].id;
      }),
      i = Object.keys(n).map(function (t) {
        return memory.slides[e].images[t].id;
      });
    r.forEach(function (e) {
      document.querySelector('[id="' + e + '"]').remove();
    }),
      i.forEach(function (e) {
        document.querySelector('[id="' + e + '"]').remove();
      });
  },
  deleteSlideFromMemory: function (e) {
    memory.slides.splice(e, 1), this.updatePersistentMemory(memory);
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
      });
  },
  areAllSlidesBlankInMemory: function () {
    if (!memory) return !0;
    if (!memory.slides || 0 === memory.slides.length) return !0;
    var e = memory.slides.some(function (e) {
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
    var t = e.getBoundingClientRect();
    (e.style.left = t.left + "px"),
      (e.style.top = t.top + "px"),
      e.classList.add("morphing"),
      e.classList.remove("reverting"),
      (e.isExpanding = !0),
      (e.previousContent = e.innerHTML),
      (e.disabled = !0);
    var n = e.getElementsByClassName("hidden");
    n.length &&
      n.map(function (e) {
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
      n.map(function (e) {
        e && e.classList && e.classList.add("hidden");
      });
  }
  Array.from(document.querySelectorAll(".morphing_button")).map(function (n) {
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
      "    .morphing_button {      transition: 0.2s;    }        .morphing {      animation: morph 1s forwards;      margin: 0;      outline: none;      border: none;      overflow: hidden;      width: 5ch;      height: 5ch;    }        .morphing.fill-screen {      animation: move_to_center 0.3s forwards, morph_to_fill_screen 0.7s 0.3s forwards;      position: fixed;      z-index: 9001;    }        .reverting {      animation: move_from_center 0.3s forwards, revert_morph 0.3s forwards;      border: none;    }        .morphing *,    .reverting * {      visibility: collapse;      height: 0;    }        .morphing * {      animation: show_children_after_morph 1s forwards;    }    @keyframes move_to_center {      0% {        position: fixed;      }      100% {        position: fixed;        top: calc(50vh - 2.5ch);        left: calc(50vw - 2.5ch);      }    }    @keyframes move_from_center {      0% {        position: fixed;        top: calc(50vh - 2.5ch);        left: calc(50vw - 2.5ch);      }      100% {        position: fixed;      }    }        @keyframes morph {      0% {        color: transparent;        clip-path: circle(75%);      }      50% {        clip-path: circle(25%);        width: 7ch;        height: 7ch;      }      90% {        /* defer showing text: */        color: transparent;      }      100% {        clip-path: circle(75%);        width: 100vw;        height: 100vh;      }    }        @keyframes morph_to_fill_screen {      0% {        color: transparent;        clip-path: circle(75%);      }      50% {        clip-path: circle(25%);        width: 7ch;        height: 7ch;        top: calc(50vh - 3.5ch);        left: calc(50vw - 3.5ch);      }      90% {        /* defer showing text: */        color: transparent;        position: fixed;      }      100% {        clip-path: circle(75%);        width: 100vw;        height: 100vh;        top: 0;        left: 0;      }    }        @keyframes show_children_after_morph {      0% {        visibility: collapse;        height: 0;        display: none;      }      90% {        visibility: collapse;        height: 0;        display: none;      }      100% {        visibility: visible;        height: auto;        display: block;      }    }        @keyframes revert_morph {      0% {        /* copy of 100% of morph: */        clip-path: circle(75%);        width: 100vw;        height: 100vh;        color: transparent;        top: 0;        left: 0;      }      10% {        /* defer showing text: */        color: transparent;        position: fixed;      }      50% {        clip-path: circle(25%);        width: 7ch;        height: 7ch;        top: calc(50vh - 3.5ch);        left: calc(50vw - 3.5ch);      }    }        .collapsed {      visibility: collapse;    }"),
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
        var i = e.style.left.replace("px", ""),
          o = e.style.top.replace("px", ""),
          a = Math.max(0, i - n),
          s = Math.max(0, o - r);
        (t.style.left = a + "px"), (t.style.top = s + "px");
      }
    },
    recreateText: function (e, t, n) {
      e = e || Slides.currentSlide;
      var r = Memory.getSlide(n).texts[t],
        i = r.text,
        o = r.left * Memory.getScaleForOriginalScreenSize(memory),
        a = r.top * Memory.getScaleForOriginalScreenSize(memory),
        s = r.id,
        l = r.textProps;
      this.createText(e, i, o, a, s, n, l);
    },
    createNewText: function (e, t, n, r, i) {
      if (
        ((e = e || Slides.currentSlide),
        (t = t || defaultText.text),
        (n = n || defaultText.left),
        (r = r || defaultText.top),
        !this.alreadyHasDefaultText())
      ) {
        var o = new Memory.Text(t);
        (o.left = n), (o.top = r), (o.slide = Memory.currentSlideIndex);
        var a = o.id;
        Memory.addTextToMemory(o, a, i),
          this.createText(e, t, n, r, a, Memory.currentSlideIndex, i),
          Slides.styleLeftRightButtons(),
          A11y.announce("Added new text.");
      }
    },
    createNewBigText: function (e, t, n, r) {
      (e = e || Slides.currentSlide),
        (t = t || defaultText.text),
        (n =
          n ||
          defaultText.left + defaultTextWidth / 2 - defaultTextWidthBig / 2),
        (r =
          r ||
          defaultText.top + defaultTextHeight / 2 - defaultTextHeightBig / 2);
      var i = { fontSize: defaultTextFontSizeBig + "px" };
      this.createNewText(e, t, n, r, i);
    },
    createText: function (e, t, n, r, i, o, a) {
      (e = e || Slides.currentSlide),
        (t = t || defaultText.text),
        (n = n || defaultText.left),
        (r = r || defaultText.top),
        (o = o || Memory.currentSlideIndex);
      var s = document.createElement("p");
      (s.innerText = t),
        (s.style.left = n + "px"),
        (s.style.top = r + "px"),
        (s.id = i),
        (s.style.boxShadow = "none"),
        (s.style.display = Memory.currentSlideIndex === o ? "block" : "none"),
        (s.tabIndex = 0),
        (s.ariaLabel = this.getAriaLabelFromTextElement(s)),
        (s.role = "textbox"),
        s.setAttribute("data-slide", o),
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
        var i = e.code || e.keyCode || e.which || window.event,
          o = "ArrowRight" === i || 39 === i,
          a = "ArrowDown" === i || 40 === i;
        "ArrowLeft" === i || 37 === i || "ArrowUp" === i || 38 === i
          ? this.left()
          : (o || a) && this.right();
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
