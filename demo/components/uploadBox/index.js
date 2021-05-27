let {
  mall_api_post,
  globalData
} = getApp();
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    filePath: {
      type: String,
      value: ''
    },
    default: {
      type: String,
      value: ''
    },
    width: {
      type: Number|String,
      value: 160,
      observer (val) {
        let finalWidth = val;
        if (typeof (val) === 'number') finalWidth = val + 'rpx';
        this.setData({
          finalWidth
        })
      },
    },
    height: {
      type: Number|String,
      value: 160,
      observer (val) {
        let finalHeight = val;
        if (typeof(val) === 'number') finalHeight = val + 'rpx';
        this.setData({
          finalHeight
        })
      },
    },
    extendClass: {
      type: String,
      value: '',
    },
    type: {
      type: String,
      value: 'image'
    },
    showTips: {
      type: Boolean,
      value: false
    },
    index: {
      type: Number
    },
    iconfont: {
      type: String,
      value: 'icon-shangchuan',
    },
    iconSize: {
      type: String,
      value: 'font-6x',
    },
    iconColor: {
      type: String,
      value: 'color-success'
    },
    loadingMask: {
      type: Boolean,
      value: false
    }
  },
  data: {
    defaultAvatar: 'http://mall.yingerfashion.com/yinger-m/app/images/404/404@160_160.jpg',
    finalWidth: '160rpx',
    finalHeight: '160rpx',
  },
  methods: {
    openMeidaUpload() {
      let type = this.data.type;
      switch (type) {
        case 'image':
          this.openWxChooseImage();
          break;
        case 'video':
          this.openWxChooseVideo();
          break;
        default:
          this.openWxChooseImage();
          break;
      }
    },
    openWxChooseImage() {
      let vm = this;
      let index = this.data.index;
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function(res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths[0];
          wx.showLoading({
            title:'正在上传',
            mask: vm.data.loadingMask
          })
          wx.uploadFile({
            url: globalData.mall_host + '/openapi/webUpload',
            filePath: tempFilePaths,
            name: 'mobile',
            header: {
              'Content-Type': 'multipart/form-data',
              'name': 'mobile',
              'storageSite': 'cloud'
            },
            success: function (res) {
              wx.hideLoading();
              let _data = JSON.parse(res.data);
              let { path, id } = _data.data;
              vm.triggerEvent("uploadSuccess", {
                localPath: tempFilePaths,
                file: path,
                type: 'image',
                index,
                id: id
              });
            },
            fail: function (res) {
              wx.hideLoading();
              wx.showToast({
                title: res.message,
                icon: 'none'
              })
            }
          })
        }
      })
    },
    openWxChooseVideo() {
      let vm = this;
      let index = this.data.index;
      wx.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 60,
        camera: 'back',
        success: function(res) {
          vm.triggerEvent("uploadSuccess", {
            file: res.tempFilePath,
            type: 'video',
            index
          });
        }
      })
    }
  }

})
