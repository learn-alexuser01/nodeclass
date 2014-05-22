var models = require('../helpers/models'),
    path = require('path'),
    fs = require('fs'),
    md5 = require('MD5');

module.exports = {
    index: function(req, res) {
        var viewModel = {
            comments: []
        };
        models.Image.find({ filename: { $regex: req.params.image_id } }, function(err, images) {
            if (err) throw err;
            if (images.length > 0) {

                // build the view model - taking the first item of returned images
                viewModel.image = images[0];

                viewModel.image.views = viewModel.image.views + 1;
                viewModel.image.uniqueId = req.params.image_id;

                res.render('image', viewModel);

                // increment the views counter:
                models.Image.update(
                    { _id: images[0]._id },
                    { $inc: { 'views': 1} },
                    function(err, updated) {
                        if (err) throw err;
                    }
                );
            } else {
                res.redirect('/');
            }
        });
    },
    create: function(req, res) {
        var saveImage = function() {
            var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
                imgUrl = '';

            for(var i=0; i < 6; i+=1) {
                imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            models.Image.find({ filename: imgUrl }, function(err, images) {
                if (images.length > 0) {
                    saveImage();
                } else {
                    var tempPath = req.files.file.path,
                        ext = path.extname(req.files.file.name).toLowerCase(),
                        targetPath = path.resolve('./public/upload/' + imgUrl + ext);

                    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                        fs.rename(tempPath, targetPath, function(err) {
                            if (err) throw err;

                            var newImg = new models.Image({
                                title: req.body.title,
                                filename: imgUrl + ext,
                                description: req.body.description
                            });
                            newImg.save(function(err, image) {
                                console.log('Successfully inserted image: ' + image.filename);
                                res.redirect('/images/' + imgUrl);
                            });
                        });
                    } else {
                        fs.unlink(tempPath, function () {
                            if (err) throw err;
                            res.json(500, {error: 'Only image files are allowed.'});
                        });
                    }
                }
            });
        };

        saveImage();
    },
    like: function(req, res) {
        res.send('The image:like POST controller');
    },
    comment: function(req, res) {
        res.send('The image:comment POST controller');
    }
};
