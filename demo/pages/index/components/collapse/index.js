const app = getApp();
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    datas:{
      type:Object,
      value:() => {}
    },
  },
  observers: {
    'datas.suffix': function(val,old) {
      if(this._observer){
        this.handleSwitch();
      }
    }
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
    initObserver() {
      if (this._observer) this._observer.disconnect();
      this._observer = this.createIntersectionObserver();
      this._observer.relativeToViewport({ bottom: 100 }).observe('.observer-collapse', (res) => {
        this.init();
      })
    },
    init() {
      if(this.data.datas.dataType){
        this.fetchGoodsList(); // 自动抓取
      }else{
        this.selectGoodsList();// 主动选取
      }
      if (this._observer) this._observer.disconnect(); // 只触发一次
    },
    handleSwitch() {
      let {group,suffix} = this.data.datas;
      if (group[suffix].data.length == 0) {
        if(this.data.datas.dataType){
          this.fetchGoodsList();
        }else{
          this.selectGoodsList();
        }
      }
    },
    collapseClick(e){
      let {i}=e.target.dataset;
      let {accordion,group}=this.data.datas;
      if(accordion&&!group[i].state){
        group.forEach(item=> item.state=false);
      }
      group[i].state=!group[i].state;
      this.setData({
        ['datas.suffix']:i,
        ['datas.group']:group
      })      
    },
    fetchGoodsList(){
      let {group,suffix} = this.data.datas;
      let obj = {
        offset: 0,
        limit: group[suffix].limit,
        core: 'yingerfashion',
        fq:''
      }
      if(group[suffix].goods_cat){
        obj.fq=`goods_cat:"${group[suffix].goods_cat}",`;  
      }
      if(group[suffix].brand){
        obj.fq=`${obj.fq}brand:"${group[suffix].brand}",`;
      }
      if(group[suffix].discount_rate){
        obj.fq=`${obj.fq}discount_rate:${group[suffix].discount_rate}`;
      }
      this.getGoodsList(obj);
    },
    selectGoodsList(){
      let {group,suffix} = this.data.datas;
      let key = group[suffix].list;
      if (!key.length) return ;
      let obj = {
        fq: `id:(${key.join(' ')})`,
        core: 'yingerfashion',
        limit: key.length
      }
      this.getGoodsList(obj);
    },
    getGoodsList(obj){
      app.mall_api_post('/api/mobile/Goods/getGoodsList/cors', obj, res => {
        if (res.code == 200) {
          res.data.forEach(item => { //价格格式化
            item.price = parseFloat(item.price).toFixed(2);
            item.mktprice = parseFloat(item.mktprice).toFixed(2);
          })
          let key=`datas.group[${this.data.datas.suffix}].data`
          this.setData({
            [key]:res.data
          })
        }
      }, err => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      })
    },
    clickGoodsItem(e) {
      let { goodsid } = e.currentTarget.dataset;
      wx.navigateTo({
        url: `/packageGoods/goodsDetailView/index?goods_id=${goodsid}`
      })
    },
  }
})
