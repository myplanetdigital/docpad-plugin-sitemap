// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = function(BasePlugin) {
    var SitemapPlugin, extendr, pathUtil, safefs, sm, _ref;
    extendr = require('extendr');
    pathUtil = require('path');
    safefs = require('safefs');
    sm = require('sitemap');
    return SitemapPlugin = (function(_super) {
      __extends(SitemapPlugin, _super);

      function SitemapPlugin() {
        _ref = SitemapPlugin.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      SitemapPlugin.prototype.name = 'sitemap';

      SitemapPlugin.prototype.config = {
        cachetime: 10 * 60 * 1000,
        changefreq: 'weekly',
        priority: 0.5,
        filePath: 'sitemap.xml',
        collectionName: 'html'
      };

      SitemapPlugin.prototype.writeAfter = function(opts, next) {
        var data, docpad, docpadConfig, err, replaceUrlPattern, replaceUrlReplacement, sitemap, sitemapData, sitemapPath, templateData;
        docpad = this.docpad;
        templateData = docpad.getTemplateData();
        docpadConfig = docpad.getConfig();
        sitemapData = extendr.extend({
          hostname: templateData.site.url,
          cachetime: null,
          urls: []
        }, this.getConfig());
        replaceUrlPattern = sitemapData.replaceUrlPattern || /(?:)/g;
        replaceUrlReplacement = sitemapData.replaceUrlReplacement || '';
        if (!sitemapData.hostname) {
          err = new Error('You must specify templateData.site.url in your docpad configuration file');
          return next(err);
        }
        sitemapPath = pathUtil.resolve(docpadConfig.outPath, sitemapData.filePath);
        docpad.log('debug', 'Creating sitemap in ' + sitemapPath);
        if (sitemapData.addIndexUrl) {
          data = {
            url: templateData.site.url,
            changefreq: sitemapData.changefreq,
            priority: sitemapData.priority
          };
          docpad.log("debug", data);
          sitemapData.urls.push(data);
        }
        docpad.getCollection(sitemapData.collectionName).sortCollection({
          date: 1
        }).forEach(function(document) {
          var documentUrl, _ref1, _ref2;
          if ((document.get('sitemap') !== false) && (document.get('write') !== false) && (document.get('ignored') !== true)) {
            documentUrl = document.get('url').replace(replaceUrlPattern, replaceUrlReplacement);
            if (sitemapData.removeExtension) {
              documentUrl = documentUrl.replace(/(.htm|.html)/g, '');
            }
            data = {
              url: documentUrl,
              changefreq: (_ref1 = document.get('changefreq')) != null ? _ref1 : sitemapData.changefreq,
              priority: (_ref2 = document.get('priority')) != null ? _ref2 : sitemapData.priority
            };
            docpad.log("debug", data);
            return sitemapData.urls.push(data);
          }
        });
        sitemap = sm.createSitemap(sitemapData);
        safefs.writeFile(sitemapPath, sitemap.toString(), function(err) {
          if (err) {
            return typeof next === "function" ? next(err) : void 0;
          }
          docpad.log('debug', "Wrote the " + sitemapData.filePath + " file to: " + sitemapPath);
          return next();
        });
        return this;
      };

      return SitemapPlugin;

    })(BasePlugin);
  };

}).call(this);
