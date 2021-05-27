Component({
  // 不做动画了,小程序 DOM 不好用
  relations: {
    '../tabItem/index': {
      type: 'child'
    }
  },
  properties: {
    current: {
      type: String,
      value: '',
      observer: 'changeCurrent'
    },
    bgcolor: {
      type: String,
      value: ''
    },
    bgImage:{
      type: String,
      value: ''
    },
    scrollType:{
      type:String,
      value:'1'   // '1':默认不居中，横向滚动   '2'：居中，不滚动
    }
  },
  methods: {
    changeCurrent (val = this.data.current) {
      let items = this.getRelationNodes('../tabItem/index');
      items.forEach(item => {
        item.changeCurrent(val);
      })
    },
    emitEvent (key) {
      this.triggerEvent('change', { key });
    }
  }
});
