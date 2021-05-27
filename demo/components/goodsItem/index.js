let {
  globalData,
  mall_api_post
} = getApp();
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    goodsData: {
      type: Object,
      value: {},
      obsever:function(v){
        
      }
    }
  },
  data:{
    img_404: globalData.img_404
  },
})