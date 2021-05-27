// pages/index/components/hotTag/index.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  properties: {
    top: {
      type: Number,
      value: 0
    },
    tagScrollSite: {
      type: String,
      value: '1'
    },
    tagBgColor: {
      type: String,
      value: '#000'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    bg1: 'http://zone-yingerfashion.oss-cn-shenzhen.aliyuncs.com/storage/images/system-image/56a2c88cf71c4193022d1d5c019fab2e.png',
    bg2: 'http://zone-yingerfashion.oss-cn-shenzhen.aliyuncs.com/storage/images/system-image/49b0947c4ac057487a4e8b782196465b.png',
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
