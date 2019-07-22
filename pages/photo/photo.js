// pages/recoverable/recoverable.js
const DEFAULT_DATA = {
  src: null,
  isShowImage: false,
  imgW: '',
  imgH: '',
  byclear: 1,
  ctx: null,
  items: [],
};
Page({
  onShareAppMessage: function () { },
  data: Object.assign({}, DEFAULT_DATA),
  onLoad: function (options) {
    this.ctx = wx.createCameraContext();
    // var that = this
    // //获取系统信息  
    // wx.getSystemInfo({
    //   //获取系统信息成功，将系统窗口的宽高赋给页面的宽高  
    //   success: function (res) {
    //     that.width = res.windowWidth
    //     console.log(that.width)
    //     that.height = res.windowHeight
    //     console.log(that.height)
    //     // 这里的单位是PX，实际的手机屏幕有一个Dpr，这里选择iphone，默认Dpr是2
    //   }
    // })
  },
  takePhoto: function () {
    var that = this;
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData(Object.assign(this.data, {
          src: res.tempImagePath,
          isShowImage: true
        }));
        upload(that, res.tempImagePath);
      }
    })
  },
  continuePhoto: function () {
    this.setData(Object.assign({}, DEFAULT_DATA));
  },
  onReady: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        let byclear = res.screenWidth / 375;
        Object.assign(that.data, {
          byclear
        });
      },
    })
  },
  display: function(e) {
    // 实际宽度 e.detail.width 高度 e.detail.height
    const whsrc = e.detail.height / e.detail.width;
    // 计算高宽，需要处理图片宽度小于屏幕宽度的时候 对应的canvas比例
    const byclear = this.data.byclear;
    const ctx = wx.createCanvasContext('imageCanvas', this);
    ctx.save();
    if (e.detail.width > 375 * byclear) ctx.scale(375 * byclear / e.detail.width, 375 * byclear / e.detail.width);
    ctx.drawImage(this.data.src, 0, 0, e.detail.width, e.detail.height);
    this.setData(Object.assign(this.data, {
      imgW: e.detail.width > 375 ? 750 : e.detail.width * 2 / byclear,
      imgH: e.detail.width > 375 ? 750 * whsrc : e.detail.height * 2 / byclear,
      ctx,
    }));

    // ctx.setLineWidth(8);
    // ctx.setFontSize(80)
    // ctx.font = 'Arial bold'
    // ctx.setStrokeStyle('white')
    // ctx.strokeRect(166, 994, 389, 512)
    // ctx.fillText("①", 166, 994)


    // 框选物体
    // ctx.setStrokeStyle('white')
    // ctx.strokeRect(202, 180, 671, 584)

    // 标数字的底色方框
    // ctx.setFillStyle('brown')
    // ctx.fillRect(202 + 671 + 10, 180, 120, 120)

    // 数字
    // ctx.setFillStyle('white')
    // ctx.fillText("①", 202 + 671 + 10 + 20, 180 + 120 / 2 + 25)

    ctx.draw();
  },
})

var POST_URL = 'https://wxapi.hotapp.cn/proxy/?appkey=hotapp688885631&url=https://garbageclassification.eastasia.cloudapp.azure.com/post/api';
function upload(page, path) {
  wx.showLoading({
    title: '识别中',
    mask: true,
  });
  var fileManager = wx.getFileSystemManager();
  var image = fileManager.readFileSync(path, 'base64');
  wx.request({
    url: POST_URL,
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: { image },
    success: function (res) {
      if (res.statusCode != 200 || !res.data ||
          !res.data.detection_result || !res.data.detection_result.objects) {
        handleException(res);
        return;
      }
      const isRecognized = renderCognition(page, res.data.detection_result.objects);
      console.log(res)
      if (!isRecognized) {
        handleException(undefined, new Error('No claasification result.'));
      }
    },
    fail: function (err) {
      handleException(undefined, err);
      return;
    },
    complete: function () {
      wx.hideLoading();
    }
  });
}

function renderCognition(page, objects) {
  let hasResult = false;
  const items = [];
  
  const ctx = page.data.ctx;
  ctx.setLineWidth(6);
  ctx.setStrokeStyle('white');

  var index = 0;
  for (const object of objects) {
    index++;
    console.log(index);
    const rectangle = object.rectangle;
    ctx.strokeRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    
    if (object.classification == "湿垃圾") {
      ctx.setFillStyle('brown');
    } else if (object.classification == "干垃圾") {
      ctx.setFillStyle('black');
    } else if (object.classification == "有害垃圾") {
      ctx.setFillStyle('orange');
    } else if (object.classification == "可回收垃圾") {
      ctx.setFillStyle('blue');
    } else {
      ctx.setFillStyle('red');
    }

    const width = 80;
    const gap = 10;
    ctx.fillRect(rectangle.x + rectangle.w + gap, rectangle.y, width, width);

    const fontSize = 70;
    const gap2 = 20;
    ctx.setFontSize(fontSize)
    ctx.font = 'Consolas bolder'
    ctx.setFillStyle('white');
    ctx.fillText((index).toString(), rectangle.x + rectangle.w + gap + gap2, rectangle.y + width - (width) / 6);

    hasResult = true;
    items.push({
      object: object.object,
      classification: object.classification ? object.classification : "未能分类",
    })
  }
  if (hasResult) {
    page.setData({
      items: items,
    });
    ctx.draw(true /*reserveLastDraw*/);
  }
  return hasResult;
}

function handleException(res, err) {
  let content = '识别失败，请稍后再试';
  if (err) {
    content = err.message;
  }
  wx.showModal({
    title: '提示',
    content: content,
    showCancel: false
  });
}
