module.exports = function (grunt) {

    'use strict';

    // Force use of Unix newlines
    grunt.util.linefeed = '\n';

    // for compiling bootstrap
    var bsConfig = grunt.file.readJSON('node_modules/bootstrap/grunt/configBridge.json', {
            encoding : 'utf8'
        });
    var bValidatorFiles = ['js/bValidator.js', 'js/bValidator.defaultOptions.js', 'js/bValidator.modifiers.js', 'js/bValidator.validators.js', 'js/jQuery.bValidator.js'];

    // Project configuration.
    grunt.initConfig({

        pkg : grunt.file.readJSON('package.json'),
        docFolder : 'dist-docs',

        banner : '/*!\n' +
        ' * bValidator v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
        ' */\n',

        uglify : {
            bvalidator : {
                options : {
                    sourceMap : true
                },
                files : {
                    'dist/jquery.bvalidator.min.js' : bValidatorFiles,
                }
            },
            docs : {
                files : {
                    '<%= docFolder %>/lib/js/bvalidator-docs.min.js' : ['documentation/js/bdocs.js', 'documentation/js/init.js']
                }
            },
            presenters : {
                options : {
                    // sourceMap : true
                },
                files : {
                    'dist/themes/presenters/default.min.js' : 'themes/presenters/bValidator.DefaultPresenter.js',
                    'dist/themes/presenters/bs3form.min.js' : 'themes/presenters/bValidator.Bs3FormPresenter.js',
                    'dist/themes/presenters/bs3popover-tooltip.min.js' : 'themes/presenters/bValidator.Bs3PopoverTooltipPresenter.js',
                    'dist/themes/presenters/group.min.js'  : 'themes/presenters/bValidator.GroupPresenter.js',
                    'dist/themes/presenters/insert.min.js' : 'themes/presenters/bValidator.InsertPresenter.js'

                }
            },
        },

        concat : {
            bvalidator_js : {
                src : bValidatorFiles,
                dest : 'dist/jquery.bvalidator.js'
            }
        },

        less : {
            compile_docs : {
                options : {
                    strictMath : true,
                    outputSourceFiles : true
                },
                src : 'documentation/less/styles.less',
                dest : '<%= docFolder %>/lib/css/bvalidator-docs.css'
            },
        },

        autoprefixer : {
            options : {
                browsers : bsConfig.config.autoprefixerBrowsers
            },
            docs : {
                //options: { map: true },
                src : '<%= docFolder %>/lib/css/bvalidator-docs.css'
            },
            themes : {
                src : ['dist/themes/**/*.css']
            },
        },

        cssmin : {
            options : {
                compatibility : 'ie8',
                keepSpecialComments : '*',
                advanced : false
            },
            docs : {
                src : ['<%= docFolder %>/lib/css/bvalidator-docs.css'],
                dest : '<%= docFolder %>/lib/css/bvalidator-docs.min.css'
            },
        },

        csslint : {
            options : {
                csslintrc : '.csslintrc'
            },
            themes : ['themes/**/*.css'],
        },

        jshint : {
            options : {
                jshintrc : '.jshintrc'
            },
            bvalidator : {
                src : ['js/*.js', 'js/lang/*.js']
            },
            docs : {
                src : ['documentation/js/*.js', '!documentation/js/tw.js', '!documentation/js/ga.js', '!documentation/js/fb.js']
            },
            themes : {
                src : ['themes/**/*.js']
            },
        },

        jscs : {
            options : {
                config : '.jscsrc'
            },
            bvalidator : {
                src : ['js/*.js', 'js/lang/*.js']
            },
            docs : {
                src : ['documentation/js/*.js', '!documentation/js/tw.js', '!documentation/js/ga.js', '!documentation/js/fb.js']
            },
            themes : {
                src : ['themes/**/*.js']
            },
        },

        copy : {
            prettify : {
                cwd : 'documentation/prettify/',
                expand : true,
                src : '**',
                dest : '<%= docFolder %>/lib/prettify/',
            },
            codemirror_active_line : {
                src : 'node_modules/codemirror/addon/selection/active-line.js',
                dest : '<%= docFolder %>/lib/codemirror/addon/selection/active-line.js'
            },
            codemirror_mode_css : {
                expand : true,
                cwd : 'node_modules/codemirror/mode/css',
                src : '**',
                dest : '<%= docFolder %>/lib/codemirror/mode/css'
            },
            codemirror_mode_htmlmixed : {
                expand : true,
                cwd : 'node_modules/codemirror/mode/htmlmixed',
                src : '**',
                dest : '<%= docFolder %>/lib/codemirror/mode/htmlmixed'
            },
            codemirror_mode_xml : {
                expand : true,
                cwd : 'node_modules/codemirror/mode/xml',
                src : '**',
                dest : '<%= docFolder %>/lib/codemirror/mode/xml'
            },
            codemirror_mode_javascript : {
                expand : true,
                cwd : 'node_modules/codemirror/mode/javascript',
                src : '**',
                dest : '<%= docFolder %>/lib/codemirror/mode/javascript'
            },
            codemirror_lib : {
                expand : true,
                cwd : 'node_modules/codemirror/lib',
                src : '**',
                dest : '<%= docFolder %>/lib/codemirror/lib'
            },
            codemirror_theme : {
                src : 'documentation/css/codemirror-bdocs-theme.css',
                dest : '<%= docFolder %>/lib/codemirror/theme/bdocs.css'
            },
            jquery : {
                src : 'node_modules/jquery/dist/jquery.min.js',
                dest : '<%= docFolder %>/lib/js/jquery.min.js'
            },
            bootstrap_fonts : {
                cwd : 'node_modules/bootstrap/fonts/',
                expand : true,
                src : '**',
                dest : '<%= docFolder %>/lib/bootstrap/fonts/'
            },
            bootstrap_js : {
                src : 'node_modules/bootstrap/dist/js/bootstrap.min.js',
                dest : '<%= docFolder %>/lib/bootstrap/js/bootstrap.min.js'
            },
            bvalidator_themes : {
                expand : true,
                cwd : 'themes/',
                src : ['**', '!presenters/*'],
                dest : 'dist/themes'
            },
            bvalidator_themes_bs3presenter : {
                src : 'themes/presenters/bValidator.Bs3PopoverTooltipPresenter.js',
                dest : 'dist/themes/presenters/bs3popover-tooltip.js',
            },
            bvalidator_themes_insert : {
                src : 'themes/presenters/bValidator.InsertPresenter.js',
                dest : 'dist/themes/presenters/insert.js',
            },
            bvalidator_themes_group : {
                src : 'themes/presenters/bValidator.GroupPresenter.js',
                dest : 'dist/themes/presenters/group.js',
            },
            bvalidator_themes_bs3form : {
                src : 'themes/presenters/bValidator.Bs3FormPresenter.js',
                dest : 'dist/themes/presenters/bs3form.js',
            },
            bvalidator_themes_default : {
                src : 'themes/presenters/bValidator.DefaultPresenter.js',
                dest : 'dist/themes/presenters/default.js',
            },
            bvalidator_lang : {
                expand : true,
                cwd : 'js/lang/',
                src : '**',
                dest : 'dist/lang'
            },
            ajax_response : {
                expand : true,
                cwd : 'documentation/examples/',
                src : '*.txt',
                dest : '<%= docFolder %>/lib/ajax-response/'
            },
            dist_2_doc : {
                expand : true,
                cwd : 'dist/',
                src : '**',
                dest : '<%= docFolder %>/bvalidator-dist/'
            },
        },

        clean : {
            dist : 'dist/*',
            docs_css : '<%= docFolder %>/lib/css/bvalidator-docs.css',
            dist_docs : ['<%= docFolder %>/bvalidator-dist', '<%= docFolder %>/lib', '<%= docFolder %>/index.html']
        },

        watch : {
            documentation_html : {
                files : ['documentation/documentation.html', 'documentation/pre/*', 'documentation/examples/*'],
                tasks : ['ejs:dev_documentation']
            },
            docs_css : {
                files : ['documentation/less/*'],
                tasks : ['docs_css_dev']
            },
            themes : {
                files : 'themes/**/*',
                tasks : ['themes', 'copy:dist_2_doc']
            },
            bvalidator : {
                files : bValidatorFiles,
                tasks : ['bvalidator', 'copy:dist_2_doc']
            },
        },

        ejs : {
            documentation : {
                options : {
                    dev : 0,
                    editable : true,
                    resizeLabels : false,
                    brInput : true,
                    bdocsExampleHtml : true,
                    themeExample: false,
                    shareIcons: true,
                    ga: true,
                    version: '<%= pkg.version %>'
                },
                src : ['documentation/documentation.html'],
                dest : '<%= docFolder %>/index.html',
            },
            dev_documentation : {
                options : {
                    dev : 1,
                    editable : true,
                    resizeLabels : false,
                    brInput : true,
                    bdocsExampleHtml : true,
                    themeExample: false,
                    shareIcons: false,
                    ga: false,
                    version: '<%= pkg.version %>'
                },
                src : ['documentation/documentation.html'],
                dest : '<%= docFolder %>/index.html',
            },
        },

        compress: {
            distzip: {
                options: {
                    archive: '<%= docFolder %>/archives/bvalidator-<%= pkg.version %>-dist.zip',
                    mode: 'zip',
                    level: 9,
                    pretty: true
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['lang/**', 'themes/**', 'jquery.*'],
                    dest: ''
                    }]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ejs');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('codemirror', ['copy:codemirror_active_line', 'copy:codemirror_mode_css', 'copy:codemirror_mode_htmlmixed', 'copy:codemirror_mode_xml', 'copy:codemirror_mode_javascript', 'copy:codemirror_lib', 'copy:codemirror_theme']);

    grunt.registerTask('bootstrap', ['copy:bootstrap_fonts', 'copy:bootstrap_js']);

    grunt.registerTask('bvalidator', ['uglify:bvalidator', 'concat:bvalidator_js', 'jshint:bvalidator', 'jscs:bvalidator']);

    grunt.registerTask('themes', ['jshint:themes', 'jscs:themes', 'copy:bvalidator_themes', 'autoprefixer:themes', 'copy:bvalidator_themes_bs3presenter', 'copy:bvalidator_themes_insert', 'copy:bvalidator_themes_group', 'copy:bvalidator_themes_bs3form', 'copy:bvalidator_themes_default', 'uglify:presenters']);

    grunt.registerTask('lang', ['copy:bvalidator_lang']);

    grunt.registerTask('docs_css',     ['less:compile_docs', 'cssmin:docs', 'autoprefixer:docs', 'clean:docs_css']);
    grunt.registerTask('docs_css_dev', ['less:compile_docs', 'cssmin:docs', 'autoprefixer:docs']);

    grunt.registerTask('docs-dist',     ['clean:dist_docs', 'codemirror', 'bootstrap', 'jshint:docs', 'jscs:docs', 'ejs:documentation', 'uglify:docs', 'copy:prettify', 'copy:jquery', 'docs_css',     'copy:ajax_response', 'compress:distzip', 'copy:dist_2_doc']);
    grunt.registerTask('docs-dev', ['clean:dist_docs', 'codemirror', 'bootstrap', 'jshint:docs', 'jscs:docs', 'ejs:dev_documentation',            'copy:prettify', 'copy:jquery', 'docs_css_dev', 'copy:ajax_response',                     'copy:dist_2_doc']);

    grunt.registerTask('dist',     ['clean:dist', 'themes', 'lang', 'bvalidator']);

};
