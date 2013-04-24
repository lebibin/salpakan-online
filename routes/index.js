
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('../views/index', { title: 'Game of the Generals' });
};

exports.restart = function(req, res){
  res.render('../views/indexrestart', { title: 'Restart' });
};