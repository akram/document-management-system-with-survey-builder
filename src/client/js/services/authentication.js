(function() {

  angular
    .module('app')
    .service('authentication', authentication);

  authentication.$inject = ['$http', '$window'];

  function authentication($http, $window) {

    var saveToken = function(token) {
      $window.localStorage['mean-token'] = token;
    };

    var getToken = function() {
      return $window.localStorage['mean-token'];
    };

    var isLoggedIn = function() {
      var token = getToken();
      var payload;

      if (token) {
        payload = token.split('.')[1];
        payload = $window.atob(payload);
        payload = JSON.parse(payload);

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };

    var currentClient = function() {
      if (isLoggedIn()) {
        var token = getToken();
        var payload = token.split('.')[1];
        payload = $window.atob(payload);
        payload = JSON.parse(payload);
        return {
          username: payload.username,
          role: payload.role,
          department: payload.department
        };
      }
    };

    var register = function(client) {
      return $http.post('/api/auth/register/', client)
        .then(function(response) {
            return response;
          },
          function(response) {
            console.log("error: " + response);
          }
        );
    };

    var login = function(client) {
      return $http.post('/api/auth/login/', client)
        .then(function(response) {
            saveToken(response.data.token);
            return response;
          },
          function(response) {
            return response;
          }
        );
    };

    var logout = function() {
      $window.localStorage.removeItem('mean-token');
    };

    return {
      currentClient: currentClient,
      saveToken: saveToken,
      getToken: getToken,
      isLoggedIn: isLoggedIn,
      register: register,
      login: login,
      logout: logout
    };
  }

})();