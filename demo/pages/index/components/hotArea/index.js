// pages/index/components/hotArea/index.js
const { ossUrlTest, jumpToUrl, getUrlParams, getCurrentPageUrl } = require('../../../../utils/index');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    datas:{
      type:Object,
    }
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      this.init();
      
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
    ready(){
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    display_width: 750,
    display_height: 210,
    dpr: 2
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init(){
      let { display_width, dpr, datas } = this.data;
      let { width, height, areaData, marginRl, paddingRl } = datas;
      display_width = 750 - marginRl * 2*2 - paddingRl * 2*2;
      let ratio = display_width / width;
      let display_height = parseInt(height * ratio);
      this.setData({
        display_height,
        display_width
      });
      
      // areaData.forEach((item, index) => {
      //   let { x, y, w, h } = item;
      //   item.x = x ;
      //   item.y = y;
      //   item.x1 = (x + w);
      //   item.y1 = (y + h);
      // })
      // this.data.datas.areaData=areaData;
      console.log(987,this.data.datas);
    },
    handleTap1({detail}){
      let vm=this;
      console.log(detail);
      let {datas}=this.data;
      let {apid}=datas;
      let {x,y}=detail;

      const query = wx.createSelectorQuery();
      query.select(`#${apid}`).boundingClientRect();
      query.exec(function (res) {
        console.log(res);
        if(!res.length) return;
        let {top,left}=res[0];
        // 获取当前坐标点
        let _x=x-left;
        let _y=y-top;
        vm.handleTap(_x,_y);
      })
    },
    handleTap(x,y){
      let {dpr,datas}=this.data;
      let offsetX=x*dpr;
      let offsetY=y*dpr;
      //计算命中区域, 后入优先原则
      let _link = '';
      let { areaData}=datas;
      let index1=0;
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
