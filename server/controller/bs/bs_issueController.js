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
const logger = require('../../log').logger;
const upLoad = require('../../utils/upload');
const tool = require('../../utils/publicTool');
const sequelize = require("../../dataBase");
const issueModel = sequelize.import('../../models/bs/issueModel');
const caseModel = sequelize.import('../../models/bs/caseModel');

/**
 * 问题管理控制器;
 * @param req
 * @param res
 * @constructor
 */
function issueController(req, res) {
  this.model = {};
  this.model.createUser = req.loginUser.id;
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
 * 创建问题
 * @method create
 * @returns {Promise.<TResult>}
 */
issueController.prototype.create = function () {
  tool.extend(this.model, this.req.body);
  this.model.images = this.model.images.join(',');
  this.model.videos = this.model.videos.join(',');
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
    logger.fatal(err);
    throw err;
  });
};

/**
 * 审核问题
 * @method auditIssue
 * @returns {Promise.<TResult>}
 */
issueController.prototype.auditIssue = function () {
  let updateData = {issueStatus: this.req.body.issueStatus}
  let condition = {where: {id: this.req.body.issueId}};
  return issueModel.update(updateData, condition)
  .then(affectedCount => {
    if (affectedCount[0]) {
      this.res.json({errorCode: 0, message: '问题审核成功'});
    } else {
      this.res.json({errorCode: -1, message: '问题审核失败'});
    }
  })
  .catch(err => {
    logger.fatal(err);
    throw err;
  });
};

/**
 * 查找问题(通过项目id和案例id)
 * @method find
 * @returns {Promise.<TResult>}
 */
issueController.prototype.find = function () {
  let projectId = this.req.query.proCode;
  let caseId = this.req.query.caseCode;
  let requestData = {where: {proCode: projectId, caseCode: caseId}};
  return issueModel.findOne (requestData)
  .then (result => {
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
      tempResult.issueId = result ? result.dataValues.id : null;
      tempResult.issueStatus = result ? result.dataValues.issueStatus : null;
      tempResult.issueVideos = (result && result.dataValues.videos) ? result.dataValues.videos.split (',') : [];
      tempResult.issueImages = (result && result.dataValues.images) ? result.dataValues.images.split (',') : [];
      return this.res.json ({errorCode: 0, result: tempResult, message: '问题查询成功'});
    });
  })
  .catch (err => {
    logger.fatal(err);
    throw err;
  });
};

/**
 * 根据问题id删除问题;
 * @method delete
 * @returns {Promise.<TResult>}
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
    logger.fatal(err);
    throw err;
  });
};



module.exports = issueController;
