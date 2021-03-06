(function() {
  "use strict";
  angular.module('coderDojoControllers', [])
    .controller('homeCtrl', ['$scope', 'Event',
      function($scope, Event) {
        /*Event.next().success(function(data){
          $scope.eventBrite = Event.getEventBrite(data);
          $scope.nextEvent = Event.getDay(data);
          $scope.eventIsSet = $scope.nextEvent>=0;
        });
        */
        var data = new Date(myLocalized.eb.date);
        var now = new Date().getTime();
        $scope.eventBrite = myLocalized.eb.url;
        $scope.nextEvent = Math.floor((data - now) / (1000 * 60 * 60 * 24));
        $scope.eventIsSet = $scope.nextEvent >= 0;
      }
    ])
    .controller('newsCtrl', ['$scope', 'news', 'tags', '$route', '$timeout',
                '$http', 'progress', 'TitleService', 'newsService','mediaService',
                'selectedtag', 'search', '$location',
      function($scope, news, tags, $route, $timeout, $http, progress,
                TitleService, newsService, mediaService, selectedtag, search, $location) {
        //$scope.BASE_URL = "http://pisa.coderdojo.it/news/";
        $scope.news = news.data;
        // for(var i=0; i < $scope.news.length; i++){
        //   (function(i){
        //
        //   }(i));
        // }
        $scope.query = search;
        console.log($scope.news);
        console.log(selectedtag);
        for(var i=0; i<$scope.news.length; i++){
          (function(i){
            mediaService.get($scope.news[i].featured_media).success(function(data){
              $scope.news[i].img = mediaService.getSize(data, 'medium');
            });
            newsService.getAuthor($scope.news[i].author).success(function(data){
              $scope.news[i].author_name = data.name;
            });
          }(i));
        }

        $scope.tags = tags.data;
        $scope.currentTag = selectedtag || -1;
        if ($scope.currentTag != -1)
          TitleService.set($scope.currentTag);

        $scope.orderProp = 'age';

        var httpSearch = function() {
          //progress.start();
          if ($scope.query){
            $location.search('search', $scope.query);
            /*newsService.searchNews($scope.query).success(function(data) {
              console.log('success');
              //progress.complete();
              $scope.news = data;
            });*/
          }else{
            $location.search('search', null);
          }
        };
        //$scope.query = '';
        var searchActive = false;
        $scope.search = function(key) {
          //console.log(key);
          if (!$scope.query) {
            console.log('empty');
            //empty input
            httpSearch();
          } else if (key == 13) {
            //press ENTER
            console.log('enter');
            httpSearch();
          } else if (!searchActive && $scope.query.length > 2) {
            //finish timeout and input large enough
            searchActive = true;
            httpSearch();
            $timeout(function() {
              console.log('timeout');
              searchActive = false;
            }, 3000);
          }
        };
      }
    ])
    .controller('newCtrl', ['$scope', 'news', '$location', 'TitleService', 'mediaService','newsService',
      function($scope, news, $location, TitleService, mediaService, newsService) {
        //$scope.BASE_URL = "http://pisa.coderdojo.it/news/";
        news = news.data[0];
        console.log(news);
        TitleService.set(news.title.rendered);
        if (news === undefined)
          $location.path('/news');
        else {
          $scope.new = news;
          newsService.getAuthor($scope.new.author).success(function(data){
            $scope.new.author_name = data.name;
          });
          mediaService.get($scope.new.featured_media).success(function(data){
            $scope.new.img = mediaService.getSize(data, 'medium_large');
          });
        }
      }
    ])
    .controller('resourceCtrl', ['$scope', 'resource', 'resourceHelper', 'TitleService',
      function($scope, resource, resourceHelper, TitleService) {
        //TitleService.set(resource.title);
        if (resource) {
          $scope.allresource = resource.data;
        }

        for (var i = 0; i < $scope.allresource.length; i++) {
          $scope.allresource[i].resource = JSON.parse($scope.allresource[i].links);
        }
      }
    ])
    .controller('albumsCtrl', ['$scope', 'albums',
      function($scope, albums) {
        $scope.albums = albums.data;
        console.log(albums.data);
        $scope.getImg = function(id) {
          return 'https://graph.facebook.com/' + id + '/picture?type=album';
        };
      }
    ])
    .controller('albumCtrl', ['$scope', 'album','albumid', 'albumsService',
      function($scope, album, albumid, albumsService) {
        $scope.busy = false;
        $scope.paging = album.data.paging;
        $scope.album = album.data.data;

        $scope.getMore = function(){
          console.log('More!');
          console.log($scope.album)

          if (!$scope.busy && $scope.paging.next !== undefined){
            $scope.busy =  true;
            albumsService.getAlbum(albumid, $scope.paging.cursors.after).success(function(data){
              $scope.album = $scope.album.concat(data.data);
              console.log($scope.album)
              $scope.paging = data.paging;
              $scope.busy = false;
            });
          }
        };
        $scope.getImg = function(id) {
          return 'https://graph.facebook.com/' + id + '/picture';
        };
      }
    ])
    .controller('aboutCtrl', ['$scope', 'actualMentors', 'oldMentors',
      function($scope, actualMentors, oldMentors) {
        var mentors = actualMentors.data;
        $scope.champion = mentors[0];
        $scope.people = mentors.slice(1);
        $scope.peopleOld = oldMentors.data;

        // $scope.formatDate = function(date) {
        //   return '(' + date.begin + '-' + date.end + ')';
        // };
        $scope.getImgUrl = function(name){
          return myLocalized.img + 'personal/' + name;
        };
        $scope.sortBySurname = function(p) {
          var slitName = p.name.split(' ');
          // console.log(slitName[slitName.length - 1]);
          return slitName[slitName.length - 1];
        };
      }
    ])
    .controller('mentorCtrl', ['$scope', '$http', 'mailService',
      function($scope, $http, mailService) {
        $scope.selection = [{
          name: "Informatica",
          value: false
        }, {
          name: "Didattica",
          value: false
        }, {
          name: "Esperienze con in bambini",
          value: false
        }, {
          name: "Marketing",
          value: false
        }, {
          name: "Organizazzione eventi",
          value: false
        }];
        $scope.howyouknow = [{
          name: "Giornali",
          value: false
        }, {
          name: "Social",
          value: false
        }, {
          name: "Amici",
          value: false
        }, {
          name: "Newsletter",
          value: false
        }];
        $scope.isSend = false;

        var getValue = function(array) {
          var stringa = "";
          var first = true;
          for (var i = 0; i < array.length; i++) {
            var object = array[i];
            if (object.value === true) {
              if (!first)
                stringa += ', ';
              stringa += object.name;
              first = false;
            }
          }
          return stringa;
        };
        $scope.send = function() {
          var body = '<b>name:</b> ' + $scope.name +
            '<br/> <b>age:</b> ' + $scope.age +
            '<br/> <b>selection:</b> ' + getValue($scope.selection) +
            '<br/> <b>aboutyou:</b> ' + $scope.aboutyou +
            '<br/> <b>howknow:</b> ' + getValue($scope.howyouknow);
          console.log($scope.mail + ' ' + body);
          mailService.send(
            $scope.mail,
            "New mentor want to join us",
            body
          ).success(function(data) {
            console.log(data);
            if (data == 'true')
              $scope.isSend = true;
          });
        };
      }
    ])
    .controller('schoolCtrl', ['$scope', 'mailService',
      function($scope, mailService) {
        $scope.howyouknow = [{
          name: "Giornali",
          value: false
        }, {
          name: "Social",
          value: false
        }, {
          name: "Amici",
          value: false
        }, {
          name: "Newsletter",
          value: false
        }];
        $scope.isSend = false;
        $scope.send = function() {
          mailService.send($scope.mail,
            'New School', [
              '<b>name:</b> ' + $scope.name,
              '<b>school:</b> ' + $scope.scuola,
              '<b>classi:</b> ' + $scope.classe,
              '<b>howknow:</b> ' + mailService.selectionToString($scope.howyouknow),
              '<b>note:</b> ' + $scope.note
            ]).success(function(data) {
            if (data == 'true')
              $scope.isSend = true;
          });
        };
      }
    ])
    .controller('contactCtrl', ['$scope', 'mailService',
      function($scope, mailService) {
        $scope.isSend = false;
        $scope.send = function() {
          //console.log($scope.mail+' '+$scope.subject+' '+$scope.text);
          mailService.send($scope.mail,
                           $scope.subject,
                           $scope.text
          ).success(function(data) {
            console.log(data);
            if (data == 'true')
              $scope.isSend = true;
          });
        };
      }
    ]);
})();
