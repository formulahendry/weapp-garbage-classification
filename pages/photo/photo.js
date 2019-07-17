// pages/recoverable/recoverable.js
Page({
  data: {
    src: null
  },
  onLoad: function (options) {
    this.ctx = wx.createCameraContext();
  },
  takePhoto: function () {
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath
        })
      }
    })
  },
  continuePhoto: function () {
    this.setData({
      src: null
    })
  }
})