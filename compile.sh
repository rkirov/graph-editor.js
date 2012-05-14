#!/bin/bash
PREFIX=.
BUILD_DIR=$PREFIX/build
SRC_DIR=$PREFIX/src
CLOSURE_DIR=$PREFIX/lib/closure

FILES=$(echo $SRC_DIR/{intro.js,misc.js,vector_algebra.js,graph.js,physics.js,controller.js,import_export.js,UI.js,editor.js,outro.js})

if [ ! -d $BUILD_DIR ]; then
  mkdir $BUILD_DIR
fi
cat $FILES > $BUILD_DIR/graph-editor.js
java -jar $CLOSURE_DIR/compiler.jar --js $BUILD_DIR/graph-editor.js > $BUILD_DIR/graph-editor.min.js
