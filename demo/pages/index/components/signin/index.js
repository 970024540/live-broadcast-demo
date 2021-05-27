// pages/index/components/signin/index.js
const app = getApp();
const {formatTime, jumpToUrl, px2rpx} = require('../../../../utils/index');
const md5 = require ('../../../../miniprogram_npm/md5/index');
const screenWidth = wx.getSystemInfoSync().screenWidth;
const modalContentWidth = px2rpx(300);
const _static_days = 719528; // 从0年1月1日到1970年1月1日的天数
Component({
  /**
   * 组件的属性列表
   */
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    data: {
      type: Object,
      value: () => {
        return {}
      },
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 外部样式
    moduleStyle: '',
    // 内容样式
    signinStyle: '',
    // 样式配置
    options: {
      marginRl: 10,
      paddingTb: 20,
      paddingRl: 20,
      borderRadius: 20,
      contentRadius: 10,
      offsetHeight: 20,
      bgColor: '#fff',
      primaryColor: '#fda9bf', // 主题色
      ruleItemActiveColor: '#ffd2dd', // 待领取背景色
      ruleItemGotColor: '#ffffff', // 已领取背景色
      ruleItemDisabledColor: '#d09aa9', // 未激活背景色
      bannerBg: '', // banner背景图
      iconImg: '', // 图标
      iconImgActive: '', // 激活状态图标
      packageImg: '', // 礼包弹框图
      myPrizeColor: '#9c3f56',
      myPrizeBgColor: '#feceda',
    },
    defaultDayImg: null,
    modalImgMap: {
      // 1: {},
      // makeUpModal: {},
      // makeUpOk: {},
      // makeUpFail: {},
    },

    // 签到配置
    member_id: '',
    signinRuleId: -1,
    
    signInRule: {
      signInData: [],
      type: 0, // 签到类型 0连续 1累计
      sign_type: 0, // 1, 日常签到; 2, 活动签到
    },
    noticeArr: '',
    formatSignInData: {},
    ruleItem: [],
    daysList: [],
    signinPrizeList: {}, // 达到签到天数后可领的奖品列表
    showPopupType: -1, // 1, 签到规则；2已领取奖品列表；3礼包奖品弹框；4补签文案弹框；5补签成功，6补签失败， 7，每日签到弹框,8助力列表
    popupBgImg: {
      img: '',
    }, // 弹框背景根据弹框类型动态计算，showPopupType > 2 时才会有
    prizePopupDays: -1, // 点击领取时弹出奖品框，标记第几天的奖品
    today: '', //今天 格式 20200303
    shareMemberId: '', // 分享人ID
    makeUpSignInId: '', // 助力签到的id，
    totalSigninDays: [0, 0],
    ruleItemWidth: '25%',
    prizeGetedList: [],
    prizeNotGetList: [],
    today: '',
    user_point: 0,
    // 日常签到
    cycle: 3, // 周期长度
    cycleArr: [], // 本周期天数数组
    nowToZero: 0, // 今天的天数
    cycleFirstDay: 0, // 本周期的第一天的天数
    cycleSignInData: {}, // 已签到数据
    // 临时数据
    showPopupType_point: 38, //每日签到弹框的积分数
    showPopupType_days: 10, // //每日签到弹框的天数

    showAddrInfo: false,

    canMakeUpDay: '', // 能够补签的天数， 用于限制只能倒序补签
    makeUpList: [],
    makeUpListLoadedAll: false,
  },

  lifetimes: {
    attached() {
      this.updateUserInfo();
      let { marginTb, marginRl, paddingTb, paddingRl, borderRadius, bgColor, signinRuleId, options, modalImgList = [] } = this.data.data;
      options.dayPointTop = px2rpx(options.dayPointTop);
      options.dayPointLeft = px2rpx(options.dayPointLeft);
      options.dayPointFontSize = px2rpx(options.dayPointFontSize);
      options.dayIndexTop = px2rpx(options.dayIndexTop);
      options.dayIndexLeft = px2rpx(options.dayIndexLeft);
      options.dayIndexFontSize = px2rpx(options.dayIndexFontSize);
      
      // 弹框图处理
      this.handleModalImg(modalImgList);
      this.setData({
        signinRuleId,
        moduleStyle: `margin: ${marginTb *2 }rpx ${marginRl * 2}rpx;padding:${paddingTb * 2}rpx ${paddingRl * 2}rpx;border-radius:${borderRadius * 2}rpx;background-color: ${bgColor}`,
        signinStyle: `margin:${-options.offsetHeight * 2}rpx ${options.marginRl * 2}rpx 0 ${options.marginRl * 2}rpx; padding:${options.paddingTb * 2}rpx ${options.paddingRl * 2}rpx; border-radius:${options.borderRadius * 2}rpx; background-color: ${options.bgColor}`,
        options: Object.assign({}, this.data.options, options),
      })
      this.getSignIn();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showMakeUpList () {
      this.setData({
        makeUpListLoadedAll: false,
        makeUpList: [],
      }, () => {
        this.getMakeUpList();
      })
    },
    getMakeUpList () {
      let {signInRule, makeUpListLoadedAll, makeUpList, member_id} = this.data;
      if (makeUpListLoadedAll) {
        return;
      }
      let params = {
        ruleId: signInRule.id,
        page: (parseInt(makeUpList.length / 10) + 1) || 1,
        limit: 10,
        member_id,
      }
      wx.showLoading({
        title: '正在请求',
        mask: true,
      })
      app.mall_api_post('/api/mobile/marketing/sign/helpList', params, res => {
        wx.hideLoading();
        let arr = makeUpList;
        if (res.status == 'success') {
          let data = res.data || [];
          // data = Array.from({length: arr.length == 30 ? 5 : 10}).map(v => {
          //   return {
          //     name: '小棉花',
          //     created_at: '2020-08-09 09:08:12',
          //     status: true,
          //   }
          // })
          makeUpListLoadedAll = data.length < 10;
          data.map(v => {
            v.member = v.member || {};
            v.member_openid = v.member_openid || {};
            let obj = {
              name: v.member.nickname || v.member_openid.nickname || '小棉花',
              time: v.created_at || '不久之前',
              status: true,
            }
            arr.push(obj);
          })
        } else {
          makeUpListLoadedAll = true;
          if (res.code == 401) {
            wx.showToast({
              title: '请登录',
              icon: 'none',
            })
          }
        }
        this.setData({
          makeUpListLoadedAll,
          makeUpList: arr,
          showPopupType: 8,
        })
      }, e => {
        wx.hideLoading();
        this.setData({
          makeUpListLoadedAll: true,
          makeUpList: [],
          showPopupType: 8,
        })
      })
    },
    handleModalImg (list) {
      let defaultDayImg = null;
      let modalImgMap = {};
      list.map(item => {
        let {
          type,
          days,
          isDefault,
          img,
          imgWidth,
          imgHeight,
          showBtn,
          btnTop,
          btnLeft,
          btnWidth,
          btnHeight,
          btnLink,
          showDays,
          daysTop,
          daysLeft,
          daysSize,
          daysColor,
          showPoint,
          pointTop,
          pointLeft,
          pointSize,
          pointColor,
        } = item;
        // 以600rpx定宽显示时以下数值直接 *2 即可， 若不是600需重新计算系数 公式: (600 / px2rpx(300)) * px2rpx(px)
        item.imgWidth = imgWidth * 2;
        item.imgHeight = imgHeight * 2;
        item.btnTop = btnTop * 2;
        item.btnLeft = btnLeft * 2;
        item.btnWidth = btnWidth * 2;
        item.btnHeight = btnHeight * 2;
        item.daysTop = daysTop * 2;
        item.daysLeft = daysLeft * 2;
        item.daysSize = daysSize * 2;
        item.pointTop = pointTop * 2;
        item.pointLeft = pointLeft * 2;
        item.pointSize = pointSize * 2;
        if (type == 'days') {
          modalImgMap[days] = item;
          if (isDefault == 1) defaultDayImg = item;
        } else {
          modalImgMap[type] = item;
        }
      })
      this.setData({
        defaultDayImg,
        modalImgMap,
      })
    },
    computePrizeList () {
      let {signinPrizeList, prizePopupDays} = this.data;
      let arr = Object.values(signinPrizeList);
      let prizeGetedList = [];
      let prizeNotGetList = [];
      for (let i in signinPrizeList) {
        let k = signinPrizeList[i];
        k.prizeInfo && k.prizeInfo.map(v => {
          v.days = k.days;
          if (v.receive_status == 1) prizeGetedList.push(v);
          if (v.receive_status == 0 && k.days == prizePopupDays) prizeNotGetList.push(v);
        })
      }
      this.setData({
        prizeGetedList,
        prizeNotGetList
      })
    },
    // 签到补签
    doMakeUpSignIn({currentTarget}) {
      if (!this.data.member_id) {
        this.triggerEvent('showLoginModal', {}, {bubbles: true, composed: true});
        return this.toast('请登录');
      }
      let item = currentTarget.dataset.item;
      let {signInRule, cycleArr, nowToZero, modalImgMap, canMakeUpDay} = this.data;
      let  {usable_make_up_nums, sign_type} = signInRule;
      if ((sign_type == 1 && canMakeUpDay != item) || (sign_type == 2 && canMakeUpDay != item.date)) return;
      // 至少签到过一次后才可以补签
      if (signInRule.signInData.length == 0) {
        return wx.showToast({
          title: '完成首次签到后才可以补签哦',
          icon: 'none',
        })
      }
      if (usable_make_up_nums == 0) {
        this.setData({
          showPopupType: 4,
          popupBgImg: modalImgMap['makeUpModal'] || {img: ''},
        })
        return;
      }
      if (sign_type == 1) {
        // 日常签到
        // 根据当前天数和今天的天数反推补签日期
        let now = Date.now();
        let todayIndex = cycleArr.findIndex(v => v == nowToZero);
        let makeUpIndex = cycleArr.findIndex(v => v == item);
        let nowTime = new Date(`${formatTime(now, 'yyyy/MM/dd')} 08:00:00`).getTime();
        let reportTime = formatTime(nowTime - (todayIndex - makeUpIndex) * 24 * 3600000, 'yyyy-MM-dd') + ' 08:00:00';
        this.doSignIn(reportTime);
      } else if (sign_type == 2) {
        // 活动签到
        let date = item.date;
        let reportTime = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)} 08:00:00`;
        this.doSignIn(reportTime);
      }
    },
    signInNow () {
      this.doSignIn();
    },
    doSignIn (reportTime = '') {
      if (!this.data.member_id) {
        this.triggerEvent('showLoginModal', {}, {bubbles: true, composed: true});
        return this.toast('请登录');
      }
      let {options, signInRule, formatSignInData, cycleSignInData, cycleArr, nowToZero, today, shareMemberId, modalImgMap, defaultDayImg, member_id} = this.data;
      if (!reportTime && formatSignInData[today]) {
        // 活动签到今日已签
        return;
      }
      if (!reportTime && cycleSignInData[nowToZero]) {
        // 日常签到今日已签
        return;
      }
      let params = {member_id};
      if (shareMemberId) {
        params.shareMemberId = shareMemberId;
      }
      // 有此参数为补签
      if (reportTime) {
        params.reportTime = reportTime;
      }
      wx.showLoading({
        title: '正在请求',
        mask: true,
      })
      app.mall_api_post('/api/mobile/marketing/signIn', params, res => {
        wx.hideLoading();      
        if (res.status == 'success') {
          signInRule = Object.assign({}, signInRule, res.data);
          let point = res.data.point || 0;
          app.saTrack('dailySign', {gainPoints: point - 0});
          let showPopupType = -1;
          let showPopupType_days = 0;
          let popupBgImg = {img: ''};
          if (!reportTime) {
            showPopupType = 7;
            showPopupType_days = signInRule.sign_type == 1 ? cycleArr.findIndex(v => v == nowToZero) + 1 : signInRule.signInCount;
            popupBgImg = modalImgMap[showPopupType_days] || defaultDayImg || {img: ''};
            if (!popupBgImg.img) {
              showPopupType_days = 0;
              showPopupType = -1;
              let info = '签到成功';
              if (point) info += ` ,获得${point}积分`;
              this.toast(info);
            }
          } else {
            showPopupType = 5;
            popupBgImg = modalImgMap['makeUpOk'] || {img: ''};
            if (!popupBgImg.img) {
              showPopupType = -1;
              let info = '补签成功';
              if (point) info += ` ,获得${point}积分`;
              this.toast(info);
            }
          }
          
          let len = signInRule.signInCount || 0;
          this.setData({
            showPopupType,
            popupBgImg,
            showPopupType_point: showPopupType == 7 ? point : 0,
            showPopupType_days: showPopupType_days,
            signInRule,
            totalSigninDays: len > 9 ? [parseInt(len/10),  len%10] : [0, len],
          })

          if (signInRule.sign_type == 1) {
            //日常签到
            this.handleSignInData(signInRule.signInData, signInRule.cycle);
          } else {
            this.getDateRange(signInRule.start_time, signInRule.end_time);
            this.getPrizeList(signInRule.id);
          }
        } else {
          if (reportTime) {
            let popupBgImg = modalImgMap['makeUpFail'] || {img: ''};
            this.toast(res.message || '补签失败');
            if (popupBgImg.img) {
              this.setData({
                popupBgImg,
                showPopupType: 6,
              })
            }
          } else {
            this.toast(res.message || '签到失败');
            if (res.message == '您当天已经签到') {
              cycleSignInData[nowToZero] = true;
              formatSignInData[today] = true;
              setTimeout(() => {
                this.getSignIn();
              }, 2000)
            }
          }
        }
      }, e => {
        wx.hideLoading();
        if (reportTime) {
          let popupBgImg = modalImgMap['makeUpFail'] || {img: ''};
          if (!popupBgImg.img) {
            this.toast('补签失败');
          } else {
            this.setData({
              popupBgImg,
              showPopupType: 6,
            })
          }
        } else {
          this.toast(e.message || '签到失败');
        }
      })
    },
    // 为他人助力签到
    doMakeUpSignInForFriend (makeUpSignInId, shareMemberId) {
      wx.showLoading({
        title: '正在请求',
        mask: true,
      })
      app.mall_api_post('/api/mobile/marketing/helpSignIn', {
        signInRuleId: makeUpSignInId,
        shareMemberId: shareMemberId,
        member_id: this.data.member_id || '',
      }, res => {
        wx.hideLoading();
        if (res.status == 'success') {
          this.toast('助力成功');
        } else {
          this.toast(res.message || '助力失败');
        }
      }, e => {
        wx.hideLoading();
        if (e.message == '助力失败，当前活动分享人还未参加') {
          this.toast('对方还未签到，分享将不能增加补签次数');
        } else {
          this.toast(e.message || '助力失败');
        }
      })
    },
    getSignIn() {
      wx.showLoading({
        title: '正在请求',
        mask: true,
      })
      app.mall_api_get('/api/mobile/marketing/getSignInRule', {member_id: this.data.member_id || ''}, res => {
        wx.hideLoading();
        if (res.status == 'success' && res.data) {
          let data = res.data;
          let w = 100 / (data.rule_item.length || 1);
          let len = data.signInCount || 0;
          let today = this.getDateStr(parseInt(Date.now() / 1000)).date;
          data.rule_item.map((v, i) => {
            v.conditions_award = JSON.parse(v.conditions_award);
          })
          this.setData({
            sign_type: data.sign_type,
            signInRule: data,
            ruleItem: data.rule_item,
            noticeArr: data.notice ? data.notice.split('|') : [],
            ruleItemWidth: `${w < 25 ? 25 : w}%`,
            totalSigninDays: len > 9 ? [parseInt(len / 10), len % 10] : [0, len],
            today
          })
          if (data.sign_type == 1) {
             //日常签到
            this.handleSignInData(data.signInData, data.cycle);
          } else {
            this.getDateRange(data.start_time, data.end_time);
            this.getPrizeList(data.id);
          }
          if (this.data.options.showPoint) {
            this.getOrderStatusNum();
          }

          data.url = this.data.options.shareImg;

          this.triggerEvent('getSignIn', data, {bubbles: true, composed: true});
          

          
        } else {
          this.toast('活动已过期！');
          wx.navigateBack();
        }
      }, e => {
        wx.hideLoading();
        this.toast(e.message || '活动已过期！！');
        if (e.message == '') {
          wx.navigateBack();
        }
      })
    },
    // 根据开始和结束时间计算活动签到的日期list
    getDateRange(start, end) {
      // 边界处理
      start = new Date(new Date(start * 1000).toLocaleDateString()) / 1000;
      end = new Date(new Date(end * 1000).toLocaleDateString()) / 1000;
      // list处理
      let signInedList = {};
      let list = this.data.signInRule.signInData || [];
      list.map(item => {
        let key = item.sign_in_time.slice(0, 10).replace(/-/g, '');
        signInedList[key] = true;
      })
      const day = 24 * 3600; // 一天
      let today = this.data.today;
      let daysList = [];
      let step = start;
      let canMakeUpDay = '';
      do {
        let { date, label } = this.getDateStr(step);
        step += day;
        let obj = {
          date, // 用于和已签到数据比较
          label, //用于显示
          status: !!signInedList[date], // 签到状态
          type: today == date ? 'current' : (today > date ? 'past' : 'coming'), // 过去 今天 还是未来？ past current coming
        }
        if (!signInedList[date] && today > date) {
          canMakeUpDay = date;
        }
        daysList.push(obj);
      } while (step <= end);
      this.setData({
        canMakeUpDay,
        daysList,
        formatSignInData: Object.assign({}, signInedList),
      })
    },
    getDateStr(timestamp) {
      let _date = new Date(timestamp * 1000);
      const Y = _date.getFullYear() + '';
      const M = _date.getMonth() + 1;
      const D = _date.getDate();
      let obj = {
        date: `${Y}${M > 9 ? M : '0' + M}${D > 9 ? D : '0' + D}`,
        label: `${M}月${D > 9 ? D : '0' + D}号`,
      }
      return obj;
    },
    // 处理日常签到数据, 根据已签到数据计算确定签到的第一天是哪一天
    handleSignInData (signInData, cycle) {
      // console.log(signInData)
      // signInData = [{
      //   days: 737911
      // }]
      let now = Date.now();
      // 最早签到的一天的天数
      let earliestDay = 0;
      // 上次签到的天
      let lastDay = 0;
      
      if (signInData.length) {
        signInData.sort((a, b) => a.days - b.days);
        earliestDay = signInData[0].days;
        lastDay = signInData[signInData.length - 1].days;
      }
      let nowToZero = _static_days + new Date(`${formatTime(now, 'yyyy/MM/dd')} 08:00:00`).getTime() / 24 / 3600000;
      if (lastDay > nowToZero) {
        console.error('签到数据错误: ', earliestDay, nowToZero);
        return;
      }
      // 根据第一天签到的时间和周期计算当前周期应签的天数
      let remainder = (nowToZero - earliestDay + 1) % cycle;
      // 计算本周期应签到的第一天的天数
      let cycleFirstDay = nowToZero - remainder + 1;

      /**
       * 修正, 
       * earliestDay为0说明一次也没签, 确保cycleFirstDay === nowToZero
       * 当最后一天签到距离cycleFirstDay大于一个周期cycleFirstDay修正为今天
       * 当最后一天签到距离cycleFirstDay小于一个周期cycleFirstDay修正为lastDay
       */
      if (earliestDay == 0) {
        cycleFirstDay = nowToZero;
      } else {
        let tempFirstDay = earliestDay;
        // console.log('------', tempFirstDay)
        signInData.map(v => {
          let days = v.days;
          if (days - tempFirstDay >= cycle) {
            tempFirstDay = days;
            // console.log('------', tempFirstDay)
          }
        })
        if (nowToZero - tempFirstDay >= cycle) {
          tempFirstDay = nowToZero;
        }
        // console.log('------', tempFirstDay)
        cycleFirstDay = tempFirstDay;
      }
      
      
      
      // 存储已签到数据
      let cycleSignInData = {};
      signInData.map(v => {
        if (v.days >= cycleFirstDay) cycleSignInData[v.days] = true;
      })
      // 生成本周期的天数数组
      let cycleArr = [];
      let canMakeUpDay = '';
      for (let i = cycleFirstDay; i < cycleFirstDay + cycle; i++) {
        cycleArr.push(i);
        if (!cycleSignInData[i] && i < nowToZero) {
          canMakeUpDay = i;
        }
      }
      // console.log(cycle,
      //   cycleArr,
      //   nowToZero,
      //   cycleFirstDay,
      //   cycleSignInData,)
      this.setData({
        cycle,
        cycleArr,
        nowToZero,
        cycleFirstDay,
        cycleSignInData,
        canMakeUpDay,
      })
    },
    getPrizeList (signInRuleId) {
      // 获取达到天数后的奖品列表
      app.mall_api_post('/api/mobile/marketing/prizeList', {member_id: this.data.member_id, signInRuleId}, res => {
        if (res.status == 'success') {
          let data = res.data;
          // 格式化数据
          let obj = {};
          data.map(item => {
            let {days, prizeInfo} = item;
            if (prizeInfo.length) {
              if (!obj[days]) {
                obj[days] = {
                  days: days,
                  received_all: false,
                  prizeInfo: [], // 累计签到状态下，同一个可领的天数可能有多个, 合并奖品项
                };
              }
              obj[days].prizeInfo.push(...prizeInfo);
              let receivedLength = obj[days].prizeInfo.filter(v => v.receive_status == 1).length;
              obj[days].received_all = receivedLength == obj[days].prizeInfo.length;
            }
          })
          this.setData({
            signinPrizeList: obj
          }, () => {
            this.computePrizeList();
          })
        }
        if (this.data.options.showPoint) {
          this.getOrderStatusNum();
        }
      })
    },
    getOrderStatusNum () {
      // app.mall_api_get('/api/mobile/members/getOrderStutusSum', {}, res =>{
      //   if (res.status = 'success' && res.code == 200) {
      //     this.setData({ user_point: res.data.point || 0 })
      //   }
      // })
    },
    getPrizeByDay ({currentTarget}) {
      let item = currentTarget.dataset.item;
      let {signinPrizeList, signInRule, options} = this.data;
      if (signinPrizeList[item.days]) {
        if (signinPrizeList[item.days].received_all) {
          this.toast('奖品已领取');
        } else {
          this.setData({
            prizePopupDays: item.days,
          }, () => {
            let itemImg = item.conditions_award && item.conditions_award.modalImg ? item.conditions_award.modalImg : '';
            this.setData({
              showPopupType: 3,
              popupBgImg: {img: itemImg || options.packageImg || ''},
            })
            this.computePrizeList();
          })
        }
      } else if (item.days <= signInRule.signInCount) {
        this.toast('很遗憾,未中奖!');
      }
    },
    chooseGiftAddress ({currentTarget}) {
      let item = currentTarget.dataset.item;
      this.data.showAddressGift = item;
      this.setData({
        showAddrInfo: true,
      })
    },
    changeAddrId ({detail}) {
      console.log(detail)
      this.data.selectedAddrId = detail.addr_id;
    },
    changeShowAddr () {
      this.setData({
        showAddrInfo: false,
      })
    },
    sumbitAddrInfo () {
      if (this.data.showAddressGift && this.data.selectedAddrId) {
        this.doReceivePrize(this.data.showAddressGift, this.data.selectedAddrId);
      } else {
        this.toast('请选择地址');
      }
      this.data.selectedAddrId = '';
      this.data.showAddressGift = '';
      this.setData({
        showAddrInfo: false,
      })
    },
    handleDoReceivePrize ({currentTarget}) {
      let item = currentTarget.dataset.item;
      this.doReceivePrize(item);
    },
    doReceivePrize (item, addrId = '') {
      wx.showLoading({
        title: '正在请求',
        mask: true,
      })
      let {member_id} = this.data;
      let {type, prize} = item;
      let params = {
        member_id,
        type,
        time: Date.now(),
      };
      if (type == 'point') {
        params.pointNum = prize;
        params.reason = '签到得积分';
      } else if (type == 'gift') {
        params.target_id = prize;
        params.addr_id = addrId;
      } else if (type == 'coupon') {
        params.target_id = prize;
        params.show_status = 22;
        params.association_mark = 'mall_sign_in';
      }
      let obj = {
        api_account: 'yingers',
        api_password: 'yingers123',
        data: JSON.stringify(params),
        mark: md5(`${JSON.stringify(params)}activity`),
      }
      app.tokan_api_post('mobileapi.activity.givingPrize', obj, res => {
        wx.hideLoading();
        if (res.rsp == 'succ') {
          this.toast('领取成功');
          let {signinPrizeList, prizePopupDays, showPopupType} = this.data;
          let obj = signinPrizeList[item.days];
          let receivedLength = 0;
          obj.prizeInfo.map(v => {
            if (v.id == item.id) v.receive_status = 1;
            if (v.receive_status == 1) receivedLength += 1;
          })
          obj.received_all = receivedLength == obj.prizeInfo.length;
          // 当前签到天数的奖品已全部领完，关闭弹框
          if (obj.received_all) {
            prizePopupDays = -1;
            showPopupType = -1;
          }
          this.setData({
            signinPrizeList, prizePopupDays, showPopupType
          }, () => {
            this.computePrizeList();
          })
        } else {
          this.toast(res.data);
        }
      })
    },
    doHelpSignIn () {
      let {signInRule, member_id} = this.data;
      let {id, help_sign_status} = signInRule;
      if (!member_id) {
        this.triggerEvent('showLoginModal', {}, {bubbles: true, composed: true});
        return this.toast('请登录');
      }
      wx.showLoading({
        title: '正在请求',
        mask: true,
      })
      app.mall_api_post('/api/mobile/marketing/helpSignIn', {
        signInRuleId: id,
        shareMemberId: member_id,
        member_id,
      }, res => {
        wx.hideLoading();
        if (res.status == 'success') {
          if (help_sign_status == 0) {
            this.toast('助力成功');
            signInRule.usable_make_up_nums += 1;
            this.setData({
              signInRule
            })
          } else {
            this.toast('分享成功, 等待好友完成助力');
          }
        } else {
          this.toast(res.message || '助力失败');
        }
      }, e => {
        wx.hideLoading();
        if (e.message == '助力失败，当前活动分享人还未参加') {
          this.toast('您还未签到，分享将不能增加补签次数');
        } else {
          this.toast(e.message || '网络错误, 助力失败');
        }
      })
    },
  
    toast (msg) {
      return wx.showToast({
        title: msg,
        icon: 'none'
      })
    },
    closePopup () {
      this.setData({
        showPopupType: 0,
      })
    },
    setShowPopupType ({currentTarget}) {
      let type = currentTarget.dataset.type;
      this.setData({
        showPopupType: type,
        popupBgImg: {img: ''}
      })
    },
    updateUserInfo () {
      let user_info = app.getLocalUserInfo();
      if (!!user_info) {
        this.setData({
          member_id: user_info.member_id,
          user_info: user_info,
        })
      }
    },
    dd () {},
    modalBtnClick ({currentTarget}) {
      let link = currentTarget.dataset.link;
      let urlObj = jumpToUrl(link);
      let {type, url} = urlObj;
      type == 'tabbar' ? wx.switchTab({
        url,
      }) : wx.navigateTo({
        url,
      })
    },
    handleQuery (query) {
      let {mid, msid} = query;
      this.setData({
        shareMemberId: mid,
        makeUpSignInId: msid,
      })
    },
  }
})
