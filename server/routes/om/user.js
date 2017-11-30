/**
 * @description
 * @file
 * @author    linglong
 * @date      2017/11/1
 *
 * @copyright @Navinfo, all rights reserved.
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const logger = require('../../log').logger;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const omController = require('../../controller/om/om_userController');

let handler = function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors.mapped());
    return res.status(422).json({ errorCode: -1, errors: errors.mapped() });
  }
  // 要保证路由接口和控制器方法一致;
  let methodName = path.basename(req.url).split('?')[0];
  let controller = new omController(req, res);
  if (typeof controller[methodName] === 'function' && req.method != 'OPTIONS') {
    controller[methodName]();
  } else {
    next('route');
  }
};

/**
 * @apiDefine ErrorExample
 * @apiErrorExample {json} ErrorExample:
 * {
 *    "errorCode": -1,
 *    "message": 'XXX失败'
 * }
 */

/**
 * @api {post} /om/user/register 用户注册(om/user/register).
 * @apiName register.
 * @apiGroup user manage.
 * @apiDescription 用户注册接口,注册的用户默认会分配为游客身份(roleCode=0).
 * @apiParam {String} userName      用户名（必填）.
 * @apiParam {String} fullName    全名（必填）.
 * @apiParam {String} [company]   公司（必填）.
 * @apiParam {String} password      密码（必填）.
 * @apiParam {String} email         邮箱（必填）.
 * @apiParam {String} [cellPhone]   电话（可选）.
 * @apiParam {Integer} [status]     用户状态（可选，默认为0）.
 * @apiUse ErrorExample
 * @apiSuccessExample {json} Success-Response:
 *  {
 *     "errorCode": 0,
 *     "result": {
 *         "createdAt": "2017-11-28",
 *         "updatedAt": "2017-11-28",
 *         "id": 16,
 *         "userName": "test",
 *         "password": "40bd001563085fc35165329ea1ff5c5ecbdbbeef",
 *         "fullName": "",
 *         "email": "111111@qq.com",
 *         "cellPhone": "",
 *         "status": 0,
 *         "role": 2
 *     },
 *     "message": "用户创建成功,并为用户分配为游客角色"
 * }
 */
router.post('/register', [
    check('userName').exists().withMessage('userName参数不能为空'),
    check('fullName').exists().withMessage('fullName'),
    check('password').exists().withMessage('password参数不能为空'),
    check('email').exists().withMessage('email参数不能为空').isEmail().withMessage('邮箱格式不合法'),
    check('company').exists().withMessage('company参数不能为空')
], (req, res, next) => {
    handler(req, res, next);
  }
);

/**
 * @api {post} /om/login 用户登陆(om/user/login)
 * @apiName login.
 * @apiGroup user manage.
 * @apiDescription 用户登陆接口.
 * @apiParam {String} userName 用户名（必填）.
 * @apiParam {String} password 密码（必填）.
 * @apiUse ErrorExample
 * @apiSuccessExample {json} Success-Response:
 *{
 *    "errorCode": 0,
 *    "result": {
 *        "id": 4,
 *        "userName": "wuzhen",
 *        "fullName": "wuzhen",
 *        "email": null,
 *        "cellPhone": null,
 *        "status": null,
 *        "createdAt": "2017-11-21T05:30:55.000Z",
 *        "updatedAt": "2017-11-21T05:30:55.000Z",
 *        "role": "worker",
 *        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Im5hbWUiOiJ3dXpoZW4iLCJwYXNzd29yZCI6IjQwYmQwMDE1NjMwODVmYzM1MTY1MzI5ZWExZmY1YzVlY2JkYmJlZWYifSwiaWF0IjoxNTExODM3MzM2LCJleHAiOjE1MTE5MjM3MzZ9.CikJE9ZnJHCC1oeKWRTY20emeAcHi4zjqejp1szgdOQ"
 *    },
 *    "message": "已获得认证，登陆成功!"
 *}
 */
router.post('/login', [
    check('userName').exists().withMessage('userName参数不能为空'),
    check('password').exists().withMessage('password参数不能为空')
] , (req, res, next) => {
  handler(req, res, next);
  }
);

