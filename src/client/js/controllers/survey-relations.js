function SurveyRelationsController($scope, $state, $http, $stateParams, commonFactory) {

  initalizeController();

  //SAVE
  $scope.saveSurvey = function() {

    if (!$scope.survey.update) {
      $scope.survey.created = new Date();
      $http.post("/api/surveys/", $scope.survey)
        .then(
          function(response) {
            // success callback
            commonFactory.activateAlert('Encuesta fue guardada exitosamente!', 'success');
          },
          function(response) {
            // failure callback
            console.log(response);
            commonFactory.activateAlert('Woops! Algo paso!', 'danger');
          }
        );
    } else {
      $http.put("/api/surveys/" + $scope.survey._id, $scope.survey)
        .then(
          function(response) {
            // success callback
            commonFactory.activateAlert('Encuesta fue guardada exitosamente!', 'info');
          },
          function(response) {
            // failure callback
            console.log(response);
            commonFactory.activateAlert('Woops! Algo paso!', 'danger');
          }
        );
    }

  }

  // RELATED TO RELATIONS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  $scope.retrieveServices = function() {
    retrieveServices();
  }


  //HELPER FUNCTIONS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  $scope.goToBuilder = function() {
    if ($scope.survey.update) {
      $state.go('app.survey-builder.edit', {
        'id': $scope.survey._id,
        'survey': $scope.survey
      });
    } else {
      $state.go('app.survey-builder.create', {
        'survey': $scope.survey
      });
    }

  }

  function initalizeController() {
    $scope.survey = $stateParams.survey;
  }

  function retrieveServices() {
    if ($scope.survey.department) {
      let url = '/api/services/' + $scope.survey.department + '/department/';
      $http.get(url)
        .then(
          function(response) {
            $scope.services = response.data;
          },
          function(response) {
            console.log(response);
          }
        );
    }
  }
}

SurveyRelationsController.$inject = ['$scope', '$state', '$http', '$stateParams', 'commonFactory'];
angular.module('app').controller('surveyRelationsController', SurveyRelationsController);
