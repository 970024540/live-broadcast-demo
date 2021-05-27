

const md5 = require ('../miniprogram_npm/md5/index');
// const app_config = {
//   appkey: '1224283400',
//   secret: 'qazwsxedcrfv'
// }

const app_config = {
  appkey: 'mmGdRIvDvY7E1hxX',
  secret: 'FAPw9srn9HXDXSaBt3WyDfSoQG0m4oZ7VTtklUew'
}


/**
 * 加签如果出现 403010,看下传的参数里面有没有布尔值,有就很有可能是布尔值导致的
 * false传0,true传1
 */
const api_auth = (method, _config) => {
  let config = JSON.parse(JSON.stringify(_config));
  config.appkey && delete config.appkey;
  config.timestamp && delete config.timestamp;
  config.sign && delete config.sign;
  //api 签名加密服务
  let timestamp = parseInt((Date.now()) / 1000);
  let { url, params } = config;
  let form = {
    timestamp,
    appkey: app_config.appkey
  };
  params=Object.assign(params,form)
  if (method == 'get') {
    let sign_url = auth_get(params);
    config.url = sign_url;

  } else if (method == 'post') {
    let body = auth_post(params);
    let arr = Object.keys(body);
    arr.sort();
    let obj = {};
    arr.forEach((item, index) => {
      obj[item] = body[item];
    })
    config.data = obj;
  } else if (method == 'delete') {
    let sign_url = auth_get(params);
    config.url = sign_url;
  } else if (method == 'put') {
    let body = auth_post(params);
    let arr = Object.keys(body);
    arr.sort();
    let obj = {};
    arr.forEach((item, index) => {
      obj[item] = body[item];
    })
    config.data = obj;
  }
  return config;
}
function joinParams (params) {
  var str = '';
  for (var key in params) {
    str += key + '=' + params[key] + '&';
  };
  str = str.slice(0, -1);
  return str;
};
function get_url_parms_obj (url) {
  var params = {};
  //检测是否存在?   decode解析中文字符串
  url = decodeURI(url);
  if (url.indexOf("?") != -1) {
    url = url.split("?")[1];
  } else {
    return params;
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
function auth_get(params) {
  let str_data = jsonSort(params) + app_config.secret;
  var sign = md5(str_data);
  params.sign = sign.toUpperCase();
  let str_params = joinParams(params);
  return str_params;
}
function auth_post(params) {
  let str_data = jsonSort(params) + app_config.secret;
  var sign = md5(str_data);
  params.sign = sign.toUpperCase();
  return params;
}
function jsonSort(jsonObj) {
  let str = '';
  let arr = Object.keys(jsonObj);
  arr.sort();
  arr.forEach((item, index) => {
    str += item + jsonObj[item];
  })
  
  return str
}

export { api_auth };