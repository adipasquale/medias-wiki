const fs = require('fs')
const path = require('node:path')
const matter = require('gray-matter')

const removeFilenameExt = (fn) => path.basename(fn, path.extname(fn))

let imagePathsBySlug = fs.readdirSync('11ty_input/img/wikipedia/')
  .reduce(
    (acc, filename) => ({ ...acc, [removeFilenameExt(filename)]: `img/wikipedia/${filename}` })
    , {})

imagePathsBySlug = fs.readdirSync('11ty_input/img/wikidata')
  .reduce(
    (acc, filename) => ({ ...acc, [removeFilenameExt(filename)]: `img/wikidata/${filename}` })
    , imagePathsBySlug) // prefer wikidata over wikipedia images

console.log("imagePathsBySlug", imagePathsBySlug)

// is cli arg --overwrite present?
const overwrite = process.argv.slice(2).includes('--overwrite')

for (const dir of ['11ty_input/medias', '11ty_input/proprietaires']) {
  // iterate over .md files in dir
  fs.readdirSync(dir)
    .filter(filename => filename.endsWith('.md'))
    .forEach(filename => {
      console.log(`Processing ${dir}/${filename}`)
      const parsed = matter.read(`${dir}/${filename}`)
      if (parsed.data.imagePath && !overwrite) return

      const slug = path.basename(filename, '.md')
      console.log("searching slug in imagePathsBySlug", slug)
      const imagePath = imagePathsBySlug[slug]
      if (!imagePath) {
        console.log(`No image found for ${slug}`)
        return
      }

      console.log("writing imagePath in frontmatter", imagePath)
      fs.writeFileSync(
        `${dir}/${filename}`,
        matter.stringify(parsed.content, { ...parsed.data, imagePath })
      )
    })
}
