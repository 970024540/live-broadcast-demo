const app = getApp();
const Base64 = require('../../miniprogram_npm/js-base64/index').Base64;
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    goodsData: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal) {
        if (newVal.length) {
          this.setData({
            goodsId: newVal
          })
        }
        this.getGoodsData();
      }
    },
    params: {
      type: Object,
      value: {}
    },
    //获取微信打开场景ID和URL
    optionsParams: {
      type: Object,
      value: {}
    },
    dataType: {
      type: String,
      value: 'view_to_view_items'
    },
    soid: {
      type: String,
      value: '猜你喜欢',
      observer: function (newVal, oldVal) {
          this.setData({
            source_id: newVal
          })
      }
    },
    scene_id:{
      type:String,
      value:''
    },
    listType: { //布局类型：list ==竖向滚动  scrollY ==横向滑动
      type:String,
      value:"list"
    },
    content_id:{
      type:String,
      value:''
    },
    content_type:{
      type:String,
      value:''
    }
  },
  data: {
    type: 'list', //mini-list
    goods_list: [],
    host: app.globalData.host,
    goodsId: [],
    trace_id: '',
    source_id:''
  },
  ready() {
  },
  methods: {
    getGoodsData() {
      var openid = wx.getStorageSync('openid');
      if (!openid) return;
      let self = this;
      let obj = {
        storeNO: '500001',
        openid: openid,
        source_type: 'MINI_PROGRAM',
      }
      if(this.properties.soid!='猜你喜欢'){
          obj.associated_items = JSON.stringify({
            [this.properties.dataType]: this.data.goodsId
          });
      }
      app.notokan_api_post("wisdom.getGoods", obj, res => {
        wx.hideLoading();
        if (res.rsp == "succ") {
          let _data = res.data.data;
          let _arr = [];
          if (!_data || !_data.length)return;
          let action_list=[];
          _data.forEach((item, index) => {
            _arr.push(item);
            let _obj = {
              action_type: "EXPOSE",
              action_time: parseInt(new Date().getTime() / 1000),
              action_param: {
                product_id: item.goods_id,
                positon: index + 1,
                source_id: this.properties.soid,
                coupon_stock_id: ""
              }
            };
            if (!!res.data.trace_id) {
              _obj.trace_id = Base64.encode(res.data.trace_id);
            }
            action_list.push(_obj);
          });
          self.setData({
            goods_list: _data,
            trace_id: res.data.trace_id
          })
          if(!_data.length)return;
          if (!this.properties.soid)return;
          let obj = {};
          obj.action_list = action_list;
          let str = JSON.stringify(obj);
          app.reportUserAction(str);
        }
      })
    },
    jumpGoodsDetail(e) {
      let { index, item } = e.currentTarget.dataset
      let { soid, scene_id, params, optionsParams} = this.properties;
      let { trace_id, source_id}=this.data;
      let self = this;
      let goodsid = item.goods_id;
      var str = null;
      var str2 = null;
      let { content_id, content_type } = this.properties;
      let url = `/packageGoods/goodsDetailView/index?goods_id=${goodsid}&soid=${soid}`;
      if (!!content_id && !!content_type){
        url += `&content_type=${content_type}&content_id=${content_id}&author_id=${params.author_id}`
      };
      if (!!trace_id) {
        url = url + `&trid=${Base64.encode(trace_id)}`;
      }

      //内容上报
      if (!!params && !!params.scene_id) {
        //如果是链接进入，使用链接上的scene_id
        Object.keys(params).map(key => {
          if (key == 'scene_type' || key == 'scene_id') {
            let s = `&${key}=${params[key]}`;
            str += s;
          }
        });
        //获取URL地址
        if (!!optionsParams.query && !!optionsParams.query.appmsg_compact_url) {
          str2 = '&scene_url=' + optionsParams.query.appmsg_compact_url
        } else {
          str2 = '&scene_url=' + !!params['scene_url'] ? params['scene_url'] : optionsParams.path
        }
        url = url + str + str2 + '&scene_relation=goods_detail_recommend';
      } else {
        //否则用推荐位scene_id
        url = url + `&scene_id=${scene_id}&scene_type=ec_recommend&scene_relation=oneself`
      }
      url = url.replace(/undefined/g,'');
      wx.navigateTo({
        url
      })
    },
  }
})