/**
 * @api {post} /om/user/find 用户查询(om/user/find)
 * @apiName find.
 * @apiGroup user manage.
 * @apiDescription 用户查询功能，不传参数返回所有用户,
 * 传递pageSize和pageNum可进行分页查询.
 * @apiParam {Integer} [pageSize] 每页显示个数（可选）.
 * @apiParam {Integer} [pageNum]  查询页码（可选）.
 * @apiUse ErrorExample
 * @apiSuccessExample {json} Success-Response:
 * {
 *      "errorCode": 0,
 *      "result": {
 *          "data": [
 *              {
 *                  "isExpired": false,
 *                  "createdAt": "2017-11-21",
 *                  "updatedAt": "2017-11-21",
 *                  "id": 1,
 *                  "userName": "root",
 *                  "fullName": "管理员1",
 *                  "email": null,
 *                  "cellPhone": null,
 *                  "status": null,
 *                  "role": "manager"
 *              },
 *              {
 *                 "isExpired": false,
 *                 "createdAt": "2017-11-21",
 *                 "updatedAt": "2017-11-21",
 *                 "id": 2,
 *                 "userName": "admin",
 *                 "fullName": "管理员2",
 *                 "email": null,
 *                 "cellPhone": null,
 *                 "status": null,
 *                 "role": "manager"
 *             }]
 *             "total": 4,
 *      "message": "查找成功"
 * }
 */
router.get('/find', [
    sanitize(['pageSize']).toInt(),
    sanitize('pageNum').toInt()
], (req, res, next) => {
  handler(req, res, next);
  }
);

/**
 * @api {post} /om/user/delete 用户删除(om/user/delete).
 * @apiName delete.
 * @apiGroup user manage.
 * @apiDescription 根据用户id删除用户功能.
 * @apiParam {Integer} userId 用户主键Id（必填）.
 * @apiUse ErrorExample
 * @apiSuccessExample {json} Success-Response:
 *{
 *  "errorCode": 0,
 *  "message": "删除成功"
 * }
 */
router.get('/delete', [
    check('id').isInt().withMessage('id必须为整数')
], (req, res, next) => {
  handler(req, res, next);
  }
);

/**
 * @api {get} /om/user/getPassport 获得验证码(om/user/getPassport).
 * @apiName getPassport.
 * @apiGroup user manage.
 * @apiDescription 根据用户id获得四位验证码.
 * @apiParam {String} userName 用户主键Id（必填）.
 * @apiUse ErrorExample
 * @apiSuccessExample {json} Success-Response:
 *{
 *  "errorCode": 0,
 *  "message": "邮件发送成功"
 * }
 */
router.get('/getPassport', [
    check('userName').exists().withMessage('userName参数不能为空')
  ], (req, res, next) => {
    handler(req, res, next);
  }
);

/**
 * @api {post} /om/user/resetPwd 重置密码(om/user/resetPwd).
 * @apiName resetPwd.
 * @apiGroup user manage.
 * @apiDescription 用户修改密码功能.
 * @apiParam {String} userName 用户主键Id（必填）.
 * @apiParam {String} password 新的密码（必填）.
 * @apiParam {String} passport 收到的验证码（必填）.
 * @apiUse ErrorExample
 * @apiSuccessExample {json} Success-Response:
 *{
 *  "errorCode": 0,
 *  "message": "重置密码成功"
 * }
 */
router.post('/resetPassword', [
    check('userName').exists().withMessage('userName参数不能为空'),
    check('password').exists().withMessage('password参数不能为空'),
    check('passport').exists().withMessage('passport参数不能为空')
  ], (req, res, next) => {
    handler(req, res, next);
  }
);



/**
 * @api {post} /om/user/auditUser 用户审核(om/user/auditUser).
 * @apiName auditUser.
 * @apiGroup user manage.
 * @apiDescription 用户审核功能.
 * @apiParam {Integer} userId 用户主键Id（必填）.
 * @apiParam {Integer} status 用户审核状态（必填）0-刚注册未审核,1-,审核通过（启用），2-审核不通过，3-强制停用, 4-强制过期, .
 * @apiParam {Integer} [roleId] 为用户分配的角色（必填）1-游客,2-作业员，3-管理员，4-超级管理员.
 * @apiUse ErrorExample
 * @apiSuccessExample {json} Success-Response:
 * {
 *     "errorCode": 0,
 *     "message": "用户状态更新为已审核，并分配角色为管理员"
 * }
 */
router.post('/auditUser', [
    check('userId').exists().withMessage('userId参数不能为空').isInt().withMessage('id必须为整数'),
    check('status').exists().withMessage('status参数不能为空').isInt().withMessage('id必须为整数')
  ], (req, res, next) => {
    handler(req, res, next);
  }
);




module.exports = router;
