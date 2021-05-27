
Component({
  options: {
    addGlobalClass: true
  },
  properties:{
    title:{
      type:String,
      default:'',
    },
    value:{
      type:String,
      default:''
    },
    type:{
      type:String,
      default:'item'
    },
    icon:{
      type:String,
      default:null
    }
  }
})
