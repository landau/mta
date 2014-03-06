# clean
rm public/js/_tmp.js

# browserify
./node_modules/.bin/browserify client/main.js > public/js/bundle.js

# concat
cat public/js/d3.v3.js > public/js/_tmp.js
cat public/js/fisheye.js >> public/js/_tmp.js
cat public/js/nv.d3.js >> public/js/_tmp.js
cat public/js/bundle.js >> public/js/_tmp.js

# uglification
./node_modules/.bin/uglifyjs public/js/_tmp.js > public/js/bundle.min.js

# clean
rm public/js/_tmp.js
