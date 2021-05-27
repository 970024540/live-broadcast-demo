Component({
  name:"xModal",
  options:{
    multipleSlots:true,
    addGlobalClass: true
  },
  properties:{
    isBackColor:{
      type:Boolean,
      value:true
    }
  },
  data:{
    
  },
  methods:{
    closeModal(){
      this.triggerEvent("onClose");
    },

  }
})
