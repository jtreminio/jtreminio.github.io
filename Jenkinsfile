pipeline {
  agent none
  stages {
    stage('Hugo') {
      agent {
        docker {
          image 'cbrgm/drone-hugo:latest'
        }

      }
      steps {
        sh 'hugo'
        stash(name: 'public', includes: 'public')
      }
    }
    stage('Minify') {
      agent {
        docker {
          image 'mysocialobservations/docker-tdewolff-minify'
        }

      }
      steps {
        unstash 'public'
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