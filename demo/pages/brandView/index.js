const app = getApp();
const { get_url_parms_obj, joinParams, handlerLinkTrans, ossUrlTest } = require('../../utils/index');
let shareConfig = Object.assign({}, app.shareConfig);
const {
  $Toast
} = require('../../dist/base/index');
Page({
  data: {
    modules:[],
    page_id:'',
    searchParams:'',
    brand_name:'品牌官方',
    member_id: '',
    user_info: {},
    urlParams:{},
    optionsParams:{},
    uuid:'',
    toView:'',
    scrollHeight:'',
    isTopBtn:false
  },
  onLoad:function(params){
    //处理页面-找到 page_id
    var optionsParams = wx.getLaunchOptionsSync();
    let {uuid,member_id,store_id,apid}=params;
    
    // uuid = uuid|| 'f3c5defe-c26d-4f4b-a042-38422397f2d3';
    uuid=app.globalData.uuid;
    if (!uuid) {
      wx.showToast({
        title: "非法路径",
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if(!!store_id){
      wx.setStorage({
        key: 'store_id',
        data:store_id
      })
    }
 
    this.setData({
      uuid,
      urlParams: params,
      optionsParams
    })

    this.fetchPageByUuid(uuid);
    let _page={};
    let {page}=this.data;
    for(var key in page){
      _page[page[key]]=key;
    }
    this.data._page=_page;
    
    this.getUserInfo();
     //新粉注册判断登录显示;
    let showLoginModal = app.handleIsChk(params.isChk);
    this.setData({
       showLoginModal
     });
  },
  onShareAppMessage() {
    return shareConfig
  },
  onShow(){
    this.reportCont();
  },
  handleAp(){
    let { apid } = this.data.urlParams;
    if(!apid)return
    if (!!apid) {
      this.setData({
        toView: apid
      })
    }
  },
  get_confession({ currentTarget }) {
    if (!this.data.member_id) {
      $Toast({
        content: '请先登录'
      });
      this.setData({
        showLoginModal: true
      })
      return;
    }
    let { item = {} } = currentTarget.dataset;
    wx.navigateTo({
      url: `/packageActive/confessionView/index?cpns_id=${item.cpns_id}`
    })
  },
  updateShareConfig(){
    let { member_id, uuid, store_id, brand_name, urlParams}=this.data;

    shareConfig.title = `${brand_name}-${member_id}`;
    shareConfig.imageUrl = '';
    shareConfig.path = `pages/brandView/index?uuid=${uuid}&member_id=${member_id}&store_id=${store_id}&scene_id=${urlParams.scene_id}`;

  },
  fetchPageByUuid(uuid) {
    let vm = this
    
    wx.showLoading({
      title: '拼命加载中',
    })

    app.mall_api_get('/api/mobile/vstore/homePage/cors/' + uuid, {}, res => {
      wx.hideLoading();
      let _data = res.data.published_page;

      let { components, page_name} = _data;

      vm.setData({
        // modules: components,
        brand_name: page_name
      });
      vm.handlePageData(components);
      this.updateShareConfig();
    }, err => {
      vm.setData({
        modules: []
      });
    })
  },
  handlePageData(components) {
    let vm = this;
    components.forEach((item, index) => {
      item.data._componentsIndex = index;
      if (item.name == 'GoodslistModule' || (item.name == "Swiper3dModule" && item.data.type == 'goods3d')) {
        let goods_id = item.data.list;
        if (goods_id.length) {
          let options = {
            fq: `id:(${goods_id.join(' ')})`,
            core: 'yingerfashion',
            limit: goods_id.length 
          }
          this.getScrollGoodsData(options).then(res => {
            if (res.status == 'OK') {
              var _data = res.data;
              item.data.data = [];
              let arr = [];
              for (var i = 0; i < _data.length; i++) {
                let obj = _data[i];
                obj.m_url = obj.image_default ? ossUrlTest(obj.image_default[0]) : '';
                obj.img_search = false;
                obj.price = obj.price.toFixed(2);
                arr.push(obj);
              }
              let _key = `modules[${index}].data.data`;
              vm.setData({
                [_key]: arr,
              });
            }
          })
        }
      } else if (item.name == 'RichtextModule') {
        let _content = item.data.content;
        let _str = vm.richImgUrl(_content);
        item.data.content = _str
      } else if (item.name == 'VideoModule' && item.data.playInCurrentPage) {
        let arr = item.data.data;
        arr.map((video_item, video_index) => {
          this.fetchVideoSrc(video_item, video_index, index);
        })
      }
    });
    vm.setData({
      modules: components,
    });
    var timer = setTimeout(() => {
      vm.handleAp();
      clearTimeout(timer);
    }, 500)
  },
  richImgUrl(content) {
    let vm = this;
    let reg = /\/storage/ig;
    let reg2 = /img/ig;
    let regUrl = /https\:/ig;
    let str1 = content.replace(reg, function (url) {
      if (content.indexOf('https') != -1) {
        return url
      } else {
        return app.globalData.mall_host + url;
      }
    })
    let str2 = str1.replace(reg2, function (url2) {
      return url2 + ` class="width-100"`
    })
    return str2
  },
  getScrollGoodsData(options) {
    return new Promise((resolve, reject) => {
      app.mall_api_get('/api/mobile/Goods/getGoodsList/cors', options, (res) => {
        resolve(res);
      })
    }, err => {
      reject(err);
    })
  },
  startModalTime(){
    let vm=this;
    setTimeout(function(){
      let _time=vm.data.showModalTime;
      _time--;
      vm.setData({
        showModalTime:_time
      })
      if(_time>=0) vm.startModalTime();
    },1000)
  },
  brandSearchSubmit ({detail}) {
    let value = detail.value;
    let {uuid,brand_name} =this.data;
    
    wx.navigateTo({
      url: `/packageGoods/goodsListView/index?q=${encodeURIComponent(detail.value||'')}&fq=brand:"${encodeURIComponent(brand_name)}"&come_from=search`,
    })
  },
  randomTicket(event) {
    let vm = this;
    let fn = event.currentTarget.dataset.fn;
    if (!this.data.member_id) {
      $Toast({
        content: '请先登录'
      });
      vm.setData({
        showLoginModal: true
      })
      return;
    }
    let random_type = 0;
    random_type = fn.charAt(fn.length - 1);
    app.notokan_api_post('wap2.card.randomCoupons', {
      random_type,
      member_id: vm.data.member_id
    }, res => {
      if (res.rsp == 'succ' && res.data.coupon.length) {
        var item = res.data.coupon[0];
        vm.setData({
          total_amount: item.total_amount,
          showCouponModal: true
        })
      } else if (res.rsp == 'fail') {
        $Toast({
          content: `${res.data}`,
          type: 'warning'
        });
      }
    })
  },
  getRandomTicket(event) {
    //通用券 手气券
    let vm = this;
    let {
      index,
      data,
      indexs
    } = event.currentTarget.dataset;
    console.log("event", index, index, data);
    if (!this.data.member_id) {
      $Toast({
        content: '请先登录'
      });
      vm.setData({
        showLoginModal: true
      })
      return;
    }
    let fn = data.data[index].children[indexs].fn;
    let random_type = 0;
    random_type = fn.charAt(fn.length - 1);
    app.notokan_api_post('wap2.card.randomCoupons', {
      random_type,
      member_id: vm.data.member_id
    }, res => {
      if (res.rsp == 'succ' && res.data.coupon.length) {
        var item = res.data.coupon[0];
        vm.setData({
          total_amount: item.total_amount,
          showCouponModal: true
        })
      } else if (res.rsp == 'fail') {
        $Toast({
          content: `${res.data}`,
          type: 'warning'
        });
      }
    })
  },
  get_ticket(event) {
    var vm = this;
    let {
      index,
      // tabindex,
      componentindex
    } = event.currentTarget.dataset;
    if (!this.data.member_id) {
      $Toast({
        content: '请先登录'
      });
      vm.setData({
        showLoginModal: true
      })
      return;
    }
    var cpns_id = vm.data.modules[componentindex].data.tickets[index].id;
    var data = {
      cpns_id,
      scene: 1,
      member_id: this.data.member_id
    };
    wx.showLoading({
      title: '正在请求',
      mask: true
    })
    app.notokan_api_post("wap2.card.getCard", data, res => {
      wx.hideLoading();
      let _key = `modules[${componentindex}].data.tickets[${index}].isActive`;
      if (res.rsp == "succ") {
        wx.showToast({
          title: '领取成功',
          icon: 'success',
          duration: 2000
        })
        vm.setData({
          [_key]: true
        })
      } else if (res.data.msg == "当前用户已领取卡券") {
        wx.showToast({
          title: '已领取',
          icon: 'none',
          duration: 2000
        })
        vm.setData({
          [_key]: true
        })
      } else {
        if (!!res.data.msg) {
          $Toast({
            content: res.data.msg,
            type: 'error'
          });
        } else {
          $Toast({
            content: res.data,
            type: 'error'
          });
        }
      }

    }, error => {
      wx.hideLoading();
      wx.showToast({
        title: '网络出错',
        icon: 'none'
      })
    });
  },
  handleCancel() {
    this.setData({
      showLoginModal: false
    })
  },
  handleOk() {
    this.setData({
      showLoginModal: false
    })
    this.getUserInfo();
  },
  clickGoodsItem(e) {
    let vm = this;
    let { index, goodsid, soid } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/packageGoods/goodsDetailView/index?goods_id=${goodsid}&soid=${soid}`
    })
    //用户行为上报
    let obj = {
      action_list: [{
        action_type: "EXPOSE",
        action_time: parseInt(new Date().getTime() / 1000),
        action_param: {
          product_id: goodsid,
          positon: index + 1,
          source_id: soid,
          coupon_stock_id: ''
        }
      }]
    }
    let str = JSON.stringify(obj);
    app.reportUserAction(str);
  },
  getUserInfo() {
    let user_info = app.getLocalUserInfo();
    if (!!user_info && !!user_info.member_id) {
      let member_id = user_info.member_id || '';
      this.setData({
        member_id,
        user_info
      })
      this.updateShareConfig();
    }
  },
  selectVideo(e) {
    //视频跳转
    let {
      obj
    } = e.currentTarget.dataset;
    wx.setStorageSync('videoData', obj);
    wx.navigateTo({
      url: '/packageActive/videoPlay/index?video_id=' + obj.video_id,
    })
  },
  fetchVideoSrc(video_item, video_index, module_index) {
    let self = this;
    let video_id = video_item.video_id;
    app.mall_api_get("/api/video/getMezzanineInfo/" + video_id, {}, res => {
      if (res.status == 'success') {
        let _data = res.data;
        if (!_data.transcode.length) return;
        var reg = /http\:/;
        var obj = {};
        var img_obj = {};
        _data.transcode.forEach((item, index) => {
          let {
            file_url, format
          } = item;
          var _str = file_url.replace(reg, 'https:');
          //android 使用 mp4~
          if (format != "m3u8") {
            obj[item.definition] = {
              name: item.definition,
              url: _str,
              type: 'auto'
            };
          }
          let _quality = Object.keys(obj).map(key => { return obj[key] });
          let quality = _quality.sort(function (a, b) {
            if (a.type !== 'hls') return 1;
            return -1;
          });
          video_item.quality = quality;
          let _key = `modules[${module_index}].data.data[${video_index}]`;
          self.setData({
            [_key]: video_item,
          });
        })
      }
    })
  },
  goTop() {
    this.setData({
      scrollTop: 0
    })
  },
  scroll(e) {
    let { scrollTop } = e.detail;
    let isShow = scrollTop > 600;
    if (this.data.isTopBtn != isShow) {
      this.setData({
        isTopBtn: isShow
      })
    }
  },
  jumpUrl(event) {
    let { urlpath } = event.currentTarget.dataset;

    if (urlpath.type == 'tabbar') {
      wx.switchTab({
        url: urlpath.url
      })
    } else {
      wx.navigateTo({
        url: urlpath.url
      })
    }
  },
  jumpTo: function (e) {
    let target = e.currentTarget.dataset;
    // url 从悬浮按钮过来的是没转换过的，其他地方是转换过的
    // translateUrl 从悬浮按钮过来的是转换过的， 其他地方没有
    let { apid, url, translateUrl = ''}=target;
    // 跳转小程序
    if (/^navigateToMiniProgram/.test(url)) {
      let arr = url.split('|');
      wx.navigateToMiniProgram({
        appId: arr[1],
        path: arr[2] || '',
      })
      return;
    }
    // 跳转直播
    if (/^navigateToLivePlay/.test(url)) {
      let arr = url.split('|');
      wx.navigateTo({
        url: `/packageActive/livePlay/index?room_id=${arr[1]}${arr[2] ? '&' + arr[2] : ''}`,
      })
      return;
    }
    // 红包雨
    if (/redrainshow/.test(url)) {
      this.selectComponent("#redRain").openGame();
      return;
    }
    // 游戏跳转
    // http://mall.yingerfashion.com/yinger-m/yinger-game/MidAutumnGame/index.html
    if (/^http.*\/yinger-game\//.test(url)) {
      let game_type = url.split('/').splice(-2, 1);
      if (game_type.length) {
        game_type = game_type[0];
        wx.navigateTo({
          url: `/pages/game/drawLost?gameType=${game_type}`,
        })
      }      
      return;
    }
    // 发现中心tab跳转
    let reg =/discoveryView/g;
    let discoveUrl = reg.test(url);
    if (discoveUrl){
      let params = get_url_parms_obj(target.url);
      let url = target.url;
      app.globalData.tabbarParams[target.url] = params;
      wx.switchTab({
        url
      });
      return
    }
    if (translateUrl){
      wx.navigateTo({
        url: translateUrl
      })
    }else if (url){
      wx.navigateTo({ 
        url: url 
      })
    } else if (!!apid){
      this.setData({
        toView: apid
      })
    }
  },
  jumpGame(url) {
    console.log("url", url);
    let appType = url.charAt(url.length - 1);
    let appId = '';
    switch (appType) {
      case '1':
        appId = 'wx57bf25d3925ae163'
        break
      case '2':
        appId = 'wx57bf25d3925ae163'
        break
      case '3':
        appId = 'wx57bf25d3925ae163'
        break
    }
    if (!appId) return wx.showModal({
      title: "游戏ID不存在，请联系管理员"
    });
    wx.navigateToMiniProgram({
      appId,
      path: 'pages/index/index',
      envVersion: 'trial',
      success(res) {
        console.log("res", res);
      }
    })
  },
  reportCont(val) {
    //上传内容数据
    let { urlParams, member_id, optionsParams } = this.data;
    if (!urlParams) return;
    if (!urlParams.scene_id) return;
    let form = {};
    Object.keys(urlParams).map(key => {
      if (key == 'scene_type' || key == 'scene_id' || key == 'scene_relation') {
        form[key] = urlParams[key]
      }
    });
    if (!!optionsParams.query && !!optionsParams.query.appmsg_compact_url) {
      form['scene_url'] = optionsParams.query.appmsg_compact_url
    } else {
      form['scene_url'] = urlParams['scene_url'] || optionsParams.path
    }
    if (!!member_id) {
      form.member_id = member_id;
    }
    let scene_obj = wx.getStorageSync('scene_obj');
    if (!scene_obj) {
      form.browse_content_num = 1;
    } else if (!val && urlParams.scene_id != scene_obj.scene_id) {
      form.browse_content_num = 1;
    }
    wx.setStorageSync('scene_obj', form);
    form.browse_index_num = 1;
    app.reportContent(form);
  },
})
