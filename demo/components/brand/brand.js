Component({
  options: {
    addGlobalClass: true,
  },
  properties:{
    type: {
      type: Number,
      value: 1    // 1-集团logo 2-粉狗头
    },
    width:{
      type:Number,
      value:154
    },
    height:{
      type:Number,
      value:154
    }
  },
  data: {
    src: 'http://mall.yingerfashion.com//yinger-m/img/logo_300.png'
  },
  attached() {
    let type = this.properties.type;
    if (type == 1) {
      this.setData({src: 'http://mall.yingerfashion.com//yinger-m/img/logo_300.png'})
    } else if (type == 2) {
      this.setData({ src: 'http://mall.yingerfashion.com/yinger-m/img/logo_dog.png'})
    }
  }
})
