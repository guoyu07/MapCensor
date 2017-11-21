/**
 * @description
 * @file
 * @author    linglong
 * @date      2017/10/25
 *
 * @copyright @Navinfo, all rights reserved.
 */

module.exports = function (sequelize, DataTypes) {
  let caseModel = sequelize.define ('bb_case', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      caseSnap: {
        type: DataTypes.STRING
      },
      caseDesc: {
        type: DataTypes.STRING
      },
      caseMethod: {
        type: DataTypes.STRING
      },
      images: {
        type: DataTypes.STRING
      },
      videos: {
        type: DataTypes.STRING
      },
      marker: {
        type: DataTypes.GEOMETRY
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      freezeTableName: true
    }
  );

  // 在model上添加静态方法;
  caseModel.findJoinWithIssue = function (obj) {
    var limit = '';
    if (obj.offset && obj.limit) {
      limit = ' limit ' + obj.offset + ',' + obj.limit;
    }
    var cond = obj.condition;
    var sql = 'SELECT ' +
      'c.id as caseCode, c.caseSnap as caseSnap, c.caseDesc as caseDesc, c.images as caseImages, c.videos as caseVideos, c.createdAt, ' +
      'i.proCode as proCode, i.caseCode as proCaseCode, i.images as proImages, i.videos as proVideos ' +
      'FROM bb_case AS c LEFT JOIN bb_issue As i ' +
      'ON (c.id=i.caseCode) AND i.proCode=' + cond + limit;
    return sequelize.query (sql, {type: sequelize.QueryTypes.SELECT});
  };

  return caseModel;
};
