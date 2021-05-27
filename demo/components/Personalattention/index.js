const app=getApp();
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    title:{
      type: String,
      value: '' //达人 生活 影儿圈
    },
    datas:{
      type:Object,
      value:{}
    },
    member_id:{
      type:String,
      value:""
    }
  },
  data: {
    img_404: app.globalData.img_404
  },
  methods: {
    comItemClick(){
      let {title, datas} = this.data;
      if (title == '资讯' || title == '达人') {
        wx.navigateTo({
          url: `/packageActive/pageDetail/index?showCommentsBar=true&page=true&page_id=${datas.article_id}`
        })
      } else {
        wx.navigateTo({
          url: `/packageCommunity/PersonalDetails/index?type=${title == '生活' ? 2 : 0}&article_id=${datas.article_id}`
        })
      }
    }
  }
})
