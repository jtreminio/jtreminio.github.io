## jtreminio.com

Hugo files for jtreminio.com

# Usage

Clone this repo:

    git clone https://github.com/jtreminio/jtreminio.com.git
    cd jtreminio.com

Start the Hugo server:

    ./bin/hugo-server

Open http://localhost:1313/

# Other tools

To publish static files:

    ./bin/hugo-publish
    
Files are generated into `/public`

To minify CSS/HTML/JS files in `/public` (after publish):

    ./bin/minify
    
To run an nginx container from files in `/public` (after publish):

    ./bin/nginx

## Credit

* Uses [starbootstrap.com's Clean Blog](https://startbootstrap.com/template-overviews/clean-blog/)
* Uses [humboldtux/startbootstrap-clean-blog](https://github.com/humboldtux/startbootstrap-clean-blog)

## License

MIT!
