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
const issueModel = require('../../models/bs/issueModel');
const caseModel = require('../../models/bs/caseModel');

/**
 * 用户管理控制器;
 * @param req
 * @param res
 * @constructor
 */
function issueController(req, res) {
  this.model = {};
  this.model.createUser = req.loginUser.userId;
  this.model.proCode = '';
  this.model.caseCode = '';
  this.model.images = [];
  this.model.videos = [];
  this.model.issueStatus = 0;
  this.req = req;
  this.res = res;
}

/**
 * 上传图片
 *@method upload
 */
issueController.prototype.upload = function () {
  let _self = this;
  upLoad({
    dir: 'images/issue',
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
 * 创建问题;
 * @method create
 */
issueController.prototype.create = function () {
  this.req.body.images = this.req.body.images.join(',');
  this.req.body.videos = this.req.body.videos.join(',');
  tool.extend(this.model, this.req.body);
  return issueModel.upsert(this.model)
  .then(result => {
    if (result) {
      return this.res.json({
        errorCode: 0,
        message: '问题创建成功'
      });
    } else {
      return this.res.json({
        errorCode: 0,
        message: '问题更新成功!'
      });
    }
  })
  .catch(err => {
    throw err;
  });
};

// 查找问题(通过项目id和案例id)
issueController.prototype.find = function () {
  let projectId = this.req.query.proCode;
  let caseId = this.req.query.caseCode;
  let requestData = {where: {proCode: projectId, caseCode: caseId}};
  return issueModel.findOne (requestData)
  .then (result => {
    if (!result) {
      return this.res.json ({
        errorCode: -1,
        message: 'proCode为' + projectId + '和caseCode为' + caseId + '问题不存在'
      });
    } else {
      return caseModel.findOne ({where: {id: caseId}})
      .then (res => {
        let tempResult = {};
        tempResult.caseCode = res.dataValues.id;
        tempResult.caseSnap = res.dataValues.caseSnap;
        tempResult.caseDesc = res.dataValues.caseDesc;
        tempResult.caseMethod = res.dataValues.caseMethod;
        tempResult.caseMarker = tool.clone (res.dataValues.marker);
        tempResult.caseImages = res.dataValues.images ? res.dataValues.images.split (',') : [];
        tempResult.caseVideos = res.dataValues.videos ? res.dataValues.videos.split (',') : [];
        tempResult.issueVideos = result ? result.dataValues.videos.split (',') : [];
        tempResult.issueImages = result ? result.dataValues.images.split (',') : [];
        return this.res.json ({errorCode: 0, result: tempResult, message: '问题查询成功'});
      });
    }
  })
  .catch (err => {
    throw err;
  });
};

/**
 * 根据问题id删除问题;
 * @method delete
 */
issueController.prototype.delete = function () {
  let requestData = {where: {id: this.req.query.id}};
  return issueModel.destroy (requestData)
  .then (result => {
    if (result) {
      return this.res.json ({
        errorCode: 0,
        message: '删除成功'
      });
    } else {
      return this.res.json ({
        errorCode: -1,
        message: '删除失败,id为' + this.req.query.id + '的项目不存在'
      });
    }
  })
  .catch (err => {
    throw err;
  });
};



module.exports = issueController;
