let {
  globalData,
  mall_api_post
} = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    disabled: {
      type: Boolean,
      default: false
    },
    font: {
      type: String,
      default: '',
      observer: function (val) {
        this.setData({
          font_url: val
        })
      },
    },
    back: {
      type: String,
      default: '',
      observer: function (val) {
        this.setData({
          back_url: val
        })
      },
    }
  },
  data: {
    font_url: '',
    back_url: '',
    font_cover: globalData.host + '/yinger-m/img/user/idcard1.png',
    back_cover: globalData.host + '/yinger-m/img/user/idcard2.png',
  },
  methods: {
    pickImage(e) {
      if (this.data.disabled) return;
      let index = e.currentTarget.dataset.type;
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths[0];
          this.setUrl(index, tempFilePaths);
          let base64 = "data:image/jpeg;base64," + wx.getFileSystemManager().readFileSync(tempFilePaths, "base64");
          setTimeout(() => {
            this.uploadImg(base64, index);
          }, 500)
        }
      })
    },

    uploadImg(base64, index) {
      wx.showLoading({
        title:"正在识别",
        mask: true
      });
      mall_api_post("/api/discern/idCardDiscernUpload", {
        img: base64,
        card_side: index,
        upload_file: 'idCard'
      }, res => {
        wx.hideLoading();
        if(res.status=='success'){
          let data = res.data;
          data.card_side = index;
          data.success = true;
          this.triggerEvent("discernHandle", data);
        }else{
          this.setUrl(index, '');
          this.triggerEvent("discernHandle", {card_side: index});
          wx.showToast({
            title:res.message || '识别失败',
            icon:'none'
          })
        }
      }, err => {
        wx.hideLoading();
        this.setUrl(index, '');
        this.triggerEvent("discernHandle", { card_side: index});
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      })
    },
    setUrl (index, url) {
      let key = index == 0 ? 'font_url' : 'back_url';
      this.setData({
        [key]: url
      })
    }
  }
})
