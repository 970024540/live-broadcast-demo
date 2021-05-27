var upng = require('./upng-js/UPNG.js')
const tabbars = [
  "/pages/index/index", "/pages/category/index", "/pages/community/index","/pages/newCart/index","/pages/user/index",
];
const pageList = {
  'festivalView': '/packageActive/festivalView/index',
  'catListView': '/packageGoods/goodsListView/index',
  'topicDetailView': '/packageActive/pageDetail/index',
  'brandView': '/packageActive/brandView/index',
  'detailView': '/packageGoods/goodsDetailView/index',
  'good-detail.html': '/packageGoods/goodsDetailView/index',
  'flashSaleView': '/packageActive/flashSaleView/index',
  'category': '/pages/cat/index',
  'index': '/pages/index/index',
  'personalDetails': '/packageCommunity/PersonalDetails/index',
  'discoveryView': '/pages/discoveryView/index',
  'loginView': '/pages/loginByMsg/index',
  'newPreferentialView': '/packageActive/newPreferentialView/index',
  'girlfriendsTicket': '/packageActive/girlfriendsTicket/index',
  'undefined': '/pages/index/index',
  'homeView': '/pages/index/index',
  'userCenterView': '/pages/user/index',
  'cartView': '/pages/newCart/index',
  'orderView': '/packageOrder/order/index',
  'settingView': '/packageUserSetting/userSetting/index',
  'afterSalesView': '/packageOrder/aftersales/index',
}
const formatTime = (time_stamp,type) => {
  var _date = new Date(time_stamp);
  var date1 = {
    'y': _date.getFullYear(),
    'M': _date.getMonth() + 1,
    'd': _date.getDate(),
    'h': _date.getHours(),
    'm': _date.getMinutes(),
    's': _date.getSeconds()
  }
  var date2 = {
    'y': _date.getFullYear(),
    'M': _date.getMonth() + 1 < 10 ? '0' + (_date.getMonth() + 1) : _date.getMonth() + 1,
    'd': _date.getDate() < 10 ? '0' + _date.getDate() : _date.getDate(),
    'h': _date.getHours() < 10 ? '0' + _date.getHours() : _date.getHours(),
    'm': _date.getMinutes() < 10 ? '0' + _date.getMinutes() : _date.getMinutes(),
    's': _date.getSeconds() < 10 ? '0' + _date.getSeconds() : _date.getSeconds()
  }
  switch (type) {
    case 'yyyy-MM-dd':
      return date2.y + '-' + date2.M + '-' + date2.d;
    case 'yyyy.MM.dd':
      return date2.y + '.' + date2.M + '.' + date2.d;
    case 'yyyy-MM-dd hh:mm:ss':
      return date2.y + '-' + date2.M + '-' + date2.d + " " + date2.h + ':' + date2.m + ':' + date2.s;
    case 'yyyy-MM-dd hh_mm_ss':
      return date2.y + '-' + date2.M + '-' + date2.d + " " + date2.h + '_' + date2.m + '_' + date2.s;
    case 'yyyy/MM/dd':
      return date2.y + '/' + date2.M + '/' + date2.d;
    case 'yyyy-MM-dd hh:mm':
      return date2.y + '-' + date2.M + '-' + date2.d + " " + date2.h + ':' + date2.m;
    case 'MM-dd hh:mm:ss':
      return date2.M + '-' + date2.d + " " + date2.h + ':' + date2.m + ':' + date2.s;
    case 'MM/dd hh:mm':
      return date2.M + '/' + date2.d + " " + date2.h + ':' + date2.m;      
    case 'MM-dd hh:mm':
      return date2.M + '-' + date2.d + " " + date2.h + ':' + date2.m;
    case 'MM-dd':
      return date2.M + '.' + date2.d;
    case 'MM.dd hh:mm':
      return date2.M + '.' + date2.d + " " + date2.h + ':' + date2.m;
    case 'MM月dd日hh:mm':
      return date2.M + '月' + date2.d + "日" + date2.h + ':' + date2.m;
    case 'M月dd日h点mm分':
      return date1.M + '月' + date2.d + "日" + date1.h + '点' + date2.m + '分';
    case 'hh:mm:ss':
      return date2.h + ':' + date2.m + ':' + date2.s;
    case 'MM/dd':
      return date1.M + '/' + date2.d;
    case 'hh:mm':
      return date2.h + ':' + date2.m;
    default:
      return "格式不正确";
  }
}
const getUrlParams = function (url) {
  if (!url) return;
  let params = {};
  let arr1 = url.split("?");
  if (arr1.length <= 1) return {};
  let params_str = arr1[1];
  let strs = params_str.split("&");
  strs.forEach((item, index) => {
    if (item.split("=").length > 1) params[item.split("=")[0]] = unescape(item.split("=")[1] || '');
  })
  return params;
}
const ossUrlTest = (url, imageSize)=> {
  var reg = /aliyuncs\.com/ig;
  var reg2 = /^\/storage/;
  var reg3 = /^public\//;
  var reg4 = /^http/;
  let _url = 'https://zone.yingerfashion.com/images/defaultImages/404@320_320.jpg';
  if (reg.test(url)) {
    //阿里云图片
    _url = url.replace('http:', 'https:');
    if (imageSize && url.indexOf('?x-oss-process') == -1) _url = _url + '?x-oss-process=image/resize,m_mfit,h_' + imageSize + ',w_' + imageSize;
  } else if (reg2.test(url)) {
    //商派图片
    _url = 'https://zone.yingerfashion.com' + url;
  } else if (reg3.test(url)) {
    _url = 'https://mall.yingerfashion.com/' + url;
  } else if (reg4.test(url)) {
    _url = url;
  }
  return _url;
}
const get_url_parms_obj=(url)=>{
  let params={};
  //检测是否存在?   decode解析中文字符串
  url = decodeURI(url);
  if (url.indexOf("?") != -1) {
    url = url.split("?")[1];
  } else {
    return {};
  }
  var arr = url.split("&");
  for (var i = 0; i < arr.length; i++) {
    if (!!arr[i]) {
      var arr_ = arr[i].split("=");
      var parm_key = arr_[0];
      var parm_value = arr_[1];
      params[parm_key] = parm_value;
    }
  }
  return params;
}
const joinParams=(params)=>{
  let str = '';
  for (let key in params) {
    str += `${key}=${params[key]}&`;
  }
  str = str.slice(0, -1);
  return str;
}
const handlerLinkTrans=(link)=>{
  //文章
  let page_reg = /topicDetailView/;
  //商品列表
  let catList_reg = /catListView/;
  //商品
  let good_reg = /detailView/;
  let old_good= /good\-detail/;
  let params = get_url_parms_obj(link);
  if (page_reg.test(link)) {
    let page_id = params.page_id;
    return `/packageActive/pageDetail/index?page_id=${page_id}`;
  }
  if (good_reg.test(link) || old_good.test(link)) {
    let str = joinParams(params);
    let _link = `/packageGoods/goodsDetailView/index?${str}`;
    return _link;
  }

  if (catList_reg.test(link)) {
   
    let str = joinParams(params);
    let _link = `/packageGoods/goodsListView/index?${str}`
    return _link;
  }
}
const jump=url=>{
  // wx.navigateTo({
  //   url:url
  // })
}
const getUserInfo=()=>{
  const user_info=wx.getStorageSync('user_info');
  if(typeof user_info=='object'){
    return user_info
  }else{
    return null
  }
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const textWrap = (ctx, obj) => {
  ctx.font = obj.font;
  let arrText = obj.text.split('');
  let line = '';
  let arrTr = [];
  for (let i = 0, l = arrText.length; i < l; i++) {
    var testLine = line + arrText[i];
    var metrics = ctx.measureText(testLine);
    var width = metrics.width;
    if (width > obj.width && i > 0) {
      arrTr.push(line);
      line = arrText[i];
    } else {
      line = testLine;
    }
    if (i == arrText.length - 1) {
      arrTr.push(line);
    }

    if (!!obj.maxLine && arrTr.length >= obj.maxLine) {
      arrTr.splice(-1, arrTr.length - obj.maxLine);
      let lastLine = arrTr[obj.maxLine - 1];
      let lastLineWidth = ctx.measureText(lastLine + '......');
      if (lastLineWidth.width > obj.width) {
        arrTr[obj.maxLine -1] = lastLine.slice(0, -6) + '......';
      }
      break;
    }
  }
  return arrTr;
}


const convertImage2base64=(obj)=>{
    //进行图片 base64
    var canvas = wx.createCanvasContext(obj.canvasID);
    canvas.drawImage(obj.file, 0, 0, obj.width, obj.height);
    canvas.draw(false, () => {
    // 2. 获取图像数据， API 1.9.0
    wx.canvasGetImageData({
      canvasId: obj.canvasID,
      x: 0,
      y: 0,
      width: obj.width,
      height: obj.height,
      success(res) {
        let pngData = upng.encode([res.data.buffer], res.width, res.height);
        let base64 = wx.arrayBufferToBase64(pngData)
        obj.success('data:image/jpg;base64,'+base64);
      }
    })
  })
}
const idDiscern=(app,file,side,callback)=>{
  app.mall_api_post('/api/discern/idCardDiscernUpload',{
    img:file,
    card_side:side,
    upload_file:'idCard'
  },function(result){
    callback(result);
  })
}
const bankDiscern=(app,file,callback)=>{
  app.mall_api_post('/api/discern/bankcard',{
    img:file,
  },function(result){
    callback(result);
  })
}
const http={
  get:function(url,params,callback,failCallback){
    wx.request({
      url:url,
      data:params,
      method:'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        callback(res);
      },
      fail:function(res){
        failCallback(res);
      }
    })
  },
  post:function(url,params,callback,failCallback){
    wx.request({
      url:url,
      data:params,
      method:'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        callback(res);
      },
      fail:function(res){
        failCallback(res);
      }
    })
  },

};

