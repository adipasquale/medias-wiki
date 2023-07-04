const slugify = require("@11ty/eleventy/src/Filters/Slugify.js")

const { uniqueBy } = require("./lib/utils.js")

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("11ty_input/css/*.css")
  eleventyConfig.addPassthroughCopy("11ty_input/js/*.js")
  eleventyConfig.addPassthroughCopy("11ty_input/img/**/*")
  eleventyConfig.addPassthroughCopy({ "node_modules/fuse.js/dist/fuse.min.js": "js/fuse.min.js" })

  eleventyConfig.addFilter(
    "displayRelationValeur",
    ({ valeur, valeurMinimum }) => {
      const valeurStr = Math.round((valeur + Number.EPSILON) * 100) / 100
      return valeurMinimum ? `${valeurStr}% ou plus` : `${valeurStr}%`
    }
  )

  eleventyConfig.addFilter("uniqueBy", uniqueBy)

  eleventyConfig.addCollection(
    "proprietaire",
    (collectionApi) => collectionApi
      .getAll()
      .filter(e => ['1', '2'].includes(e.data?.typeCode))
      .filter(e => e.data.graphPosition == "root")
      .sort((a, b) => a.data.nom.localeCompare(b.data.nom))
  );

  eleventyConfig.addCollection(
    "media",
    (collectionApi) => collectionApi
      .getAll()
      .filter(e => ['3'].includes(e.data?.typeCode))
      .filter(e => e.data.graphPosition == "leaf")
      .sort((a, b) => a.data.nom.localeCompare(b.data.nom))
  );

  eleventyConfig.addCollection(
    "entitiesForSearch",
    (collectionApi) =>
      collectionApi
        .getAll()
        .filter(e => e.data?.nom)
        .map(entity => {
          const { slug, nom, typeCode } = entity.data
          const suffix = typeCode === "3" ? " (média)" : "(propriétaire)"
          const path = typeCode === "3" ? `/medias/${slug}` : `/proprietaires/${slug}`
          const nomWithSuffix = `${nom} ${suffix}`
          return { nom, nomWithSuffix, path }
        })
  );

  return {
    dir: {
      input: "11ty_input",
      output: "11ty_output"
    }
  }
};
