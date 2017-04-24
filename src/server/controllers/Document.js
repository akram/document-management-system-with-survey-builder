let Document = require('../models/Document');
let path = require("path");
let randomstring = require("randomstring");
let fse = require("fs-extra");

module.exports.downloadFile = function(req, res, next) {
  let file = unescape(req.params.path);

  let filename = path.basename(file);

  res.download(file, filename, (err) => {
    if (err) {
      console.log("ERROR:", err);
    }
  });
}

module.exports.create = function(req, res, next) {
  let doc = new Document(req.body.document);
  doc.created = new Date();

  req.files.forEach((e) => {
    doc.files.push({
      fileName: e.filename,
      path: e.path
    });
  });

  let randomNumber = randomstring.generate({
    length: 5,
    charset: 'numeric'
  });

  doc.code = `${doc.type.code}-${randomNumber}`;

  doc.save(function(error, doc) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(doc);
  });
}

module.exports.update = function(req, res, next) {
  Document.findOne({
    _id: req.params.id
  }, function(error, doc) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    for (prop in req.body) {
      doc[prop] = req.body[prop];
    }

    doc.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(doc);
    });
  });
}

module.exports.delete = function(req, res, next) {
  Document.findOne({
    _id: req.params.id
  }, function(error, removeDoc) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    removeDoc.remove(function(error, doc) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      if (removeDoc.files.length > 0) {
        //retrieves first folder path and deletes the whole folder
        let folderPath = removeDoc.files[0].path.replace(removeDoc.files[0].fileName, "");
        fse.removeSync(folderPath);
      }

      res.json(removeDoc);
    });
  });
}

module.exports.find = function(req, res, next) {
  Document.findOne({
    _id: req.params.id
  }, function(error, doc) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(doc);
  });
}

module.exports.findMyDocuments = function(req, res, next) {
  Document.find({
    'createdBy._id': req.params.id
  }, function(error, docs) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(docs);
  });
}

module.exports.findPendingDocuments = function(req, res, next) {

  let isQuality = (req.params.quality && req.params.quality === "true") ? true : false;
  let isSGIA = (req.params.SGIA && req.params.SGIA === "true") ? true : false;

  if (isSGIA) {
    Document.find({
      status: {
        $ne: 'Publicado'
      },
      requiresSGIA: true,
      approvedByQuality: true,
    }, function(error, docs) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(docs);
    });
  } else if (isQuality) {
    Document.find({
      status: {
        $ne: 'Publicado'
      },
      $or: [{
        approvedBySGIA: true
      }, {
        approvedByQuality: false
      }]
    }, function(error, docs) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(docs);
    });
  } else {
    Document.find({
      status: {
        $ne: 'Publicado'
      },
      'type.blueprint': true,
      blueprintApproved: false
    }, function(error, docs) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      docs = docs.filter((e) => {
        if (e.type.authorized && e.type.authorized.length > 0) {
          return e.type.authorized.map(a => a.user._id).includes(req.params.id);
        }

        return false;
      });

      docs = docs.filter((e) => {
        let approvals = e.approvals.filter((e) => e.forBlueprint && !e.approved);
        return !approvals.map(a => a.user._id).includes(req.params.id);
      });

      res.json(docs);
    });
  }
}

module.exports.updateApprovals = function(req, res, next) {
  Document.update({
    _id: req.params.id
  }, {
    $set: {
      approvals: req.body.approvals,
      status: req.body.status,
      approvedBySGIA: req.body.approvedBySGIA,
      approvedByQuality: req.body.approvedByQuality
    }
  }, function(error, result) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    console.log(result);
    res.json(result);
  });
}

module.exports.search = function(req, res, next) {

  for (var key of Object.keys(req.body)) {
    if (req.body[key] === '') {
      req.body[key] = null;
    }
  }

  Document.find({}, function(error, docs) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    if (req.body.code) {
      docs = docs.filter((doc) => {
        return doc.code.includes(req.body.code);
      });
    }
    if (req.body.name) {
      docs = docs.filter((doc) => {
        return doc.name.includes(req.body.name);
      })
    }
    if (req.body.status) {
      docs = docs.filter((doc) => {
        return doc.status === req.body.status;
      })
    }
    if (req.body.department) {
      docs = docs.filter((doc) => {
        return doc.department === req.body.department;
      })
    }

    res.json(docs);
  });
}
