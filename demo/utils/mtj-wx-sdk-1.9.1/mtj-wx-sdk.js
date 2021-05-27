var mtjwxsdk = function (e) {
  "use strict";
  var o, t, n, g = {
    logServerUrl: "https://hmma.baidu.com/mini.gif",
    circleServerUrl: "https://hmma.baidu.com/mini.gif?circle=1",
    maxRequestRetryCount: 5,
    requestRetryFirstDelay: 1e3,
    requestRetryMultiple: 4,
    maxRequestDataLength: 204800,
    maxUserPropertyCount: 100,
    maxUserPropertyKeyValueLength: 256,
    maxUint8: 255,
    maxUint32: 4294967295,
    enabledEvents: {
      app: ["onShow", "onHide", "onError"],
      page: ["onShow", "onHide"],
      share: [],
      behavior: ["tap"]
    },
    storageKeys: {
      uuid: "mtj_uuid",
      userInfo: "mtj_user",
      userProperty: "mtj_user_property",
      shareCount: "mtj_scnt"
    }
  },
    p = {
      type: 1
    },
    h = {
      aso: {}
    },
    r = {},
    a = function () {
      return "undefined" != typeof crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(
        1))[0] : Math.floor(Math.random() * g.maxUint32)
    },
    i = function (e, t) {
      return "[object " + t + "]" === {}.toString.call(e)
    },
    c = function n(r) {
      return (i(r, "Object") || i(r, "Array")) && Object.keys(r).forEach(function (e) {
        var t = r[e];
        i(t, "Object") || i(t, "Array") ? r[e] = n(t) : r[e] = "" + t
      }), r
    },
    s = function (e) {
      return i(e, "String") && /^\d{11}$/.test(e)
    },
    u = function (e) {
      return i(e, "String") && 28 === e.length
    },
    f = 0,
    l = function (r) {
      return new Promise(function (t, n) {
        if (r.data = r.data || {}, r.data.v = "1.9.1", r.data.rqc = ++f, e = r.data, !(JSON.stringify(
          e).length <= g.maxRequestDataLength)) return f-- , n(new Error("invalid data"));
        var e;
        r.success = function (e) {
          return t(e)
        }, r.fail = function (e) {
          return n(e)
        },
          function t(n) {
            var r = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : g.requestRetryFirstDelay;
            return o.request({
              url: n.url,
              data: n.data,
              header: Object.assign({
                "content-type": "application/json"
              }, n.header),
              method: n.method || "POST",
              dataType: n.dataType || "json",
              success: function (e) {
                delete n.data.rtc, n.success && n.success(e)
              },
              fail: function (e) {
                n.data.rtc = (n.data.rtc || 0) + 1, n.data.rtc <= g.maxRequestRetryCount ?
                  setTimeout(function () {
                    return t(n, r * g.requestRetryMultiple)
                  }, r) : (delete n.data.rtc, n.fail && n.fail(e))
              }
            })
          }(r)
      })
    },
    d = function (e, t) {
      var n = i(t, "Object") ? JSON.stringify(t) : "" + t;
      l({
        url: g.logServerUrl,
        dataType: "string",
        data: Object.assign({}, p, {
          et: "error",
          en: e,
          ep: {
            ex: n
          },
          rid: a()
        })
      })
    },
    y = function (e) {
      e.rid = a(), e.aso = e.aso || {};
      var t = {
        url: g.logServerUrl,
        dataType: "string",
        data: Object.assign({}, p, e)
      };
      l(t), (r.circleToken || r.circleByThreeFingers) && ("page" === e.et && "show" === e.en || "behavior" ===
        e.et && "tap" === e.en) && (t.url = g.circleServerUrl, t.data.token = r.circleToken, l(t).catch(
          function (e) {
            return console.error(e)
          }))
    },
    m = function (e) {
      try {
        return o.getStorageSync(e)
      } catch (e) {
        d("getStorageSync", e)
      }
    },
    v = function (e, t) {
      try {
        o.setStorageSync(e, t)
      } catch (e) {
        d("setStorageSync", e)
      }
    },
    b = function () {
      return Promise.resolve().then(function () {
        var e = m(g.storageKeys.uuid);
        return i(e, "String") && 32 === e.length || (e = ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(
          /[018]/g,
          function (e) {
            return (e ^ ("undefined" != typeof crypto && crypto.getRandomValues ?
              crypto.getRandomValues(new Uint8Array(1))[0] : Math.floor(Math.random() *
                g.maxUint8)) & 15 >> e / 4).toString(16)
          }), v(g.storageKeys.uuid, e)), e
      })
    },
    j = function () {
      return t || (p.sid = a(), p.rqc = 0, t = Promise.all([b(), new Promise(function (t) {
        o.getSystemInfo({
          success: function (e) {
            delete e.errMsg, t(e)
          },
          fail: function () {
            t({})
          }
        })
      }), new Promise(function (t) {
        o.getNetworkType({
          success: function (e) {
            delete e.errMsg, t(e)
          },
          fail: function () {
            t({})
          }
        })
      }), Promise.resolve().then(function () {
        var e = m(g.storageKeys.userInfo),
          n = i(e, "Object") ? e : {};
        return new Promise(function (t) {
          o.getSetting({
            success: function (e) {
              e.authSetting && e.authSetting["scope.userInfo"] ?
                o.getUserInfo({
                  success: function (e) {
                    delete e.userInfo.errMsg, t(
                      Object.assign(n, e.userInfo)
                    )
                  },
                  fail: function () {
                    t(n)
                  }
                }) : t(n)
            },
            fail: function () {
              t(n)
            }
          })
        })
      }), new Promise(function (t) {
        if (!g.getLocation) return t({});
        o.getLocation({
          type: "wgs84",
          success: function (e) {
            delete e.errMsg, t(e)
          },
          fail: function () {
            t({})
          }
        })
      }), Promise.resolve().then(function () {
        var e = m(g.storageKeys.userProperty);
        return i(e, "Object") ? e : {}
      })]).then(function (e) {
        p.uuid = e[0], h.system = c(e[1]), h.network = c(e[2]), 0 < Object.keys(e[3]).length &&
          (h.user = c(e[3])), 0 < Object.keys(e[4]).length && (h.location = c(e[4])), 0 <
          Object.keys(e[5]).length && (h.userProperty = JSON.stringify(e[5])), h.system.platform
      }))
    },
    S = function () {
      return n || (n = new Promise(function (t) {
        o.getClipboardData({
          success: function (e) {
            t(e.data)
          },
          fail: function () {
            t()
          }
        })
      }).then(function (e) {
        if (!g.disableCircling && 36 === e.length) {
          var t, n = e.match(/^mtj_(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})$/);
          return n ? (r.circleToken = "".concat(n[1], "-").concat(n[2], "-").concat(n[3], "-")
            .concat(n[4], "-").concat(n[5]), t = "", new Promise(function (e) {
              o.setClipboardData({
                data: t,
                complete: function () {
                  e()
                }
              })
            })) : void 0
        }
      }))
    },
    O = {
      onLaunch: function () {
        y({
          et: "app",
          en: "launch"
        })
      },
      onShow: function () {
        var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {};
        return h.aso.scene = "" + (t.scene || ""), t.referrerInfo && t.referrerInfo.appId ? h.aso.referrerInfo =
          t.referrerInfo : delete h.aso.referrerInfo, h.aso.path = t.path || "", h.aso.query = Object
            .keys(t.query || {}).map(function (e) {
              return {
                key: e,
                value: t.query[e]
              }
            }), j().then(function () {
              return e = t.shareTicket, new Promise(function (t) {
                if (!e) return t();
                o.getShareInfo({
                  shareTicket: e,
                  success: function (e) {
                    delete e.errMsg, t(e)
                  },
                  fail: function () {
                    t({})
                  }
                })
              });
              var e
            }).then(function (e) {
              e ? h.aso.shareInfo = e : delete h.aso.shareInfo, y(Object.assign({
                et: "app",
                en: "show"
              }, h))
            }).catch(function (e) {
              d("app.onShow", e)
            })
      },
      onHide: function () {
        n = null, y({
          et: "app",
          en: "hide"
        })
      },
      onError: function (e) {
        var t = i(e, "Object") ? JSON.stringify(c(e)) : "" + e;
        y({
          et: "app",
          en: "error",
          ep: {
            ex: t
          }
        })
      }
    },
    P = -1,
    k = -1,
    w = 0,
    I = {
      onShow: function () {
        var e = getCurrentPages(),
          t = e[e.length - 1];
        return p.path = t.route, p.query = Object.keys(t.options).map(function (e) {
          return {
            key: e,
            value: t.options[e]
          }
        }).filter(function (e) {
          return "mtj_qrid" !== e.key && "mtj_lkid" !== e.key && "mtj_shuuid" !== e.key
        }), S().then(j).then(function () {
          y(Object.assign({
            et: "page",
            en: "show"
          }, h))
        }).catch(function (e) {
          d("page.onShow", e)
        })
      },
      onHide: function () {
        var e;
        y({
          et: "page",
          en: "hide",
          ep: e
        })
      },
      onAction: function (e, t) {
        if (e && e.type && e.currentTarget)
          if ("tap" !== e.type) {
            if ("touchmove" === e.type && e.touches instanceof Array) {
              if (-1 !== P) return;
              if (3 === e.touches.length) {
                if (w += 1, clearTimeout(k), 3 === w) return r.circleByThreeFingers = !0, r.circleToken =
                  void 0, void y(Object.assign({
                    et: "page",
                    en: "show"
                  }, h));
                P = setTimeout(function () {
                  P = -1, k = setTimeout(function () {
                    w = 0
                  }, 500)
                }, 1e3)
              }
            }
          } else {
            var n = [{
              key: "xpath",
              value: "#" + (e.currentTarget.id || t)
            }];
            y(Object.assign({
              et: "behavior",
              en: "tap",
              ep: {
                data: n
              }
            }, h))
          }
      }
    },
    x = {
      trackEvent: function (e) {
        var t, r = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {};
        if (!i(t = e, "String") || !/^[a-z][a-z0-9_]{0,31}$/.test(t)) return Promise.reject(new Error(
          "事件名称不合法"));
        var n = Object.keys(r).filter(function (e) {
          return i(n = e, "String") && /^[a-z0-9_]{1,32}$/.test(n) && (t = r[e], i(t,
            "String") || i(t, "Number"));
          var t, n
        }).map(function (e) {
          return {
            key: "" + e,
            value: "" + r[e],
            type: i(r[e], "String") ? "string" : "number"
          }
        });
        return j().then(function () {
          y(Object.assign({
            et: "event",
            en: "" + e,
            ep: {
              data: n
            }
          }, h))
        }).catch(function (e) {
          d("trackEvent", e)
        })
      },
      setUserInfo: function () {
        var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {},
          n = e.tel,
          r = e.openId;
        return j().then(function () {
          var e = m(g.storageKeys.userInfo),
            t = i(e, "Object") ? e : {};
          s(n) && (t.tel = h.user.tel = n.substr(n.length - 11)), u(r) && (t.openId = h.user.openId =
            r), (t.tel || t.openId) && v(g.storageKeys.userInfo, t), i(n, "Undefined") ||
            s(n) || console.error("手机号 ".concat(n, " 不合法")), i(r, "Undefined") || u(r) ||
            console.error("openid ".concat(r, " 不合法"))
        }).catch(function (e) {
          d("setUserInfo", e)
        })
      },
      setUserId: function (o) {
        return Promise.resolve().then(function () {
          if (!(i(o, "String") || i(o, "Number") && Number.isFinite(o))) return Promise.reject(
            new Error("userId只能是字符串或数字"));
          var e = "" + o,
            t = m(g.storageKeys.userProperty),
            n = i(t, "Object") ? t : {};
          if (!n.uid_ || n.uid_[0] !== e) {
            n.uid_ = [e, "1"], v(g.storageKeys.userProperty, n), h.userProperty = JSON.stringify(
              n);
            var r = [{
              key: "uid",
              value: e
            }];
            return j().then(function () {
              y(Object.assign({
                et: "api",
                en: "setUserId",
                ep: {
                  data: r
                }
              }, h))
            }).catch(function (e) {
              d("setUserId", e)
            })
          }
        })
      },
      setUserProperty: function (o) {
        return Promise.resolve().then(function () {
          var e = m(g.storageKeys.userProperty),
            n = i(e, "Object") ? e : {};
          if (i(o, "Null")) Object.keys(n).forEach(function (e) {
            "_" !== e.charAt(0) && "_" !== e.charAt(e.length - 1) && delete n[e]
          });
          else if (!i(o, "Object")) return Promise.reject(new Error("userProperty必须是对象"));
          var r = Object.keys(n).filter(function (e) {
            return "_" !== e.charAt(0) && "_" !== e.charAt(e.length - 1)
          }).length;
          Object.keys(o || {}).forEach(function (e) {
            var t = o[e];
            "" !== e && "_" !== e.charAt(0) && "_" !== e.charAt(e.length - 1) && (i(
              t, "Null") ? n[e] && (delete n[e], r--) : !(i(t, "String") ||
                i(t, "Number") && Number.isFinite(t)) || e.length > g.maxUserPropertyKeyValueLength ||
              ("" + t).length > g.maxUserPropertyKeyValueLength || !n[e] && r >=
              g.maxUserPropertyCount || (n[e] || r++ , n[e] = [t, "1"]))
          }), v(g.storageKeys.userProperty, n), h.userProperty = JSON.stringify(n)
        })
      }
    },
    U = App,
    _ = Page,
    E = function (t, e, n) {
      var r = e[t];
      e[t] = function (e) {
        if (n.call(this, e, t), r) return r.apply(this, arguments)
      }
    },
    T = function (t) {
      g.enabledEvents.app.forEach(function (e) {
        E(e, t, O[e])
      }), t.mtj = x, U(t)
    },
    q = function (a) {
      g.enabledEvents.page.forEach(function (e) {
        E(e, a, I[e])
      }), g.enabledEvents.share.forEach(function (e) {
        var t, n, r, o;
        r = I[t = e], o = (n = a)[t], n[t] = function (e) {
          var t = o && o.apply(this, arguments);
          return r.call(this, e, t)
        }
      }), Object.keys(a).forEach(function (e) {
        "function" == typeof a[e] && -1 === g.enabledEvents.page.indexOf(e) && -1 === g.enabledEvents
          .share.indexOf(e) && E(e, a, I.onAction)
      }), _(a)
    },
    K = function () {
      var e, t;
      e = wx, o = e;
      try {
        t = require("./mtj-wx-sdk.config")
      } catch (e) {
        return void console.error("请把mtj-wx-sdk.config.js文件拷贝到utils目录中")
      }
      t && t.appKey ? (p.key = t.appKey, g.getLocation = t.getLocation || !1, g.disableCircling = t.disableCircling ||
        !1, t.hasPlugin ? module.exports = {
          App: T,
          Page: q
        } : (App = T, Page = q)) : console.error("请设置mtj-wx-sdk.config.js文件中的appKey字段")
    };
  return K(), e.init = K, e
}({});