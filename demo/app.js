//app.js
const mtjwxsdk = require('./utils/mtj-wx-sdk-1.9.1/mtj-wx-sdk.js');
const api_auth = require('./utils/auth.js').api_auth;
const Base64 = require('./miniprogram_npm/js-base64/index').Base64;
import { jump } from './utils/index.js'
import Cookie from './utils/cookie.js';
App({
  onLaunch: function () {
    // 双十一活动时间判断，更换主题用，过期可删
    // const start = '2019-11-02 00:00:00'; 1572624000000
    // const end = '2019-11-13 00:00:00';1573574400000
    this.globalData.$doubleEleven = Date.now() > 1572624000000 && Date.now() < 1573574400000;
    // 展示本地存储能力
    let vm = this;
    // 登录
    wx.login({
      success: res => {
        if (res.errMsg == "login:ok") {
          vm.globalData.code = res.code;
          // vm.getOpenId(res.code);
        }
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    this.getLocalUserInfo();
    vm.getSetting();

    /**
     * 清理缓存功能
     */
    var storage = wx.getStorageInfoSync().keys;
    storage.forEach((item, index) => {
      var res = /(user|store|login|selGoodsList|cart_data|videoData|search_history|auth|refund|showModalTime|vstore|listStyle|wx_modal_guide|components|lastShowModalTime|wx_userinfo_update_date|chat_socket_storage)\w*/.test(item);
      if (!res) {
        wx.removeStorageSync(item)
      }
    })
    //用户行为上报-进入小程序
    let obj = {
      action_list: [{
        action_type: "INIT",
        action_time: parseInt(new Date().getTime() / 1000),
        action_param: {}
      }]
    }
    let str = JSON.stringify(obj);
    this.reportUserAction(str);
    if (!wx.getStorageSync('userOpenTime')) {
      wx.setStorageSync('userOpenTime', parseInt(new Date().getTime()))
    }
  },
  onError(err) {
    try {
      let err_arr = err.split('\n');
      let systemInfo = wx.getSystemInfoSync();
      let {
        version,
        platform,
        system,
        SDKVersion,
        brand,
        model
      } = systemInfo;
      if (platform == 'devtools') return;
      let url_str = err_arr[1];
      let url = '';
      if (/at \"(\w*\D+)"/.test(url_str)) {
        url = RegExp.$1;
      }
      wx.request({
        url: 'https://pottle.cn/openApi/app/bugReport',
        method: 'POST',
        data: {
          url,
          type: err_arr[0],
          error: err_arr[1],
          content: err,
          version,
          platform: 3,
          agent: JSON.stringify(systemInfo),
          os: system,
          browser_type: platform,
          browser_version: SDKVersion,
          device: brand + ':' + model
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log(res.data)
        }
      })
    } catch (err) {

    }

  },
  myJsTool: function (val) {
    var page = {
      'festivalView': '/packageActive/festivalView/index',
      'catListView': '/packageGoods/goodsListView/index',
      'topicDetailView': '/packageActive/pageDetail/index',
      'brandView': '/packageActive/brandView/index',
      'detailView': '/packageGoods/goodsDetailView/index',
      'good-detail.html': '/packageGoods/goodsDetailView/index',
      'flashSaleView': '/packageActive/flashSaleView/index',
      'category': '/pages/cat/index',
      'index': '/pages/index/index',
      'personalDetails': '/packageCommunity/PersonalDetails/index',
      'discoveryView': '/pages/discoveryView/index',
      'loginView': '/pages/loginByMsg/index',
      'newPreferentialView': '/packageActive/newPreferentialView/index',
      'girlfriendsTicket': '/packageActive/girlfriendsTicket/index',
      'undefined': '/pages/index/index',
      'homeView': '/pages/index/index'
    }
    var params = {};
    var jump_url = '';
    if (val == "#" || val == null) return;
    var arr = val.split('/');
    var _url = arr[arr.length - 1];
    var page_url = _url.split('?');

    if (!!page[page_url[0]]) {
      var params_str = (page_url.length > 1 ? "?" + page_url[1] : '');
      jump_url = page[page_url[0]] + params_str;

    } else {
      jump_url = val || '/pages/index/index';
    }
    return jump_url;
  },
  reportUserAction: function (action) {
    const openid = wx.getStorageSync('openid');
    if (!openid) return;
    let reg = /undefined/ig;
    let str = action.replace(reg, '浏览');
    this.notokan_api_post('wisdom.reportUserAction', {
      api_account: 'yingers',
      api_password: 'yingers123',
      scene: 'MOBILE',
      store_id: '500001',
      action_source: 'MINI_PROGRAM',
      openid: openid,
      action_list: str,
      source_type: 'MINI_PROGRAM',
      version_id: 'wechat-2'
    }, res => {
      console.log("行为上报结果:", res);
    })
  },
  burySharePoint: function (data) {
    let user_info = wx.getStorageSync('user_info');
    data.member_id = user_info ? user_info.member_id : '';
    this.mall_api_post('/api/goods/collectData/cors', data, res => {
      console.log("分享商品", res)
    })
  },
  reportContent: function (data) {
    let self = this;
    if (!!data.browse_content_num) {
      let openid = wx.getStorageSync('openid');
      if (openid) {
        data.openid = openid;
        data.openid_type = "yinger_wxapplet"
      }
      self.reportCont(data);
    } else {
      self.reportCont(data);
    }
  },
  reportCont: function (data) {
    this.mall_api_post('/api/goods/reportContentGoodsData/cors', data, res => {
      console.log("上报内容结果", res)
    })
  },
  reportNewMember(pageUrl, member_id, scene_id, share_member_id) {
    //记录首页、模板、文章、视频页面、新注册会员上报
    let obj = {};
    obj.member_id = member_id;//
    obj.scene_type = "ec_register";
    obj.scene_url = pageUrl || '';
    obj.scene_id = scene_id || "2002031421886";
    obj.register_num = "1";
    obj.share_member_id = share_member_id || '';
    obj.scene_relation = "";
    console.log("reportNewMember", obj);
    this.reportCont(obj);
  },
  collectSearchKeyword: function (data) {
    this.mall_api_post('/api/goods/collectSearchKeyword/cors', data, res => {
      console.log("上报搜索结果", res)
    })
  },
  getOpenId: function (code) {
    let vm = this;
    this.post('/index.php/miniprogram/default/getWxToken', {
      code: code
    }, function (res) {
      if (!res || res.code == 400) {
        wx.showToast({
          title: `openid error1.`,
          icon: 'none',
          duration: 2000
        })
      } else if (res.openid) {
        vm.globalData.openid = res.openid;
        vm.globalData.unionid = res.unionid || '';
        wx.setStorageSync('openid', res.openid);
        vm.updateWxUserInfo();
      } else if (res.errcode != 0) {
        /**
         * errcode 的合法值
            -1	系统繁忙，此时请开发者稍候再试
            0	请求成功
            40029	code 无效
            45011	频率限制，每个用户每分钟100次
         */
        wx.showToast({
          title: `openid error2: ${res.errcode}`,
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.showToast({
          title: `openid error3.`,
          icon: 'none',
          duration: 2000
        })
      }
    });
  },
  getSetting: function () {
    // 获取用户信息
    let vm = this;
    wx.getSetting({
      success: res => {
        //查看授权
        if (res.authSetting['scope.userInfo'] == true) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: function (res) {
              if (res.errMsg == "getUserInfo:ok") {
                vm.globalData.wxInfo = res.userInfo;
                vm.updateWxUserInfo();
              }
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回,此处加入 callback 以防止这种情况
              if (vm.asyncUpdateUserInfo) {
                vm.asyncUpdateUserInfo(res);
              }
            }
          })
        } else {
          //授权获取用户信息
          wx.setStorageSync('wxUserinfoAuth', true);
          if (vm.wxUserinfoAuthSync) {
            vm.wxUserinfoAuthSync();
          }
        }
      }
    })
  },
  updateWxUserInfo() {
    let {
      userInfo,
      wxInfo,
      openid
    } = this.globalData;

    if (!openid || !wxInfo) return;
    let params = {
      api_account: 'yingers',
      api_password: 'yingers123',
      openId: openid,
      unionId: this.globalData.unionid || '',
      ...wxInfo,
    }
    if (userInfo && userInfo.member_id) params.member_id = userInfo.member_id;
    let dateObj = wx.getStorageSync('wx_userinfo_update_date') || {
      date: 0,
      params: ''
    };
    // 三天以内若信息不变则不重复更新
    if (Date.now() - dateObj.date > 3 * 24 * 3600 * 1000 || dateObj.params != JSON.stringify(params)) {
      this.post('/index.php/miniprogram/default/userInfo', params, res => {
        if (res.code == 200) {
          wx.setStorageSync('wx_userinfo_update_date', {
            date: Date.now(),
            params: JSON.stringify(params)
          });
        }
      });
    }
  },
  setStoreId(store_id) {
    if (this.globalData.store_login) return;
    wx.setStorageSync('store_id', store_id);
  },
  /* **
   * 承上，只有登录者没有开通微店才可以设置storage里的store_id字段，
   * 否则storage里的store_id和globalData的store_id保持一致（即登录者的store_id）
   * **
   * 启下，登录者没有开通微店则globalData里的store_id字段为空
   * **
   */
  getLocalUserInfo() {
    let vm = this;
    const user_info = wx.getStorageSync('user_info');
    if (!!user_info && typeof user_info == 'object') {
      this.globalData.userInfo = user_info;
      this.globalData.member_id = user_info.member_id;
      const store_info = wx.getStorageSync('store_info');
      if (store_info && (store_info.store_id)) {
        this.globalData.store_login = true;
        this.globalData.store_id = store_info.store_id;
      } else {
        this.tokan_api_post('vstore.store.detail', {
          store_id: user_info.member_id
        }, (res) => {
          if (res.rsp == 'succ' && res.data.items.status) {
            let store_info = res.data.items;
            if (vm.asyncUpdateStoreInfo) vm.asyncUpdateStoreInfo(store_info);
            this.globalData.store_login = true;
            wx.setStorageSync('store_info', store_info);
            vm.globalData.store_id = user_info.member_id;
            wx.setStorageSync('store_id', user_info.member_id);
          } else {
            this.globalData.store_login = false;
            vm.globalData.store_id = '';
            if (vm.asyncUpdateStoreInfo) vm.asyncUpdateStoreInfo({});
          }
        });
      }
      return user_info;
    } else {
      return null;
    }
  },
  /******************* http 公用方法 ********************/
  get: function (url, params, callback, failCallback) {
    wx.request({
      url: url,
      data: params,
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (!!callback) callback(res.data);
      },
      fail: function (res) {
        if (!!failCallback) failCallback(res);
      }
    })
  },
  post: function (url, params, callback, failCallback) {
    wx.request({
      url: this.globalData.host + url,
      data: params,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        callback(res.data);
      },
      fail: function (res) {
        if (!!failCallback) failCallback(res);
      }
    })
  },
  notokan_api_post: function (api, params, callback, failCallback) {
    var str = '';
    params.api_account = "yingers";
    params.api_password = "yingers123";
    let _cookie = wx.getStorageSync('cookieKey');
    let cookie_str = '';
    let _arr = [];
    for (var key in _cookie) {
      _arr.push(_cookie[key])
    }
    // cookie_str = Object.values(_cookie).join(',');
    cookie_str = _arr.join(',');

    let header = {
      "TOVERYKEY": '1',
      'content-type': 'application/json'
    };
    if (_cookie) {
      header.Cookie = cookie_str;
    }
    wx.request({
      url: this.globalData.host + '/index.php/api?method=' + api,
      data: params,
      method: 'POST',
      header,
      success: function (res) {
        let {
          data,
          header
        } = res;
        if (header && header['Set-Cookie']) {
          let cookie = header['Set-Cookie'] || header['set-cookie'];
          let cookieArr = cookie.split(',');
          let cookieObj = {};
          cookieArr.forEach((item, index) => {
            let _key = item.split(";")[0].split("=");
            let key = _key.length ? _key[0].trim() : new Date().getTime();
            cookieObj[key] = item;
          })
          //取出
          let _cookie = wx.getStorageSync('cookieKey');
          if (typeof _cookie == 'string') {
            _cookie = {};
          }
          _cookie = Object.assign(_cookie, cookieObj);
          wx.setStorageSync('cookieKey', _cookie);
        }
        if (!!callback) callback(res.data);
      },
      fail: function (res) {
        if (!!failCallback) failCallback(res);
      }
    })
  },
  pay_notokan_api_post: function (api, params, callback, failCallback) {
    var str = '';
    params.api_account = "yingers";
    params.api_password = "yingers123";

    wx.request({
      url: this.globalData.host + '/index.php/api?method=' + api,
      data: params,
      method: 'POST',
      header: {
        "TOVERYKEY": '1',
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (!!callback) callback(res.data);
      },
      fail: function (res) {
        if (!!failCallback) failCallback(res);
      }
    })
  },
  tokan_api_post: function (api, data, callback, failCallback) {
    let vm = this;
    var params_str = '';
    for (var key in data) {
      params_str += key + '=' + data[key] + "&";
    }

    params_str = encodeURI(params_str.slice(0, -1));

    let _cookie = wx.getStorageSync('cookieKey');
    let cookie_str = '';
    let _arr = [];
    for (var key in _cookie) {
      _arr.push(_cookie[key])
    }
    // cookie_str = Object.values(_cookie).join(',');
    cookie_str = _arr.join(',');
    let header = {
      "TOVERYKEY": '1',
      'content-type': 'application/json'
    };
    if (_cookie) {
      header.Cookie = cookie_str;
    }
    wx.request({
      url: this.globalData.host + '/yingers/tokans/tokan.php?method=' + api + "&" + params_str,
      data: {},
      method: 'POST',
      header,
      success: function (res1) {
        var _data = encodeURI(res1.data);
        let _cookie = wx.getStorageSync('cookieKey');
        let cookie_str = '';
        let _arr = [];
        for (var key in _cookie) {
          _arr.push(_cookie[key])
        }
        // cookie_str = Object.values(_cookie).join(',');
        cookie_str = _arr.join(',');
        let header = {
          "TOVERYKEY": '1',
          'content-type': 'application/json'
        };
        if (_cookie) {
          header.Cookie = cookie_str;
        }

        wx.request({
          url: vm.globalData.host + '/index.php/api?' + _data,
          data: {},
          method: 'POST',
          header,
          success: function (res2) {
            let {
              data,
              header
            } = res2;
            if (header && header['Set-Cookie']) {
              let cookie = header['Set-Cookie'] || header['set-cookie'];
              let cookieArr = cookie.split(',');
              let cookieObj = {};
              cookieArr.forEach((item, index) => {
                let _key = item.split(";")[0].split("=");
                let key = _key.length ? _key[0].trim() : new Date().getTime();
                cookieObj[key] = item;
              })
              //取出
              let _cookie = wx.getStorageSync('cookieKey');
              if (typeof _cookie == 'string') {
                _cookie = {};
              }
              _cookie = Object.assign(_cookie, cookieObj);
              wx.setStorageSync('cookieKey', _cookie);
            }
            if (!!callback) callback(data);
          },
          fail: function (res2) {
            if (!!failCallback) failCallback(res2);
          }
        })
        // callback(res1.data);
      },
      fail: function (res1) {
        if (!!failCallback) failCallback(res1);
      }
    })
  },
  mall_api_get: function (api, params, callback, failCallback) {
    let vstore_info = wx.getStorageSync('vstore_user_info');
    let access_token = !!vstore_info ? vstore_info.access_token : '';
    let config = {
      url: api,
      params
    }
    const sign = api_auth('get', config);

    wx.request({
      url: `${this.globalData.mall_host}${api}?${sign.url}`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${access_token}`
      },
      success: function (res) {
        if (callback) callback(res.data);
      },
      fail: (e) => {
        failCallback && failCallback(e)
      }
    })
  },
  mall_api_delete: function (api, params, callback, failCallback) {
    let vstore_info = wx.getStorageSync('vstore_user_info');
    let access_token = !!vstore_info ? vstore_info.access_token : '';
    let config = {
      url: `${api}/${params.id}`,
      params
    }
    const sign = api_auth('delete', config);
    wx.request({
      url: `${this.globalData.mall_host}${config.url}?${sign.url}`,
      method: 'DELETE',
      header: {
        'content-type': 'application/json', // 默认值
        Authorization: `Bearer ${access_token}`
      },
      success: function (res) {
        if (callback) callback(res.data);
      },
      fail: function (res) {
        if (!!failCallback) failCallback(res);
      }
    })
  },
  mall_api_post: function (api, params, callback, failCallback) {
    let vstore_info = wx.getStorageSync('vstore_user_info');
    let access_token = !!vstore_info ? vstore_info.access_token : '';
    let config = {
      url: api,
      params
    }
    const sign = api_auth('post', config);
    let header = {
      "TOVERYKEY": '1',
      'content-type': 'application/json', // 默认值
      Authorization: `Bearer ${access_token}`
    }

    wx.request({
      url: this.globalData.mall_host + api,
      data: sign.data,
      method: 'POST',
      header,
      success: function (res) {
        callback(res.data);
      },
      fail: function (res) {
        if (!!failCallback) failCallback(res);
      }
    })
  },
  mall_api_put: function (api, params, callback, failCallback) {
    let vstore_info = wx.getStorageSync('vstore_user_info');
    let access_token = vstore_info ? vstore_info.access_token : '';
    let config = {
      url: `${api}${params.id}`,
      params
    }
    const sign = api_auth('put', config);
    wx.request({
      url: `${this.globalData.mall_host}${sign.url}`,
      data: sign.data,
      method: 'put',
      header: {
        'content-type': 'application/json', // 默认值
        Authorization: `Bearer ${access_token}`
      },
      success: function (res) {
        callback(res.data)
      },
      fail: function (res) {
        if (!!failCallback) failCallback(res);
      }
    })
  },
  solr_server_search: function (callback, failCallback) {
    const username = "client";
    const password = "Vi1ekCfAJXr1GGfLtRUXhgrF8c=";//Vi1ekCfAJXr1GGfLtRUXhgrF8c=
    const credentials = Base64.encode(`${username}:${password}`);
    wx.request({
      url: 'https://search.winnermedical.com/solr/mall/select?q=*:*',
      method: 'get',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        "Authorization": `Basic ${credentials}`
      },
      success: function (res) {
        callback(res.data)
      },
      fail: function (res) {
        if (!!failCallback) failCallback(res);
      }
    })
  },
  get_dlcorp(cb) {
    let cache_dlcorp = wx.getStorageSync('cache_dlcorp');
    if (cache_dlcorp.length > 0) {
      let format_data = this.format_dlcorp(cache_dlcorp);
      cb && cb(cache_dlcorp, format_data)
    } else {
      this.notokan_api_post('mobileapi.aftersales.get_dlcorp', {}, res => {
        if (res.rsp == 'succ') {
          const data = res.data;
          wx.setStorageSync('cache_dlcorp', data);
          let format_data = this.format_dlcorp(data);
          cb && cb(data, format_data);
        }
      })
    }

  },
  format_dlcorp: (data) => {
    let providers = [];
    for (let i = 0; i < data.length; i++) {
      let obj = {
        key: Number(data[i].corp_id),
        value: data[i].name
      }
      providers.push(obj);
    }
    return providers;
  },
  setWatcher(data, watch) {
    Object.keys(watch).forEach(v => {
      let key = v.split('.');
      let nowData = data;
      for (var i = 0; i < key.length - 1; i++) {
        nowData = nowData[key[i]];
      }
      let lastKey = key[key.length - 1];
      this.observe(nowData, lastKey, watch[v]);
    })
  },
  observe(obj, key, watchFun) {
    var val = obj[key]; // 给该属性设默认值
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        val = value;
        watchFun(value, val); // 赋值(set)时，调用对应函数
      },
      get: function () {
        return val;
      }
    })
  },
  handleIsChk(isChk = null) {
    //没有isChk并未登录的显示弹窗
    let user_info = this.getLocalUserInfo();
    if (!!isChk && isChk == 1 && !user_info) {
      return true;
    } else {
      return false;
    }
  },
  reg_mobile: (phone) => {
    return /^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)
  },
  regEn: (str) => {
    return /[`~!@#$%^&*()_+<>?:"{}\/;'[\]]/im.test(str)
  },
  regCn: (str) => {
    return /[！#￥（——）：；“”‘、|《。》？、【】[\]]/im.test(str)
  },
  globalData: {
    test: 'https://mall.yingerfashion.com',
    host: 'https://mall.yingerfashion.com',
    mall_host: 'https://zone.yingerfashion.com',
    // mall_host:'https://dev.makings.link',
    image_host: 'https://mall.yingerfashion.com',
    wxInfo: null,
    userInfo: null,
    member_id: '',
    store_login: false, //是否微店主
    store_id: '',
    openid: '',
    default_img: 'https://zone.yingerfashion.com/images/defaultImages/404@320_320.jpg',
    img_404: 'http://mall.yingerfashion.com//yinger-m/app/images/404/404@160_160.jpg',
    tabbarParams: {}, // 用于tabbar切换时传参
    redPacketState: null, // 记录红包雨数据
    CodeCheck: true,     // 验证码校验
    // robotHost: 'robot.yingerfashion.com', // 不要加协议头，https和ws都有用到
    robotHost: 'robottest.yingerfashion.com',
    appid:'wxb8fa18d9cbae3072', // wxb8fa18d9cbae3072
    uuid:'f3c5def2-c26d-4f4b-a042-38422397f2d4',
    shopName:'影儿松江开元店',
    roomid:''
  },
  shareConfig: {
    title: '影儿商城',
    path: '/pages/index/index',
    imageUrl: 'https://mall.yingerfashion.com/public/files/miniProgram/c71aba0550663ae2cd5aac6b1ef2f8ec1777ef49.png'
  }
})