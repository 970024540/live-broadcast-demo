const app = getApp()
const { globalData}=getApp();
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    total: {              // 已参与该商品的拼团人数
      type: Number,
      value: 0
    },
    totalBuy: {           // 该商品已被购买次数(团购)
      type: String|Number,
      value: 0
    },
    schemes: {            // 当前商品所有成团规模, scheme_id as key
      type: Object,
      value: () => {}
    },
    joinlist: {           // 当前商品参团列表
      type: Array,
      value: () => []
    },
    isShare: {            // 当前是否分享进来
      type: Boolean,
      value: false
    },
    isFull: {             // 分享进来的团是否已满
      type: Boolean,
      value: false
    },
    scheme_id: {          // 当前选择的成团规模
      type: Number|String
    },
    join_list_id: {       // 分享进来的 join_list_id
      type: Number|String
    },
    price: {              // 商品原价(单买价)
      type: Number|String,
      default: 0
    },
    isgroupStart: {        // 团购是否未开始
      type: Boolean,
      value: false
    }
  },
  data: {
    member_id: '',
    menus: [],
    default_img:app.globalData.default_img,
    show1: false, // 团购规模 actionsheet

    timeId: '',   // 列表轮播定时
    show: false,  // 参与拼团 modal
    activity: {
      nickname: 'xx',
      lack_number: 2,
      to_time: 1560528000
    },
    suffix: 0,
    active: 0,
    show2:false
  },
  lifetimes: {
    ready: function() {
      let user = app.getLocalUserInfo();
      if (user) {
        this.setData({
          member_id: user.member_id
        })
      }

      this.initCircle();
      let schemes = this.properties.schemes;
      let tmp = [];
      for (let k in schemes) {
        if (schemes[k].is_start_groupbuy){
          tmp.push({
            name: `${schemes[k].number}人团(价格￥${schemes[k].scheme_price})`,
            color: '#333',
            scheme_id: k
          })
        }
      }
      this.setData({menus: tmp})
    },
    detached: function() {
      clearInterval(this.data.timeId);
    }
  },
  methods: {
    lookGroupMore() {
      this.setData({
        show2:!this.data.show2
      })
    },
    selectGroup(e) {
      let index = e.currentTarget.dataset.index;
      let member_id = this.data.member_id;
      let joinlist = this.properties.joinlist;

      if (member_id == joinlist[index].originator_member_id) {
        let order_id = '';
        let { list, originator_member_id } = joinlist[index];
        for (let k in list) {
          if (list[k].member_id == originator_member_id) {
            order_id = list[k].order_id;
          }
        }
        wx.navigateTo({url: `/packageGroup/groupShare/index?order_id=${order_id}`});
        return;
      }
      this.setData({
        show: true,
        active: index,
        activity: this.properties.joinlist[index]
      })
    },
    confirm() {
      let { active } = this.data;
      let { schemes, joinlist } = this.properties;

      let { scheme_id, join_list_id } = joinlist[active];
      let { valid_buy_count, member_buyed_num } = schemes[scheme_id];
      if (valid_buy_count != 0 && valid_buy_count <= member_buyed_num) {
        wx.showToast({
          title: '已达购买上限!',
          icon: 'none',
          duration: 2000
        })
        return;
      }
      this.triggerEvent('participate', {scheme_id, join_list_id});
      this.setData({show: false});
    },
    cancel(e) {
      let name = e.currentTarget.dataset.name;
      this.setData({[name]: false })
    },
    selectScheme() {
      this.setData({ show1: true })
    },
    initiate({ detail }) {
      let schemes = this.properties.schemes;
      let scheme_id = this.data.menus[detail.index].scheme_id;

      let { valid_buy_count, member_buyed_num } = schemes[scheme_id];
      if (valid_buy_count != 0 && valid_buy_count <= member_buyed_num) {
        wx.showToast({
          title: '已达购买上限!',
          icon: 'none',
          duration: 2000
        })
        return;
      }
      this.setData({show1: false});
      this.triggerEvent('initiate', {scheme_id});
    },
    initCircle() {
      clearInterval(this.data.timeId);
      
      let len = this.properties.joinlist.length;
      let base = len % 2 == 0 ? len : len + 1;

      let timeId = setInterval(() => {
        let tmp = this.data.suffix + 2;
        this.setData({ suffix: tmp % base });
      }, 5000)
      this.setData({ timeId, suffix: 0 })
    }
  }
})
