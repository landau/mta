js_dir=public/js

# clean
rm $js_dir/_tmp.js

# browserify
./node_modules/.bin/browserify client/main.js > $js_dir/bundle.js

# concat
cat $js_dir/d3.v3.js > $js_dir/_tmp.js
cat $js_dir/fisheye.js >> $js_dir/_tmp.js
cat $js_dir/nv.d3.js >> $js_dir/_tmp.js
cat $js_dir/bundle.js >> $js_dir/_tmp.js

# uglification
./node_modules/.bin/uglifyjs $js_dir/_tmp.js > $js_dir/bundle.min.js

# clean
rm $js_dir/_tmp.js
