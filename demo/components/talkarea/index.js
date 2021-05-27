Component({
  data: {
    value: '',
    showPopup:false,
    popupType:0
  },
  methods: {
    onInput({ detail }) {
      let { value } = detail;
      this.data.value = value;
    },
    onConfirm() {
      console.log("发送消息...", this.data.value)
    },
    handlePopup({ currentTarget}){
      let { dataset } = currentTarget;
      let flag=false;
      if (this.data.popupType == dataset.type){
        flag = !this.data.showPopup
      }else{
        flag=true;
      };
      this.setData({
        popupType: dataset.type,
        showPopup: flag
      });
    }
  }
})