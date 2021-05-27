// pages/index/components/tabbarMiddle/index.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  properties: {
    other: {
      type: Object,
      value: {
        bgColor: '#fff',         // 分组 bar 背景颜色
        lineColor: '#de2453',    // 底部横条颜色
        activeColor: '#333',     // 选中颜色(字体)
        defaultColor: '#454552', // 默认颜色(字体)
        tabGradient:'',          // tab选中渐变
      }
    },
    current: {
      type: String,
      value: '',
      observer: 'changeCurrent'
    },
    tabData:{
      type:Array,
      value:[]
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
    handleClickItem (e) {
      this.triggerEvent('change', {key:e.currentTarget.dataset.i});
    }
  }
})
