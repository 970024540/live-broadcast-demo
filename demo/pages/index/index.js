const app = getApp();
let shareConfig = Object.assign({}, app.shareConfig);
const {
  brand2PageId
} = require('../../config/index');
const {
  $Toast
} = require('../../dist/base/index');
const {
  get_url_parms_obj,
  joinParams,
  handlerLinkTrans,
  parseOptions,
  ossUrlTest,
  hide_phoneNo
} = require('../../utils/index');

Page({

  /**
   * 页面的初始数据
   */
  observer_request_option: {
    // [tabIndex]: {
    //   observerListCount: 0,// 需要监听的组件个数， 等于0时会取消监听
    //   [index]: options, // 请求选项
    // }
  }, // 用于observer, 格式如上
  data: {
    toView:'',
    width: 375,
    member_id: '',
    swiperItemPB:80, // swiper 底部高度
    urlParams: {},
    wxInfo: {},
    hasWxInfo: false,
    showUserInfoModal: false,
    showGuide: false,
    showLoginModal: false,//显示登录弹窗
    showCouponModal: false,
    total_amount: 0,
    bars: [],
    suffix: 0,
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 300,
    currentIndex:0,
    currentId:'',
    loading:false,
    goodsGroupsuffix:0,
    optionsParams: {},
    scrollTop:0,
    swiperMBar:{},
    isTopBtn:false,
    floatData:{},//悬浮按钮Data
    isSearh:false, // 顶部搜索栏
    tabSettingData:{}, // 顶部搜索栏以及顶部tab样式数据
    inputValue:'', // 搜索栏默认数据
    brandStickyData: {}, //吸顶专区栏数据
    isTopSearch:true, // 顶部搜索栏
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var optionsParams = wx.getLaunchOptionsSync();
    this.setData({
      urlParams: options,
      optionsParams
    })
    let params = parseOptions(options);
    if (options.type == 'scene') {
      params.store_id = params.mid;
    }
    if (options.suffix){
      this.setData({
        suffix: options.suffix
      })
    }
    if (params.store_id) {
      wx.setStorage({
        key: 'store_id',
        data: params.store_id
      })
    }
    this.fetchIndexTab();
    /************ 程序启动 *************/
    if (app.globalData.wxInfo) {
      this.data.wxInfo = app.globalData.wxInfo,
      this.data.hasWxInfo = true;
    }
    /*********** 监测授权异步更新 *************/
    app.asyncUpdateUserInfo = res => {
      this.data.wxInfo = res.userInfo,
      this.data.hasWxInfo = true;
    };
    // this.checkAuthAndGuide();
    let showLoginModal= app.handleIsChk(optionsParams.query.isChk);
    this.setData({
          showLoginModal
    });
  },
  imageSearch(){
    this.selectComponent('#searchBox').imageSearch();
  },
  marqueeClick(e){
    this.setData({
      isSearh:true,
      inputValue: e.target.dataset.val
    })
    wx.nextTick(() => {
      this.selectComponent('#searchBox').clickSearch();
    })
  },
  cancelBox(){
    this.setData({
      isSearh: false
    })
  },
  showLogin() {
    this.setData({
      showLoginModal: true
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
   
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let user_info=this.getUserInfo();
    this.reportCont();
    
    let store_id = app.globalData.store_id;
    // app.mtj.trackEvent('setcustomvar', {
    //   name: !!store_id ? 'vstore':'member',
    //   value: user_info?user_info.member_id:'' ,
    // });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (this._observer) this._observer.disconnect()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.fetchIndexTab();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return shareConfig
  },
  swiperModuleChange(e){
    this.data.swiperMBar[e.target.dataset.id] = e.detail.current;
    this.setData({
      swiperMBar: this.data.swiperMBar
    })
  },
  initObserver () {
    let suffix = this.data.suffix;
    if (this._observer) this._observer.disconnect();
    if (!this.observer_request_option[suffix] || this.observer_request_option[suffix].observerListCount <= 0) return;
    this._observer = wx.createIntersectionObserver(this, { observeAll: true})
    this._observer
      .relativeToViewport({ bottom: 100 })
      .observe(`.observer-${suffix}`, (res) => {
        // console.log('observer: ', res)
        let {tabIndex, index} = res.dataset;
        this.runInSequence(tabIndex, index);
      })
  },
  jumpUrl(event){
    let {urlpath} = event.currentTarget.dataset;
    if (urlpath.type=='tabbar'){
      let params = get_url_parms_obj(urlpath.url)
      let url = urlpath.url.split('?')[0];
      app.globalData.tabbarParams[url] = params;
      wx.switchTab({
        url: url
      })
    }else{
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
  scrollToLower(){
    let { suffix, bars} = this.data;
    if (!bars[suffix].use_template){
      this.fetchPageByParams(bars[suffix], suffix);
    }
    if (bars[suffix].components) {
      let length = bars[suffix].components.length;
      if (length > 0 && bars[suffix].components[length - 1].name == 'PullupModule') {
        let component = bars[suffix].components[length - 1];
        if (component.data.loadAll) return;
        let options = {
          q: component.data.keywords,
          offset: component.data.data.length,
          limit: 10,
          core: 'yingerfashion',
        }
        wx.showLoading({
          title: '正在请求',
          mask: true
        })
        this.getScrollGoodsData(options).then(res => {
          wx.hideLoading();
          if (res.status == 'OK') {
            let data = res.data;
            component.data.data.push(...data);
            component.data.loadAll = data.length < 10;
            this.setData({
              bars
            })
          }
        }).catch(e => {
          wx.hideLoading();
        })
      }
    }
  },
  fetchPageByParams(val,index){
    let params = Object.assign({}, val.apiParams.params)
    params.offset = val.offset;
    params.limit = val.limit;
    if (val.limit<val.data.length){
      this.setData({
        loading: true
      })
      return;
    }
    wx.showLoading({
      title: '拼命加载中',
    })
    app.mall_api_post(`/api${val.apiParams.api}/cors`, params, (res) => {
      wx.hideLoading();
      if(res.code==200){
        res.data.forEach(item=>{
          item.cover_url = ossUrlTest(item.cover_url)
        })
        val.offset = res.data.length
        let _key = `bars[${index}].data`;
        this.setData({
          [_key]: [...val.data, ...res.data]
        });
      }
    })
  },
  checkAuthAndGuide() {
    let userClickAuth = wx.getStorageSync('auth');
    let guideInfo = wx.getStorageSync('wx_modal_guide');
    this.setData({
      showUserInfoModal: !userClickAuth,
      showGuide: !guideInfo
    })
  },
  getUserInfo() {
    let user_info = app.getLocalUserInfo();
    if (!!user_info && !!user_info.member_id) {
      let member_id = user_info.member_id || '';
      this.setData({
        member_id
      })
      this.updateShareConfig();
    }
    return user_info;
  },
  updateShareConfig() {
    let params = this.urlParams;
    let share_member_id = !!params ? params.store_id : '';
    if (share_member_id) {
      app.setStoreId(share_member_id);
    }
    //导购开微店才可以分享
    let store_info = wx.getStorageSync('store_info');

    if (!!store_info) {
      shareConfig.title = `影儿商城-${this.data.member_id}`;
      shareConfig.path = `/pages/index/index?store_id=${this.data.member_id}`;
      shareConfig.imageUrl = '';
    }
    console.log(shareConfig);
  },
  handleChangeScroll({
    detail
  }) {
    this.setData({
      suffix: detail.key,
    });
    // let uuid = this.data.bars[detail.key].uuid;
    // let index = detail.key;
    // if (!this.data.bars[index].components.length && this.data.bars[index].use_template) {//有use_template就模版渲染，否则按请求api渲染
    //   console.log('触发了handleChangeScroll')
    //   this.fetchPageByUuid(uuid, index);
    // }
  },
  fetchIndexTab() {
    this.observer_request_option = {};
    if (this._observer) this._observer.disconnect();
    let vm = this;
    let { suffix}=this.data;
    let _data = [];
    app.mall_api_get('/api/indexconfig', {}, res => {
      res.data.forEach(item => {
        if (item.type == 'home'){
          if (!item.use_template) {
            item.offset = 0
            item.limit = 6
            item.data = []
          } else {
            item.components = []
          }
          _data.push(item);
        }
      });
      vm.setData({
        bars: _data
      });
      if (_data[suffix].use_template){
        let uuid = _data[suffix].uuid;
        this.fetchPageByUuid(uuid, suffix);
      }else{
        this.fetchPageByParams(_data[suffix], suffix);
      }
    })
    app.mall_api_post('/api/index/getConfigSetting/cors',{},res=>{
      if(res.status=='success'&&!!res.data){
        this.setData({
          tabSettingData: res.data.baseConfig,
          swiperItemPB:res.data.baseConfig.isSearch?this.data.swiperItemPB+80:this.data.swiperItemPB
        })
      }
    })
  },
  fetchPageByUuid(uuid, suffix) {
    let vm = this
    let {
      bars
    } = this.data;
    wx.showLoading({
      title: '拼命加载中',
    })
    app.mall_api_get('/api/mobile/vstore/homePage/cors/' + uuid, {}, res => {
      wx.hideLoading();
      let _data = res.data.published_page;
      //悬浮按钮组件兼容ios卡顿现象
      let floatList=[];
      if (_data.components){
        _data.components.forEach(item => {
          if (item.name == 'FloatBoxModule') {
            if(item.data.time_range&&item.data.time_range.length>0){
              let newTime=new Date().getTime();
              let startTime=new Date(item.data.time_range[0]).getTime();
              let endTime=new Date(item.data.time_range[1]).getTime();
              item.data.show=newTime>=startTime&&newTime<=endTime?true:false;
            }
            floatList.push(item.data);
          } else if (item.name == 'BrandModule' && item.data.isSticky && !this.data.brandStickyData[suffix]){
            this.data.brandStickyData[suffix] = JSON.parse(JSON.stringify(item.data));
            this.data.brandStickyData[suffix].isSticky = false;
          }
        })
        this.data.floatData[suffix] = floatList;
      }
      let _bars = Object.assign(this.data.bars[suffix], _data);
      let _key = `bars[${suffix}]`;

      vm.setData({
        [_key]: _bars,
        floatData: this.data.floatData,
        brandStickyData: this.data.brandStickyData
      });
      vm.handlePageData(suffix);
    }, err => {
      let _bars = Object.assign(this.data.bars[suffix], {
        components: []
      });
      let _key = `bars[${suffix}]`;
      vm.setData({
        [_key]: _bars
      });
    })
  },
  handlePageData(tabIndex){
    let vm = this;
    let { bars }=this.data;
    let _data=bars[tabIndex].components;
    this.observer_request_option[tabIndex] = {observerListCount: 0}
    _data.forEach((item,index)=>{
      item.data._tabIndex = tabIndex;
      item.data._componentsIndex = index;
      if (item.name == 'GoodslistModule' || (item.name == "Swiper3dModule" && item.data.type == 'goods3d')) {
        let goods_id = item.data.list;
        if (goods_id.length) {
          let options = {
            fq: `id:(${goods_id.join(' ')})`,
            core: 'yingerfashion',
            limit: goods_id.length
          }
          this.observer_request_option[tabIndex].observerListCount += 1;
          this.observer_request_option[tabIndex][index] = options;
          item.observerClass = `observer-${tabIndex}`;
        }
      } else if (item.name == 'RichtextModule') {
        let _content = item.data.content;
        let _str = vm.richImgUrl(_content);
        item.data.content = _str
      } else if (item.name =='TicketModule'){
        let tickets = item.data.tickets;
        if (tickets.length && !!tickets){
          tickets.map(i=>{i.isActive=false})
        }
      } else if (item.name == 'VideoModule' && item.data.playInCurrentPage) {
        let arr = item.data.data;
        arr.map((video_item, video_index) => {
          this.fetchVideoSrc(video_item, video_index, index, tabIndex);
        })
      } else if (item.name =='NoticeBarModule'){//通告栏中奖数据
        this.get_lottery_list(tabIndex,item.data);
      }
    });
    let _components = this.data.bars[tabIndex].components;
    let _bars = Object.assign(_components, _data);
    let _key = `bars[${tabIndex}].components`;
    vm.setData({
      [_key]: _bars,
    }, () => {
      // 延时一下，等待一下图片加载，监测更准确一些
      let timer = setTimeout(() => {
        this.initObserver();
        clearTimeout(timer);
      }, 1000)
    });
  },
  get_lottery_list(tabIndex,datas) {
    let obj={},keyList=['want_gift','appoint_buy','order_draw'];
    keyList.forEach(item=>{
      let _key=datas[item]||'';
      obj[item]=[];
      _key=_key.split(',');
      if(_key.length>2){
        obj[item].push(_key[0],_key[1])
      }else{
        obj[item]=_key;
      }
    })
    app.notokan_api_post('mobileapi.activity.scrollingNews', {
      limit:10,
      page:1,
      want_gift:obj['want_gift'].join(','),       // 我要礼物
      appoint_buy:obj['appoint_buy'].join(','),   // 预约购买
      order_draw:obj['order_draw'].join(',')      // 订单抽奖
    }, res => {
      if(res.rsp=='succ'){
        let _data = res.data;
        let list=[];
        for (let key in _data) {
          for (let i = 0; i < _data[key].length; i++) {
            let _obj = _data[key][i];
            if(_obj.name||_obj.cpns_name){
              list.push(_obj);
            }
          }
        }
        this.data.bars[tabIndex].components.forEach(item=>{
          if (item.name == 'NoticeBarModule'){
            item.data.list = list.sort(()=>(Math.random()-0.5)>0?1:-1);
          }
        })
        let _key = `bars[${tabIndex}].components`;
        this.setData({
          [_key]: this.data.bars[tabIndex].components,
        });
      }
    })
  },
  fetchVideoSrc(video_item, video_index, module_index, tab_index) {
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
          let _key = `bars[${tab_index}].components[${module_index}].data.data[${video_index}]`;
          self.setData({
            [_key]: video_item,
          });
        })
      }
    })
  },
  selectVideo(e) {
    let { obj } = e.currentTarget.dataset;
    try {
      wx.setStorageSync('videoData', obj);
    } catch (e) {
      wx.setStorage({
        key: 'videoData',
        data: obj
      })
      console.log(e)
    }
    wx.navigateTo({
      url: '/packageActive/videoPlay/index?video_id=' + obj.video_id,
    })
  },
  // observer队列执行请求，避免短时间内请求过多
  runInSequence (tabIndex, index) {
    let current_function_options = this.observer_request_option[tabIndex];
    let component = this.data.bars[tabIndex].components[index];
    if (component.observerClass && current_function_options && current_function_options[index]) {
      let options = current_function_options[index];
      this.getScrollGoodsData(options).then(res => {
        if (res.status == 'OK') {
          var _data = res.data;
          component.data.data = [];
          let arr = [];
          for (var i = 0; i < _data.length; i++) {
            let obj = _data[i];
            // obj.m_url = obj.image_default ? ossUrlTest(obj.image_default[0], 200) : '';
            obj.img_search = false;
            obj.price = obj.price.toFixed(2);
            arr.push(obj);
          }
          let _key = `bars[${tabIndex}].components[${index}].data.data`;
          this.setData({
            [_key]: arr,
          });
          current_function_options.observerListCount -= 1;
          if (current_function_options.observerListCount <= 0 && this._observer) this._observer.disconnect(); // 所有组件都出现过后取消observer
        }
      }).catch(err => {
        
      })
    }
    // 请求触发后立即清除observer标志，避免observer触发多次时重复请求和observerListCount重复减一
    component.observerClass = '';
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
  jumpPage(e) {
    let {
      type,
      id
    } = e.currentTarget.dataset.item;
    if (type == 'video') {
      wx.navigateTo({
        url: `/packageActive/videoPlay/index?video_id=${id}`
      })
    } else if (type == 'goods') {
      wx.navigateTo({
        url: `/packageGoods/goodsDetailView/index?goods_id=${id}`
      })
    }
  },
  touchHandler(event) {
    const data = event.detail;
  },
  richImgUrl(content) {
    let vm = this;
    let reg = /\/storage/ig;
    let reg2 = /img/ig;
    let regUrl=/https\:/ig;
    let str1 = content.replace(reg, function(url) {
      if (content.indexOf('https')!=-1){
        return url
      }else{
        return app.globalData.mall_host + url;
      }
    })
    let str2 = str1.replace(reg2, function(url2) {
      return url2 + ` class="width-100"`
    })
    return str2
  },
  get_confession({currentTarget}){
    if (!this.data.member_id) {
      $Toast({
        content: '请先登录'
      });
      this.setData({
        showLoginModal: true
      })
      return;
    }
    let {item={}} = currentTarget.dataset;
    wx.navigateTo({
      url: `/packageActive/confessionView/index?cpns_id=${item.cpns_id}`
    })
  },
  get_ticket(event) {
    var vm = this;
    let {
      index,
      tabindex,
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
    var cpns_id = vm.data.bars[tabindex].components[componentindex].data.tickets[index].id;
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
      let _key = `bars[${tabindex}].components[${componentindex}].data.tickets[${index}].isActive`;
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
        vm.setData({
          [_key]: true
        })
        wx.showToast({
          title: '已领取',
          icon: 'none',
          duration: 2000
        })
      } else {
       if(!!res.data.msg){
         $Toast({
           content: res.data.msg,
           type: 'error'
         });
       }else{
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
  hideCouponModal() {
    this.setData({
      showCouponModal: false
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
    console.log("event", index,index,data);
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
  changeSwiper({detail}) {
    this.setData({
      suffix: detail.current,
      loading: false
    });
    let index = detail.current;
    
    if (this.data.bars[index].use_template) { //有use_template就模版渲染，否则按请求api渲染
      let uuid = this.data.bars[index].uuid;
      if (!this.data.bars[index].components.length) {
        this.fetchPageByUuid(uuid, index);
      } else {
        this.initObserver();
      }
    } else if (this.data.bars[index].data.length == 0) {
      this.fetchPageByParams(this.data.bars[index], index);
    }
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
    if (!scene_obj){
      form.browse_content_num = 1;
    }else if(!val && urlParams.scene_id != scene_obj.scene_id){
      form.browse_content_num = 1;
    }
    form.browse_index_num = 1;
    try {
      wx.setStorageSync('scene_obj', form)
    } catch (e) { 
      wx.setStorage({
        key: 'scene_obj',
        data: form
      })
      console.log(e)
    }
    app.reportContent(form);
  },
  goTop(){
    this.setData({
      scrollTop: 0
    })
  },
  scroll(e){
    let {scrollTop}=e.detail;
    // 商品分组吸顶
    this.selectAllComponents('.tabBox').forEach(item=>{
      item.scrollChange(scrollTop, !this.data.isSearh, !!this.data.brandStickyData[this.data.suffix]);
    })
    let isShow = scrollTop > 200;
    if (this.data.isTopBtn != isShow) {
      this.setData({
        isTopBtn: isShow,
        isTopSearch:!isShow,
        swiperItemPB:isShow?this.data.swiperItemPB-76:this.data.swiperItemPB+76
      })
    }
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
  jumpRegitesPage(){
    //活动进入
    //判断场影ID，和领取是否登录
    let { urlParams,member_id } = this.data;
    if (!member_id){
      let url = '/pages/loginByMsg/index';
      if (!!urlParams.scene_id){
        url = url + `?scene_id=${urlParams.scene_id}&scen_type=wx_page&scene_relation=oneself`
      }
      wx.navigateTo({
        url,
      });
    }
  }
})