/**
 This directive is highly coupled with the controller it is used in.
 So THERE MUST BE a "scope.batchRequests" and "scope.requestIdentifier"
 within the wrapper controller of this directive.
*/
(function (module) {
    mifosX.directives = _.extend(module, {
        SuccessfulResponsesDirective: function ($compile, $rootScope) {
            return {
                restrict: 'E',
                require: '?ngmodel',
                link: function (scope, elm, attr, ctrl) {

                    scope.responses = [];

                    scope.failedresponse=[];

                    scope.$watch(function() {
                        return $rootScope.failedResponses;
                    }, function(failedResponses) {
                        scope.failedresponse = failedResponses;

                        if(scope.failedresponse.length > 0) {

                            scope.uniqueId = [];
                            scope.uniqueId1=[];
                            scope.er=[];


                            //fills up the uniqueId array with unique identifiers
                            for (var i = 0; i < scope.failedresponse.length; i++) {
                                for(var j = 0; j < scope.br.length; j++) {
                                    if(scope.failedresponse[i].requestId == scope.br[j].requestId) {
                                        if(scope.failedresponse[i].statusCode!=200) {
                                            var error={};
                                            scope.t=scope.br[j].body;
                                            error.clientId=JSON.parse(scope.br[j].body)[scope.identifier];
                                            scope.er=JSON.parse(scope.failedresponse[i].body)['errors'];
                                            error.errorMessage=scope.er[0].defaultUserMessage;
                                               scope.uniqueId.push(JSON.parse(scope.br[j].body)[scope.identifier]);
                                            scope.uniqueId1.push(error)

                                        }                                    }
                                }
                            }

                            var template = '<div class="error" ng-show="failedResponses.length < batchRequests.length">' +
                                '<h4>Error </h4>' +
                                '<span ng-repeat="errorArray in errorDetails">{{errorArray.userMessageGlobalisationCode}}</span>'+
                                '</div>';

                            elm.html('').append($compile(template)(scope));
                        }
                    });

                    // watch the rootScope variable "successfulResponses"
                    scope.$watch(function() {
                        return $rootScope.successfulResponses;
                    }, function(successfulResponses) {
                        scope.responses = successfulResponses;

                        if(scope.responses.length > 0) {

                            scope.uniqueId = [];
                                              
                            //fills up the uniqueId array with unique identifiers      
                            for (var i = 0; i < scope.responses.length; i++) {
                                for(var j = 0; j < scope.br.length; j++) {
                                    if(scope.responses[i].requestId == scope.br[j].requestId) {
                                        scope.uniqueId.push(JSON.parse(scope.br[j].body)[scope.identifier]);
                                    }
                                }
                            }

                            var template = '<div class="success" ng-show="successfulResponses.length < batchRequests.length">' +
                                '<h4>Responses with listed <strong>'+scope.identifier+'s</strong> were successful</h4>' +
                                '<span ng-repeat="id in uniqueId">{{id+" "}}</span>' +
                                '</div>';

                            elm.html('').append($compile(template)(scope));   
                        }                 
                    });

                    /* watch the batchRequests array for changes within the scope
                    of the controller this directive is inserted in.
                    Most importantly there must always be a "scope.batchRequests" 
                    variable within the controller this directive is inserted in.*/                    
                    scope.$watch(function() {
                        return scope.batchRequests;
                    }, function(batchRequests){
                        scope.br = batchRequests;
                    });

                    /* watch the requestIdentifier for changes within the scope
                    of the controller this directive is inserted in.
                    Most importantly there must always be a "scope.requestIdentifier" 
                    variable within the controller this directive is inserted in.*/                    
                    scope.$watch(function() {
                        return scope.requestIdentifier;
                    }, function(identifier){
                        scope.identifier = identifier;
                    });

                }
            };
        }
    });
}(mifosX.directives || {}));

mifosX.ng.application.directive("successfulResponses", ['$compile', '$rootScope', mifosX.directives.SuccessfulResponsesDirective]).run(function ($log) {
    $log.info("SuccessfulResponsesDirective initialized");
});