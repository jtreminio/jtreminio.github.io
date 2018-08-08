pipeline {
  agent none
  stages {
    stage('Hugo') {
      agent {
        docker {
          image 'skyscrapers/hugo:0.46'
        }

      }
      steps {
        sh 'hugo'
      }
    }
    stage('Minify') {
      agent {
        docker {
          image 'mysocialobservations/docker-tdewolff-minify'
        }

      }
      steps {
        sh '''minify --recursive --verbose --match=\\.*.js$ \\
    --type=js --output public/ public/
      - >-
minify --recursive --verbose --match=\\.*.css$ \\
    --type=css --output public/ public/
      - >-
minify --recursive --verbose --match=\\.*.html$ \\
    --type=html --output public/ public/'''
      }
    }
  }
}