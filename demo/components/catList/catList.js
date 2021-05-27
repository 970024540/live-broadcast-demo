// components/catList/catList.js
const app=getApp();
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true,
  },
  properties: {
    listData: {
      type: Array
    },
    brand: {
      type:Boolean,
      value: false,
    },
    typeItem:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggleList ({currentTarget}) {
      let index = currentTarget.dataset.index;
      if(this.data.typeItem){
        this.data.listData[index].showList=!this.data.listData[index].showList;
        this.setData({
          listData:this.data.listData
        })
      }else{
        this.triggerEvent('toggleList', index);
      }
      
    },
    jumpClick({ currentTarget }) {
      let { url,item } = currentTarget.dataset;
      wx.navigateTo({
        url,
        fail: () => {
          wx.switchTab({
            url,
          })
        }
      })
      //用户行为上报
      let obj = {
        action_list: [{
          action_type: "CLICK_CATEGORY",
          action_time: parseInt(new Date().getTime() / 1000),
          action_param: {
            source_id: item.name,
          }
        }]
      }
      let str = JSON.stringify(obj);
      app.reportUserAction(str);
      this.triggerEvent('itemClick', item);
    },
    itemClickHandle(e) {
      let {item} = e.currentTarget.dataset;
      let url='';
      if (item.page_id) {
        url =`/packageActive/brandView/index?uuid=${item.page_id}`;
      }else{
        url = `/packageGoods/goodsListView/index?fq=cat_id:${item.id}&soid=${encodeURIComponent(item.name||'')}`;
      }
      wx.navigateTo({ url });
      //用户行为上报
      let obj = {
        action_list: [{
          action_type: "CLICK_CATEGORY",
          action_time: parseInt(new Date().getTime() / 1000),
          action_param: {
            source_id: item.name,
          }
        }]
      }
      let str = JSON.stringify(obj);
      app.reportUserAction(str);
      this.triggerEvent('itemClick', item);
    }
  }
})
