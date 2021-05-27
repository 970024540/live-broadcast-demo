var app=getApp();
Component({
  options: {
    addGlobalClass: true
  },
  properties: { 
    showCouponModal:{
      type:Boolean,
      value:false,
      observer(newVal, oldVal, changedPath){
        if (newVal){
          this.setData({
            showModal:true
          })
        }else{
          this.setData({
            showModal: false
          })
        }
      }
    },
    total_amount:{
      type:Number,
      value:0,
      observer(newVal, oldVal, changedPath){
        if (newVal){
          this.setData({
            amount: newVal
          })
        }
      }
    }
    
  },
  data:{
    showModal:false,
    amount:0,
    imgSrc: app.globalData.host +'/yinger-m/img/1111/randomTicket_2x.png'
  },
  methods: { 
    hideCouponModal(){
      this.triggerEvent("onHideCouponModal",false);
    }
  }
})