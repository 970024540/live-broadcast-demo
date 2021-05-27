const app = getApp();
const { ossUrlTest, jumpToUrl, getUrlParams, getCurrentPageUrl } = require('../../../../utils/index');
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    apid:{
      type: String,
      value: ''
    },
    tabData: {
      type: Array,
      value: () => []
    },
    goodsArea: {
      type: Object,
      value: () => {}
    },
    other: {
      type: Object,
      value: () => {
        type: 'list'
      }
    },
    isSticky:{ // 是否吸顶
      type:Boolean,
      value:false
    },
    isTabLeft:{// tab栏居左布局
      type:Boolean,
      value:false
    },
    tabPaddT:{
      type:Number,
      value:15
    },
    tabPaddR:{
      type:Number,
      value:15
    },
    tabPaddB:{
      type:Number,
      value:15
    },
    tabPaddL:{
      type:Number,
      value:15
    },
    tabTextActiveSize:{
      type:Number,
      value:14
    },
    tabTextSize:{
      type:Number,
      value:14
    },
    tabAlign:{
      type:String,
      value:'center'
    },
    tabbarType:{ // tab类型 '1':默认  '2':居中
      type:String,
      value:'1'
    },
    tabLeftWidth:{
      type:Number,
      value:25
    }
  },
  data: {
    suffix: 0,
    data: [],
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    defIndex: 0,
    isFixedTop: false,   // 是否固定顶部
    navbar_box_height:0,  // 整个的高度
    display_width: 750,
    display_height: 210,
    dpr: 2
  },
  lifetimes: {
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
      if (this._observer) this._observer.disconnect();
    },
    ready () {
      this.initObserver()
    },
  },
  ready() {
    this.initObserver()
  },
  detached: function () {
    // 在组件实例被从页面节点树移除时执行
    if (this._observer) this._observer.disconnect();
  },
  methods: {
    scrollChange(scrollTop,isSearch,isBrand){
      if (this.data.isSticky){
        var that = this;
        this.createSelectorQuery().select('#navbar').boundingClientRect(function (rect) {
          if (!rect) return;
          let topSearch = isSearch?60:0; // 顶部搜索栏位置
          topSearch = isBrand ? topSearch + 84 : topSearch; // 吸顶专区栏位置
          if (rect.top < (42 + topSearch) && -rect.top < that.data.navbar_box_height - 100) {
            if (that.data.isFixedTop) return;
            that.setData({
              isFixedTop: true
            })
          } else if (that.data.isFixedTop) {
            that.setData({
              isFixedTop: false
            })
          }
        }).exec();
      }
    },
    initObserver() {
      if (this._observer) this._observer.disconnect();
      this._observer = this.createIntersectionObserver()
      this._observer
        .relativeToViewport({ bottom: 100 })
        .observe('.observer-goods-group', (res) => {
          this.init();
        })
    },
    handleData(index){
      // let suffix = index;
      let tabData = this.properties.tabData;
      return {
          theme: tabData[index].config.timer.theme || 'dark',
          StartingLabel: tabData[index].config.timer.etitle,
          endLabel: '活动已结束',
          padding_rl: tabData[index].config.padding_rl,
          preStartLabel: tabData[index].config.timer.stitle,
          from_time: new Date(tabData[index].config.timer.stime).getTime(),
          to_time: new Date(tabData[index].config.timer.etime).getTime()
      }
    },
    init() {
      let tabData = this.properties.tabData;
      tabData.forEach((item, index) => {
        if (item.config && item.config.showTimer) item.countdown = this.handleData(index);
      })
      this.setData({
        data: tabData
      })
      this.getScrollGoodsData(0);
      if (this._observer) this._observer.disconnect();
    },
    getScrollGoodsData(tabIndex) {
      var vm = this;
      let key = this.data.tabData[tabIndex].list;
      if (!key.length) return
      let options = {
        fq: `id:(${key.join(' ')})`,
        core: 'yingerfashion',
        limit: key.length
      }
      app.mall_api_get('/api/mobile/Goods/getGoodsList/cors', options, (res) => {
        if (res.status == 'OK') {
          var _data = res.data;
          let arr = [];
          for (let i = 0; i < _data.length; i++) {
            let obj = _data[i];
            // obj.m_url = obj.image_default ? obj.image_default[0] : '';
            obj.img_search = false;
            obj.price = obj.price.toFixed(2);
            arr.push(obj);
          }
          let str = Object.assign(this.data.data[tabIndex].data,arr);
          let _key = `data[${tabIndex}].data`;
          vm.setData({
            [_key]: str
          });
          vm.computeHeight();
        }
      })
    },
    computeHeight(){
      // 计算整个分组高度
      let vm=this;
      this.createSelectorQuery().select('.observer-goods-group').boundingClientRect(function (rect) {
        if (rect && rect.height > 0) {
          vm.data.navbar_box_height = parseInt(rect.height);
        }
      }).exec();
    },
    handleSwitch(e) {
      let suffix=0;
      if (e.detail.key!==undefined){
        suffix = e.detail.key;
      } else if (e.target.dataset.i!==undefined){
        suffix = e.target.dataset.i;
      }
      this.setData({
        suffix
      })
      if (this.data.data[suffix].data.length == 0){
        this.getScrollGoodsData(suffix);
      }else{
        this.computeHeight();
      } 
    },
    jumpUrl(event) {
      let { url, type = '' } = event.currentTarget.dataset;
      if (type == 'tabbar') {
        wx.switchTab({
          url: url
        })
      } else {
        wx.navigateTo({
          url: url
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
    handleTap2(e){
      let vm=this;
      let {apid}=this.properties;
      let areaData=e.currentTarget.dataset.areadata||[];
      if(!areaData.length)return;
      let {detail}=e;
      let {x,y}=detail;
      const query = wx.createSelectorQuery().in(this);
      query.select(`#${apid}`).boundingClientRect();
      query.exec(function (res) {
        if(!res.length) return;
        let {top,left}=res[0];
        // 获取当前坐标点
        let _x=x-left;
        let _y=y-top;
        vm.handleTap(_x,_y,areaData);
      })
    },
    handleTap(x,y,areaData){
      let {dpr,datas}=this.data;
      let offsetX=x*dpr;
      let offsetY=y*dpr;
      //计算命中区域, 后入优先原则
      let _link = '';
      let index1=0;
      console.log("areaData",areaData);
      areaData.forEach((item, index) => {
        let { x, w, y, h, link } = item;
        let x1=x+w;
        let y1=y+h;
        if (offsetX > x && offsetX < x1) {
          //命中x
          if (offsetY > y && offsetY < y1) {
            _link = link;
            index1=index;
          }
        }
      })
      if (_link){
        let params = getUrlParams(_link);
        let urlPath = _link.split('?')[0];
        let currentUrl = getCurrentPageUrl();
        if (params.apid && urlPath == currentUrl) {
          this.triggerEvent('scrollToView', {apid: params.apid});
        } else if (/^(#anc|anc)\d+/.test(_link)) {
          this.triggerEvent('scrollToView', {apid: _link.replace('#', '')});
        } else {
          let obj = jumpToUrl(_link);
          if (obj) {
            obj.type == 'tabbar' ? wx.switchTab({
              url: obj.url,
            }) : wx.navigateTo({
              url: obj.url,
            })
            return;
          }
        } 
      }
    }
  }
})
