# Export Plugin
module.exports = (BasePlugin) ->
	# Requires
	extendr = require('extendr')
	pathUtil = require('path')
	safefs = require('safefs')
	sm = require('sitemap')

	# Define Plugin
	class SitemapPlugin extends BasePlugin
		# Plugin name
		name: 'sitemap'

		# Plugin configuration
		config:
			cachetime: 10*60*1000 # 10 minute cache period
			changefreq: 'weekly'
			priority: 0.5
			filePath: 'sitemap.xml'
			collectionName: 'html'


		# --------------
		# Docpad events

		# Create the sitemap.xml site-wide data at the very beginning,
		# so that DocPad copies it to the `out` directory

		writeAfter: (opts,next) ->
			docpad = @docpad
			templateData = docpad.getTemplateData()
			docpadConfig = docpad.getConfig()

			# create sitemap data object
			sitemapData = extendr.extend({
				hostname: templateData.site.url
				cachetime: null
				urls: []
			}, @getConfig())

			# Optionaly allow replacement pattern on site urls 
			replaceUrlPattern = sitemapData.replaceUrlPattern or //g
			replaceUrlReplacement = sitemapData.replaceUrlReplacement or ''

			# Error if we have no site url
			unless sitemapData.hostname
				err = new Error('You must specify templateData.site.url in your docpad configuration file')
				return next(err)

			# use global outPath for sitemap path
			sitemapPath = pathUtil.resolve(docpadConfig.outPath, sitemapData.filePath)

			# log
			docpad.log('debug', 'Creating sitemap in ' + sitemapPath)

			# Optionally add index url to the sitemap
			if sitemapData.addIndexUrl
				data =
					url: templateData.site.url
					changefreq: sitemapData.changefreq
					priority: sitemapData.priority

				docpad.log "debug", data
				sitemapData.urls.push data				

			# loop over just the html files in the resulting collection
			docpad.getCollection(sitemapData.collectionName).sortCollection(date:1).forEach (document) ->
				if (document.get('sitemap') isnt false) and (document.get('write') isnt false) and (document.get('ignored') isnt true)

					# Perform any replacements necessary to the url
					documentUrl = document.get('url').replace replaceUrlPattern, replaceUrlReplacement
					if sitemapData.removeExtension
						documentUrl = documentUrl.replace /\.html/g, ''

					# create document's sitemap data
					data =
						url: documentUrl
						changefreq: document.get('changefreq') ? sitemapData.changefreq
						priority: document.get('priority') ? sitemapData.priority

					docpad.log "debug", data
					sitemapData.urls.push data

			# setup sitemap with our data
			sitemap = sm.createSitemap(sitemapData);

			# write the sitemap to file
			safefs.writeFile sitemapPath, sitemap.toString(), (err) ->
				# bail on error? Should really do something here
				return next?(err)  if err

				# log
				docpad.log('debug', "Wrote the #{sitemapData.filePath} file to: #{sitemapPath}")

				# Done, let DocPad proceed
				return next()

			# Chain
			@
