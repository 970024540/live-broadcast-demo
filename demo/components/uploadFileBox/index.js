const { globalData }=getApp();
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    files: { //当有需要回显的时候，操作时返回的是url数组
      type: Array,
      value: [],
      observer:"changeFilesProps"
    },
    imgApiType: { // 上传图片接口类型： mall  ecstore
      type:String,
      value:'mall'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tempFilePaths:[],
    imgIds:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeFilesProps(val){
      this.setData({
        tempFilePaths: val
      })
    },
    fileChange(){
      if (this.data.files.length > 0) {//files有的时候返回操作过后的files
        this.triggerEvent('fileChange', this.data.tempFilePaths)
      }else{
        this.triggerEvent('fileChange', this.data.imgIds)
      }
    },
    imgBind() {
      if (this.data.tempFilePaths.length>9) return wx.showToast({
        title: '最多上传九张图片',
        icon:'none'
      })
      wx.chooseImage({
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        count: 1,
        success: (file) => {
          wx.showLoading({
            title: '正在上传'
          })
          if (this.data.imgApiType=='mall'){
            wx.uploadFile({
              url: globalData.mall_host + '/openapi/webUpload',
              filePath: file.tempFilePaths[0],
              name: 'mobile',
              header: {
                'Content-Type': 'multipart/form-data',
                'name': 'mobile',
                'storageSite': 'cloud'
              },
              success: (res) => {
                wx.hideLoading();
                let _data = JSON.parse(res.data);
                let ids=[];
                ids.push(_data.data);
                this.setData({
                  tempFilePaths: [...this.data.tempFilePaths, ...[_data.data.path]],
                  imgIds: [...this.data.imgIds,...ids]
                })
                this.fileChange()
              },
              fail: function (res) {
                wx.hideLoading();
                wx.showToast({
                  title: res.message,
                  icon: 'none'
                })
              }
            })
          }else{
            wx.uploadFile({
              url: globalData.image_host + '/index.php/wap2/tools/fileUpload',
              filePath: file.tempFilePaths[0],
              name: 'mobile',
              header: {
                'Content-Type': 'multipart/form-data',
                'name': 'mobile',
                'storageSite': 'cloud'
              },
              success: res => {
                wx.hideLoading();
                let _data = JSON.parse(res.data);
                let ids = [];
                ids.push(_data.data);
                this.setData({
                  tempFilePaths: [...this.data.tempFilePaths, ...[file.tempFilePaths[0]]],
                  imgIds: [...this.data.imgIds, ...ids]
                })
                this.fileChange()
              },
              fail: err => {
                wx.hideLoading();
                wx.showToast({
                  title: res.message,
                  icon: 'none'
                })
              }
            })
          }
        },
        fail: (err) => {

        }
      })
    },
    videoBind() {
      // let pamas = {
      //   title: '111',
      //   description: '13123234',
      //   extend: 'mp4',
      //   type: 'articleshow',
      //   member_id: this.data.member_id
      // };
      // app.mall_api_post('/api/VideoClient/uploadVideoGeneral/cors', pamas,res=>{
      //   debugger
      // })
      // return ;
      wx.chooseVideo({
        maxDuration: 15,
        success: (file) => {
          this.setData({
            videoSrc: file.tempFilePath
          })
        },
        fail: (err) => {

        }
      })
    },
    guanbiBind(e) {
      let ids=[];
      let list = this.data.tempFilePaths.filter((item,index) => {
        if (item != e.currentTarget.dataset.i){
          ids.push(this.data.imgIds[index])
          return item
        }
      });
      this.setData({
        tempFilePaths: list,
        imgIds: ids
      })
      this.fileChange();
    },
    //图片点击事件
    imgYu: function (event) {
      var src = event.currentTarget.dataset.src; //获取data-src
      var imgList = event.currentTarget.dataset.list; //获取data-list
      //图片预览
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: imgList // 需要预览的图片http链接列表
      })
    },
  }
})
