file=public/css/main.min.css
csso=node_modules/.bin/csso
css_dir=public/css
cat $css_dir/bootstrap.min.css > $file
$csso $css_dir/nv.d3.css >> $file
$csso $css_dir/desert.css >> $file
$csso $css_dir/main.css >> $file
