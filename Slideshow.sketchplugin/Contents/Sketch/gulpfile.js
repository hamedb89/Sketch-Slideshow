var gulp = require('gulp'),
	webpack = require('webpack-stream'),
	insert = require('gulp-insert');

gulp.task('default', ['watch']);

gulp.task('webpack', function(){
	return gulp.src('./src/script.js')
		.pipe(webpack({
			output: {
				path: __dirname,
				filename: "script.cocoascript"
			}
		}))
		.pipe(insert.prepend('__globals = this;'))
		.pipe(gulp.dest('./'));
});

gulp.task('watch', function(){
	gulp.watch('./src/*.js', ['webpack']);
});