const hide_phoneNo = function(phoneNo) {
  return phoneNo.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
};
/**
 * [重定向跳转]
 * @param  {[ string]}  url             [需要跳转的页面路径]
 * @param  {[string]}  redirectUrl     [重定向返回路径]
 * @param  {Boolean} isNavigatorBack [是否原路返回]
 * @return {[type]}                  [description]
 */
const redirectJump=function(url,redirectUrl,isNavigatorBack){
  if(!redirectUrl){
    redirectUrl=getCurrentPageUrlWithArgs();
  }
  redirectUrl=encodeURIComponent('/'+redirectUrl);
  if(isNavigatorBack){
    //跳转回来
      wx.navigateTo({ url: `${url}?isNavigatorBack=1`});
  }else{
    //自定义跳转
    wx.navigateTo({ url: `${url}?redirectUrl=${redirectUrl}`});
  }
}
const redirectDoneCallBack=function(){
  let pages=getCurrentPages();
  let currentPageOptions=pages[pages.length-1].options;
  let {redirectUrl,isNavigatorBack}=currentPageOptions;
  if(isNavigatorBack==1){
    wx.navigateBack({
      delta: 1
    });
    return;
  }
  if(!!redirectUrl) redirectUrl=decodeURIComponent(redirectUrl);

  if(!!redirectUrl){
    wx.navigateTo({
        url: redirectUrl
    })
  }else{
    wx.switchTab({
      url:redirectUrl||'/pages/user/index'
    })
  }
}
/*获取当前页url*/
const getCurrentPageUrl= function(){
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length-1]    //获取当前页面的对象
    var url = currentPage.route;    //当前页面url
    return url;
}

