var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

var db = require(libs + 'db/mongoose');
var Part = require(libs + 'model/part');

var fs = require('fs');
var path = require('path');

var addPartToBlockchain = require("../../../fabcar/invokeAddPart");

// List all parts
router.get('/', passport.authenticate('bearer', { session: false }), function (req, res) {

    Part.find(function (err, parts) {
        if (!err) {
            return res.json(parts);
        } else {
            res.statusCode = 500;

            log.error('Internal error(%d): %s', res.statusCode, err.message);

            return res.json({
                error: 'Server error'
            });
        }
    });
});

// Create part
router.post('/', passport.authenticate('bearer', { session: false }), function (req, res) {
    let carID = req.body.carId;

    let part = new Part({
        carId: carID,
        model: req.body.model
    });

    part.save(function (err) {
        if (!err) {
            log.info('New part created in DB with id: %s', part.id);

            // add new part to blockchain
            addPartToBlockchain(carID);

            return res.json({
                status: 'OK',
                part: part
            });
        } else {
            if (err.name === 'ValidationError') {
                res.statusCode = 400;
                res.json({
                    error: 'Validation error'
                });
            } else {
                res.statusCode = 500;

                log.error('Internal error(%d): %s', res.statusCode, err.message);

                res.json({
                    error: 'Server error'
                });
            }
        }
    });
});

// Get part
router.get('/:id', passport.authenticate('bearer', { session: false }), function (req, res) {

    Part.findById(req.params.id, function (err, part) {

        if (!part) {
            res.statusCode = 404;

            return res.json({
                error: 'Not found'
            });
        }

        if (!err) {
            return res.json({
                status: 'OK',
                part: part
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s', res.statusCode, err.message);

            return res.json({
                error: 'Server error'
            });
        }
    });
});

// Update part
router.put('/:id', passport.authenticate('bearer', { session: false }), function (req, res) {
    var articleId = req.params.id;

    Part.findById(articleId, function (err, part) {
        if (!part) {
            res.statusCode = 404;
            log.error('part with id: %s Not Found', articleId);
            return res.json({
                error: 'Not found'
            });
        }

        part.carId = req.body.carId;
        part.model = req.body.model;

        part.save(function (err) {
            if (!err) {
                log.info('part with id: %s updated', part.id);
                return res.json({
                    status: 'OK',
                    part: part
                });
            } else {
                if (err.name === 'ValidationError') {
                    res.statusCode = 400;
                    return res.json({
                        error: 'Validation error'
                    });
                } else {
                    res.statusCode = 500;

                    return res.json({
                        error: 'Server error'
                    });
                }
                log.error('Internal error (%d): %s', res.statusCode, err.message);
            }
        });
    });
});

module.exports = router;
