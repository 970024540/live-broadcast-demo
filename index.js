
const fs = require('fs');
const async = require('async');
const datas = require('./appList.json');
const path = require("path");
const compressing = require('compressing');  // 压缩，解压插件
const ci = require('miniprogram-ci');
const moment = require('moment');

var errList=[]; // 上传失败的appid集合
var nameLog=moment(Math.round(new Date())).format("YYYY-MM-DD");
// 创建存放目录
existOrCreate('./log');
let stderr = fs.createWriteStream(`./log/${nameLog}.txt`, {flags: 'a',encoding: 'utf8'});


// 创建logger
var logger = new console.Console(stderr);

/**
 * 法一：直接循环demo上传
 * */ 

// logger.log(moment(Math.round(new Date())).format("'YYYY-MM-DD HH:mm:ss'"),'脚本执行开始**************************************************');
// async.mapSeries(datas, function (item, callback) {
//     let { appid, version, title } = item;
//     const project = new ci.Project({
//         appid,
//         type: 'miniProgram',
//         projectPath: `./demo`,
//         privateKeyPath: `./key/private.${appid}.key`,
//         ignores: ['node_modules/**/*'],
//     })
//     ci.upload({
//         project,
//         version,
//         desc: new Date() + '上传:' + title,
//         setting: {
//             minify: true,
//             es6: true
//         },
//     }).then(res => {
//         console.log(res)
//         console.log('上传成功');
//         callback();
//     }).catch(error => {
//         // if (error.errCode == -1) {
//         //   console.log('上传成功')
//         // }
//         errList.push(appid)
//         console.log('上传失败', error);
//         callback();
//     })
// },function(err,results){
//     console.log('总执行已完成》》上传失败个数为：'+errList.length);
    
//     if(errList.length>0){
//         console.log(errList)
//         logger.log('上传失败集合：',errList)
//     }
//     logger.log(moment(Math.round(new Date())).format("'YYYY-MM-DD HH:mm:ss'"),'脚本执行结束**************************************************');
// })

/**
 * 法二：借压缩循环生成文件夹，逐个文件夹上传
 * */ 

compressing.zip.compressDir('./demo', 'demo.zip').then(() => {
    console.log('压缩成功》》》');
    logger.log(moment(Math.round(new Date())).format("'YYYY-MM-DD HH:mm:ss'"),'脚本执行开始**************************************************');
    // 创建存放目录
    existOrCreate('./dist');
    //循环名单列表
    async.mapSeries(datas, function (item, callback) {
        let { appid, version, title,uuid } = item;
        var appidUrl = './dist/' + appid;
        //创建项目目录，如果已存在，则跳过；
        existOrCreate(appidUrl);
        // 解压
        compressing.zip.uncompress('demo.zip', appidUrl).then(() => {
            // 修改appid
            let person = fs.readFileSync(appidUrl + '/demo/project.config.json');
            person = person.toString();     // 将二进制的数据转换为字符串
            person = JSON.parse(person);      // 将字符串转换为json对象
            person.appid = appid;             // 替换appid
            var str = JSON.stringify(person); // 因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
            fs.writeFileSync(appidUrl + '/demo/project.config.json', str);

            // 修改app.js =》uuid，appid
            let globalData= fs.readFileSync(appidUrl+'/demo/app.js');
            globalData=globalData.toString();
            console.log(typeof globalData)
            globalData=globalData.replace('wxb8fa18d9cbae3072',appid);
            globalData=globalData.replace('f3c5defe-c26d-4f4b-a042-38422397f2d3',uuid);
            globalData=globalData.replace('影儿松江开元店',title);
            fs.writeFileSync(appidUrl+'/demo/app.js', globalData);

            // 修改版本号，名称
            let package_data = fs.readFileSync(appidUrl + '/demo/package.json');
            package_data = package_data.toString();     // 将二进制的数据转换为字符串
            package_data = JSON.parse(package_data);      // 将字符串转换为json对象
            package_data.version = version;             // 替换appid
            package_data.name = title;           // 替换版本号
            var str = JSON.stringify(package_data); // 因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
            fs.writeFileSync(appidUrl + '/demo/package.json', str);

            // 修改小程序标题
            let configApp = fs.readFileSync(appidUrl + '/demo/app.json');
            configApp = configApp.toString();     // 将二进制的数据转换为字符串
            configApp = JSON.parse(configApp);      // 将字符串转换为json对象
            configApp.window.navigationBarTitleText=title;
            var str2 = JSON.stringify(configApp); // 因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
            fs.writeFileSync(appidUrl + '/demo/app.json', str2);


            //创建、key目录，更新密钥
            let file_path = appidUrl + "/demo/key";
            if (fs.existsSync(file_path)) {
                removeFolderFile(file_path);
                logger.log(`密钥更新>>${file_path}`)
                console.log(`已存在${file_path}, 执行删除`);
            }
            var new_url_name = `private.${appid}.key`;
            fs.mkdirSync(file_path);
            fs.copyFileSync(`./key/${new_url_name}`, appidUrl + '/demo/key/' + new_url_name);
            console.log(`修改appid:----------${appid}成功,复制密钥成功-------------`);
            console.log('开始执行node打包上传命令...');
            const project = new ci.Project({
                appid,
                type: 'miniProgram',
                projectPath: `./${appidUrl}/demo/`,
                privateKeyPath: `./${appidUrl}/demo/key/private.${appid}.key`,
                ignores: ['node_modules/**/*'],
            })
            ci.upload({
                project,
                version,
                desc: new Date() + '上传:' + title,
                setting: {
                    minify: true,
                    es6: true
                },
            }).then(res => {
                console.log(res)
                console.log('上传成功');
                callback();
            }).catch(error => {
                errList.push(appid);
                logger.log('appid： '+appid+' ==> 上传失败，失败原因：',error)
                console.log('上传失败', error);
                callback();
            })

        }).catch(err => {
            console.error(err);
        })
    },function(err,results){
        console.log('总执行已完成》》'+'上传成功个数：'+(datas.length-errList.length)+'*****************上传失败个数为：'+errList.length);
        
        if(errList.length>0){
            console.log('上传失败集合：',errList)
            logger.log('上传失败集合：',errList)
        }
        logger.log(moment(Math.round(new Date())).format("'YYYY-MM-DD HH:mm:ss'"),'脚本执行结束**************************************************');
    });
}).catch(err => {
    console.error(err);
});

function existOrCreate(src) {
    //测试某个路径下文件是否存在
    let isExit = fs.existsSync(src);
    if (isExit) {//存在
        
        // fs.unlinkSync(dst);
    } else {//不存在
        logger.log(`创建${src}目录`)
        fs.mkdirSync(src);
    }
    return isExit;
}

function removeFolderFile(file_path) {
    const stat = fs.statSync(file_path);
    if (stat.isFile()) {
        //直接删除文件
        fs.unlinkSync(file_path);
    } else {
        //文件夹，遍历删除
        let files = fs.readdirSync(file_path);
        files.forEach((file, index) => {
            let _path = path.join(file_path, file);
            fs.unlinkSync(_path);
        });
        fs.rmdirSync(file_path);
    }
}