/*获取当前页带参数的url*/
const getCurrentPageUrlWithArgs =function(){
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length-1]    //获取当前页面的对象
    var url = currentPage.route    //当前页面url
    var options = currentPage.options    //如果要获取url中所带的参数可以查看options
    //拼接url的参数
    var urlWithArgs = url + '?'
    for(var key in options){
        var value = options[key]
        urlWithArgs += key + '=' + value + '&'
    }
    urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length-1)
    return urlWithArgs
}
const jumpToUrl = function (val) {
  let jump_url = '';
  console.log("jumpToUrl",val);
  if (val == "#" || val == null) return;
  let arr = val.split('/');
  let _url = arr[arr.length - 1];
  let page_url = _url.split('?');
  let path = pageList[page_url[0]];
  if (!!path) {
    let params_str = page_url.length > 1 ? "?" + page_url[1] : '';
    jump_url = path + params_str;
  } else {
    path = '/pages/index/index';
    jump_url = '/pages/index/index';
  }
  return {
    type:tabbars.indexOf(path)!=-1?'tabbar':'normal',
    url: jump_url
  }
}
const filter_emoji = function (value)  {
  let regStr = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030|\s/ig;
  return value.replace(regStr, '');
}

// const parseObj = {
//   gid: "goods_id",
//   mid: "member_id",
//   sid: "store_id",
// }
const parseOptions = function (options) {
  if (options.scene) {
    options.type = 'scene';
    let scene = decodeURIComponent(options.scene);
    let sceneArr = scene.split('&');
    sceneArr.map(item => {
      let itemArr = item.split('=');
      let key = itemArr[0];
      let value = itemArr[1];
      options[key] = value;
    })
    return options;
  } else {
    return options;
  }

}
const px2rpx = function (px = 0) {
  const screenWidth = wx.getSystemInfoSync().screenWidth;
  return px * 750/screenWidth;
}
export {
  px2rpx,
  parseOptions,
  filter_emoji,
  formatTime,
  jump,
  http,
  getUserInfo,
  idDiscern,
  bankDiscern,
  get_url_parms_obj,
  joinParams,
  handlerLinkTrans,
  convertImage2base64,
  hide_phoneNo,
  ossUrlTest,
  redirectJump,
  redirectDoneCallBack,
  getCurrentPageUrl,
  getCurrentPageUrlWithArgs,
  textWrap,
  getUrlParams,
  jumpToUrl
}
