/**
 * @description
 * @file
 * @author    lingLong
 * @date      2017/10/31
 *
 * @copyright @Navinfo, all rights reserved.
 */

/**
 * 引入相关模块
 */
const upLoad = require('../../utils/upload');
const tool = require('../../utils/publicTool');
const caseModel = require('../../models/bs/caseModel');

/**
 * 用户管理控制器;
 * @param req
 * @param res
 * @constructor
 */
function caseController(req, res) {
  this.model = {};
  this.model.createUser = req.loginUser.userId;
  this.model.caseSnap = '';
  this.model.caseDesc = '';
  this.model.caseMethod = '';
  this.model.images = '';
  this.model.videos = '';
  this.model.marker = {type: 'Point', coordinates: [0, 0]};
  this.req = req;
  this.res = res;
}

/**
 * 查存所有案例列表;
 * @method list
 */
caseController.prototype.list = function () {
  let requestParam = {order: [["createdAt", "DESC"]]};
  if (this.req.query.pageSize && this.req.query.pageNum) {
    requestParam.limit = this.req.query.pageSize;
    requestParam.offset = (this.req.query.pageNum - 1) * this.req.query.pageSize;
  }
  caseModel.findAndCountAll (requestParam).then (caseDatas => {
    let dataList = [];
    let caseTotal = caseDatas.count;
    for (let i = 0; i < caseDatas.rows.length; i++) {
      let data = tool.clone (caseDatas.rows[i].dataValues);
      let imageLength = data.images ? data.images.split (',').length : 0;
      let videoLength = data.videos ? data.videos.split (',').length : 0;
      data.mediaLength = imageLength + videoLength;
      dataList.push (data);
    }
    return this.res.json ({
      errorCode: 0,
      result: {data: dataList, total: caseTotal},
      message: '查找成功'
    });
  }).catch (err => {
    throw err;
  });
};

/**
 * 案例列表;
 * @method list
 */
caseController.prototype.listDetail = function () {
  let requestParam = {order: [["createdAt", "DESC"]]};
  requestParam.condition = this.req.query.projectCode;
  if (this.req.query.pageSize && this.req.query.pageNum) {
    requestParam.limit = this.req.query.pageSize;
    requestParam.offset = (this.req.query.pageNum - 1) * this.req.query.pageSize;
  }
  caseModel.findJoinWithIssue (requestParam)
  .then (result => {
    return caseModel.count()
    .then(caseCount => {
      let dataList = [];
      for (let i = 0; i < result.length; i++) {
        let data = {};
        proImageLength = result[i].proImages ? result[i].proImages.split(',').length : 0;
        proVideoLength = result[i].proVideos ? result[i].proVideos.split(',').length : 0;
        data.proMediaLength = proImageLength + proVideoLength;
        data.proCode = result[i].proCode ? result[i].proCode : this.req.query.projectCode;

        caseImageLength = result[i].caseImages ? result[i].caseImages.split(',').length : 0;
        caseVideoLength = result[i].caseVideos ? result[i].caseVideos.split(',').length : 0;
        data.caseMediaLength = caseImageLength + caseVideoLength;
        data.caseSnap = result[i].caseSnap;
        data.caseDesc = result[i].caseDesc;
        data.caseCode = result[i].caseCode;
        data.createdAt = result[i].createdAt;
        dataList.push(data);
      }
      return this.res.json ({
        errorCode: 0,
        result: {data: dataList, total: caseCount},
        message: '查找成功'
      });
    });
  })
  .catch(err => {
    throw err;
  });
};

/**
 * 根据案例id查询案例详情
 * @method query
 */
caseController.prototype.query = function () {
  let requestParam = {where: {id: this.req.query.id}};
  caseModel.findOne (requestParam).then (caseData => {
    if (caseData) {
      let caseDataCopy = tool.clone (caseData);
      let caseValues = caseDataCopy.dataValues;
      caseDataCopy.dataValues.videos = caseValues.videos ? caseValues.videos.split (',') : [];
      caseDataCopy.dataValues.images = caseValues.images ? caseValues.images.split (',') : [];
      return this.res.json ({
        errorCode: 0,
        result: {data: caseDataCopy},
        message: '查找成功'
      });
    } else {
      return this.res.json ({
        errorCode: -1,
        message: 'id为' + this.req.query.id + '的案例不存在!'
      });
    }
  }).catch (err => {
    throw err;
  });
};

/**
 * 上传图片todo
 *@method upload
 */
caseController.prototype.upload = function () {
  let _self = this;
  upLoad({
    dir: 'images/case',
    req: _self.req,
    calledBack: function (results) {
      return _self.res.json ({
        errorCode: 0,
        result: {data: results},
        message: '成功上传' + results.length + '张图片'
      });
    }
  });
};

/**
 * 创建案例
 * @method create
 */
caseController.prototype.create = function () {
  this.req.body.images = this.req.body.images.join (',');
  this.req.body.videos = this.req.body.videos.join (',');
  tool.extend (this.model, this.req.body);
  caseModel.create (this.model)
  .then (caseData => {
    if (caseData) {
      let caseDataCopy = tool.clone (caseData);
      let caseValues = caseDataCopy.dataValues;
      caseDataCopy.dataValues.videos = caseValues.videos ? caseValues.videos.split (',') : [];
      caseDataCopy.dataValues.images = caseValues.images ? caseValues.images.split (',') : [];
      return this.res.json ({
        errorCode: 0,
        result: {data: caseDataCopy},
        message: '案例创建成功'
      });
    } else {
      return this.res.json ({
        errorCode: -1,
        message: '案例创建失败'
      });
    }
  })
  .catch (err => {
    throw err;
  });
};

/**
 * 更新案例
 * @method create
 */
caseController.prototype.update = function () {
  let condition = {where: {id: this.req.body.id}};
  this.req.body.images = this.req.body.images.join (',');
  this.req.body.videos = this.req.body.videos.join (',');
  tool.extend (this.model, this.req.body);
  delete this.model.id;
  caseModel.update (this.model, condition)
  .then (result => {
    if (result) {
      return this.res.json ({
        errorCode: 0,
        message: '案例更新成功'
      });
    } else {
      return this.res.json ({
        errorCode: -1,
        message: '案例更新失败!'
      });
    }
  })
  .catch (err => {
    throw err;
  });
};

/**
 * 删除案例
 * @method delete
 */
caseController.prototype.delete = function () {
  let requestParam = {where: {id: this.req.query.id}};
  caseModel.destroy (requestParam)
  .then (result => {
    if (result) {
      return this.res.json ({
        errorCode: 0,
        message: '删除成功'
      });
    } else {
      return this.res.json ({
        errorCode: -1,
        message: '删除失败'
      });
    }
  })
  .catch (err => {
    throw err;
  });
};


module.exports = caseController;
