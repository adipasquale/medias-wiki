# iterate over biggest files over 200ko in 11ty_input/img/wikidata/**/*
# and reduce their size to 50% of the original
# using ImageMagick's convert command
# https://imagemagick.org/script/convert.php
# https://imagemagick.org/script/command-line-options.php#resize

echo "Reducing image sizes..."
ls -l ./11ty_input/img/wikidata/* | awk '$5 > 200000 {print $9}' | while read -r file; do
  echo "Reducing $file"
  # convert to reduce to max width 500px
  convert "$file" -define jpeg:extent=200kb -resize 500x "$file"
done
