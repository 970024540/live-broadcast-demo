const app = getApp();
let {
  globalData,
  notokan_api_post,
  reg_mobile,
  regCn,
  regEn,
  getLocalUserInfo
} = app;
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  properties: {
    showAddrList: {
      type: Boolean,
      default: false,
    },
    showIdCard: {
      type: Boolean,
      default: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    member_id: '',
    addressList: [],
    selectAddr: {},
    selectAddId: 0,
    addrCollapse: true,
    showAddressPopup: false,
    regionAddr: [],
    area: '', // 地区
    addr: '', // 详细地址
    /*** 修改或新增地址所需参数****/
    addr_id: '', // 修改地址时才有，否则为空
    name: '', // 姓名
    mobile: '', // 手机号
    tel: '', // 电话
    zip: '', // 邮编
    addr: '', // 详细地址
    idcard: '', // 身份证(非必须)
    idcard_face_url: '', //身份证正面
    idcard_name: '', //身份证名字
    idcard_address: '',
    idcard_birth: '',
    idcard_nation: '',
    idcard_sex: '',
    idcard_back_url: '',
    idcard_invalid_date: '',
    idcard_sign_date: '',
    idcard_sign_office: '',
    /*** 修改或新增地址所需参数结束****/
  },
  lifetimes: {
    created () {
      this.getAddressList();
    },
  },
  created() {
    this.getAddressList();
   },
  /**
   * 组件的方法列表
   */
  methods: {
    changeInput (e) {
      let name = e.target.dataset.name;
      let value = e.detail.detail.value;
      this.setData({
        [name]: value
      })
    },
    handleRadioChange(e) {
      //勾选地址
      let id = e.detail.value;
      let selectAddr = {};
      let addr_data = this.data.addressList;
      addr_data.forEach((item, index) => {
        if (item.addr_id == id) {
          selectAddr = item;
        }
      })
      this.setData({
        selectAddId: id,
        selectAddr,
        addrCollapse: true
      })
      this.triggerEvent('onChange', selectAddr);
    },
    getAddressList (edit_id = 0) {
      let user_info = wx.getStorageSync('user_info');
      if (!!user_info &&user_info.member_id){
        this.setData({
          member_id: user_info.member_id
        })
        app.notokan_api_post('mobileapi.member.receiver', {
          member_id: user_info.member_id
        }, (res) => {
          if (res.rsp == 'succ') {
            let data = res.data;
            let selectAddId = 0;
            let selectAddr = {};
            let addrList = [];
            let len = data.length;
            for (let i = len; i > 0; i--) {
              let addr_obj = data[i - 1];
              addr_obj.checked = false;
              if (addr_obj.addr_id == edit_id) {
                selectAddr = addr_obj;
                selectAddId = addr_obj.addr_id;
                addr_obj.checked = true;
              } else if (i == len || addr_obj.def_addr == '1') {
                selectAddr = addr_obj;
                selectAddId = addr_obj.addr_id;
                addr_obj.checked = true;
              }
              addrList.push(addr_obj);
            }
            this.setData({
              addressList: addrList,
              selectAddId,
              selectAddr
            });
            this.triggerEvent('onChange', selectAddr);
            this.triggerEvent('onGetListOk', addrList);
          }
        })
      } else{
        wx.showToast({
          title: '请登录',
          icon: 'none'
        })
      }
    },
    collapseAddr() {
      this.setData({
        addrCollapse: !this.data.addrCollapse
      })
    },
    chooseWxAddress() {
      let addressList = this.data.addressList;
      wx.chooseAddress({
        success: (res) => {
          let addr_obj = null;
          let {
            userName,
            postalCode,
            provinceName,
            cityName,
            countyName,
            detailInfo,
            nationalCode,
            telNumber
          } = res;
          if (/(北京市|上海市|天津市|重庆市)/.test(provinceName)) {
            cityName = provinceName;
            provinceName = provinceName.replace('市', '');
          }
          let wxarea = `${provinceName}/${cityName}/${countyName}`;
          for (let i = 0, l = addressList.length; i < l; i++) {
            let item = addressList[i];
            item.checked = false;
            let {
              name,
              zip,
              area,
              addr,
              mobile
            } = item;
            let addr_already_add = name == userName && mobile == telNumber && area == wxarea && addr == detailInfo;
            if (addr_already_add) {
              addr_obj = item;
              item.checked = true;
            }
          }
          if (addr_obj) {
            this.setData({
              addressList,
              selectAddr: addr_obj,
              selectAddId: addr_obj.addr_id
            })
            this.triggerEvent('onChange', addr_obj);
          } else {
            let info = '';
            if (userName == '' || regEn(userName) || regCn(userName)) {
              info = '姓名格式错误'
            } else if (!reg_mobile(telNumber)) {
              info = '手机号格式错误'
            } else if (wxarea == '') {
              info = '收货地区不能为空'
            } else if (detailInfo == '') {
              info = '详细地址不能为空'
            }
            if (info) return wx.showToast({
              title: info,
              icon: 'none'
            })
            let params = {
              addr: detailInfo,
              area: wxarea,
              name: userName,
              mobile: telNumber,
              zip: postalCode,
              member_id: this.data.member_id,
            };
            this.submit('mobileapi.member.save_rec', params);
          }
        }
      })
    },
    handlePopup (e) {
      let { index, type} = e.currentTarget.dataset;
      if (type == 1) {
        // 修改地址
        let item = this.data.addressList[index];
        this.updateAddr(item);
        this.setData({
          showAddressPopup: true
        })
      } else {
        // 新增地址
        this.setData({
          showAddressPopup: true
        })
        return
        // 关闭获取微信地址
        wx.showActionSheet({
          itemList: ['手动添加', '选择微信收货地址'],
          success: (res) => {
            if (res.tapIndex == 1) {
              this.chooseWxAddress();
            } else if (res.tapIndex == 0) {
              this.setData({
                showAddressPopup: true
              })
            }
          },
          fail: (e) => {
            // this.addNewAddr();
            // this.setData({
            //   showAddressPopup: true
            // })
          }
        })
      }
    },
    updateAddr (item) {
      let {
        addr_id,
        name,
        area,
        addr,
        zip,
        tel,
        mobile,
        identity
      } = item;
      if (identity instanceof Array && identity.length > 0) {
        let {
          id_card,
          face_url,
          back_url
        } = identity[0];
        this.setData({
          idcard: id_card,
          idcard_face_url: face_url,
          idcard_back_url: back_url,
        })
      }
      this.setData({
        addr_id,
        name,
        area,
        regionAddr: area.split('/'),
        addr,
        zip,
        tel,
        mobile,
      });
    },
    reset () {
      this.setData({
        addr_id: '',
        name: '',
        addr: '',
        zip: '',
        tel: '',
        mobile: '',
        regionAddr: [],
        area: '',
        idcard: '', // 身份证(非必须)
        idcard_face_url: '', //身份证正面
        idcard_name: '', //身份证名字
        idcard_address: '',
        idcard_birth: '',
        idcard_nation: '',
        idcard_sex: '',
        idcard_back_url: '',
        idcard_invalid_date: '',
        idcard_sign_date: '',
        idcard_sign_office: '',
      })
      this.selectComponent('#address-picker').reset();
    },
    close () {
      this.setData({
        showAddressPopup: false
      })
      this.reset();
    },
    bindAddrChange ({detail}) {
      this.setData({
        regionAddr: detail,
        area: detail.join('/')
      })
    },
    discernHandle ({detail}) {
      let path = '';
      if (detail.card_side == 0) {
        // 正面
        let idcard = '';
        let name = '';
        let address = '';
        let birth = '';
        let nation = '';
        let sex = '';
        if (detail.success) {
          path = detail.upload.path;
          idcard = detail.discern.idcard;
          name = detail.discern.name;
          address = detail.discern.address;
          birth = detail.discern.birth;
          nation = detail.discern.nation;
          sex = detail.discern.sex; 
        }
        this.setData({
          idcard_face_url: path,
          idcard,
          name,
          idcard_name: name,
          idcard_address: address,
          idcard_birth: birth,
          idcard_nation: nation,
          idcard_sex: sex
        })
      } else if (detail.card_side == 1) {
        // 反面
        let invalid_date = '';
        let sign_date = '';
        let sign_office = '';
        if (detail.success) {
          path = detail.upload.path;
          invalid_date = detail.discern.invalid_date;
          sign_date = detail.discern.sign_date;
          sign_office = detail.discern.sign_office;
        }
        this.setData({
          idcard_back_url: path,
          idcard_invalid_date: invalid_date,
          idcard_sign_date: sign_date,
          idcard_sign_office: sign_office
        })
      }
    },



    confirm () {
      let {
        addr_id, // 修改地址时才有，否则为空
        addr, // 详细地址
        area,  // 地区
        name, // 姓名
        mobile, // 手机号
        tel, // 电话
        zip, // 邮编
        idcard, // 身份证(非必须)
        idcard_face_url, //身份证正面
        idcard_name, //身份证名字
        idcard_address,
        idcard_birth,
        idcard_nation,
        idcard_sex,
        idcard_back_url,
        idcard_invalid_date,
        idcard_sign_date,
        idcard_sign_office,
      } = this.data;

      let params = {
        addr, // 详细地址
        area,  // 地区
        name, // 姓名
        mobile, // 手机号
        tel, // 电话
        zip, // 邮编
        idcard, // 身份证(非必须)
        idcard_face_url, //身份证正面
        idcard_name, //身份证名字
        idcard_address,
        idcard_birth,
        idcard_nation,
        idcard_sex,
        idcard_back_url,
        idcard_invalid_date,
        idcard_sign_date,
        idcard_sign_office,
      }

      let info = '';
      if (name == '' || regEn(name) || regCn(name)) {
        info = '请输入正确姓名'
      } else if (!reg_mobile(mobile)) {
        info = '请输入正确手机号'
      } else if (area == '') {
        info = '请选择收货地区'
      } else if (addr == '') {
        info = '请输入详细地址'
      } else if ((!idcard_face_url && idcard_back_url) || (idcard_face_url && !idcard_back_url)) {
        info = '请上传身份证正反面照片'
      }
      if (info) return wx.showToast({
        title: info,
        icon: 'none'
      })

      if (addr_id) {
        params.addr_id = addr_id;
        params.is_abroad = idcard_face_url && idcard_back_url;
        this.submit('mobileapi.member.update_addr', params);
      } else {
        params.member_id = this.data.member_id;
        this.submit('mobileapi.member.save_rec', params)
      }
    },

    submit (url, params) {
      // 'mobileapi.member.update_addr'
      // mobileapi.member.save_rec
      wx.showLoading({
        title: '正在请求',
        mask: true
      })
      app.notokan_api_post(url, params, res => {
        wx.hideLoading();
        if (res.rsp == 'succ') {
          wx.showToast({
            title: '保存成功!',
          });
          this.getAddressList(params.addr_id || 0);
          this.close();
        } else {
          wx.showToast({
            title: res.data || '保存失败',
            icon: 'none'
          });
        }
      })
    },
    btnSubAddress() {
      this.triggerEvent('addressOk')
    },
    cancelShow() {
      this.triggerEvent('cancelShow')
    }

  }
})
