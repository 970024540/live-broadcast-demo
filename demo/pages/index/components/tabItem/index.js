Component({
  relations: {
    '../tab/index': {
      type: 'parent'
    }
  },
  properties: {
    key: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    defaultColor: {
      type: String,
      value: '#636363'
    },
    activeColor: {
      type: String,
      value: '#de2453'
    },
    lineColor: {
      type: String,
      value: '#de2453'
    },
    scroll:{
      type:Boolean,
      value:false
    },
    length:{
      type: Number,
      value: 0
    },
    current:{
      type: Number,
      value: 0
    },
    tabShadowColor:{
      type: String,
      value: 'none'
    }
  },
  data: {
    // current: false
  },
  methods: {
    changeCurrent (current) {
      this.setData({ current });
    },
    handleClickItem () {
      const parent = this.getRelationNodes('../tab/index')[0];
      parent.emitEvent(this.data.key);
    }
  }
});
