
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Game of the Generals' });
};

exports.restart = function(req, res){
  res.render('restart', { title: 'Restart' });
};