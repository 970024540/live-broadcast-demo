Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  data:{

  },
  properties:{
    x:{
      type:Number,
      value:0,
    },
    y:{
      type:Number,
      value:0,
    }
  },
  methods:{
    handlerTouchMove:function(e){
      let _x=e.touches[0].clientX-30;
      let _y=e.touches[0].clientY-30;
      let offsetX=e.currentTarget.offsetLeft-60;
      let offsetY=e.currentTarget.offsetTop-60;
      this.setData({
        x:_x,
        y:_y
      })
    }
  }
})
