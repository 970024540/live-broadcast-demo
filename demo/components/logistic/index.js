Component({
  properties: {
    logi_name:{
      type:String,
      value:''
    },
    logi_no:{
      type:String,
      value:''
    },
    show: {
      type: Boolean,
      value: false
    },
    data: {
      type: Array,
      value: []
    }
  },
  methods: {
    close() {
      this.triggerEvent("close");
    }
  }
})