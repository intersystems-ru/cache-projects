/**
 * Created by Admin on 05.07.2017.
 */
(function(){
    'use strict';

    function EmailCtrl($scope, $http, CONST, notify) {
        $scope.model = {
            email_form: {
                toggle: false,
                email: '',
                server: '',
                port: '',
                ssl: '',
                usetls: '',
                auth: false,
                user: '',
                password: ''
            },
            registered: false,
            recipient_email: '',
            recipients: [],
            ssl_configs: [],
            auth_changed: false
        };

        $scope.onRegisterClick = onRegisterClick;
        $scope.onAddClick = onAddClick;
        $scope.onRemoveClick = onRemoveClick;
        $scope.onTestClick = onTestClick;
        $scope.toggleEmail = toggleEmail;

        function toggleEmail() {
            $http({
                method: 'POST',
                url: CONST.protocol + '//' + CONST.host + '/' + CONST.appname + '/email_toggle',
                data: {toggle: $scope.model.email_form.toggle ? 1 : 0}
            }).then(function success(response) {
                var data = response.data;
                $scope.model.registered = !!data.registered;

                var msg = $scope.model.email_form.toggle ? 'enabled' : 'disabled';

                notify({
                    message: 'Email notification has been '+msg,
                    classes: 'alert-success'
                });
            }, function error(response) {
                $scope.model.email_form.toggle = !$scope.model.email_form.toggle;
                if (response.status = 500) {
                    notify({
                        message: response.data.summary,
                        classes: 'alert-danger'
                    });
                } else {
                    notify({
                        message:  response.data,
                        classes: 'alert-danger'
                    });
                }
            });
        }

        function onRegisterClick() {
            var send_data = {
                ssl: $scope.model.email_form.ssl,
                usetls: $scope.model.email_form.usetls ? 1: 0,
                server: $scope.model.email_form.server,
                auth: $scope.model.email_form.auth ? 1: 0,
                auth_changed: $scope.model.auth_changed ? 1: 0,
                username: $scope.model.email_form.user,
                password: $scope.model.email_form.password
            };

            if (validatePort($scope.model.email_form.port)) {
                send_data.port = $scope.model.email_form.port;
            } else {
                send_data = null;
                notify({
                    message: 'Port is not valid.',
                    classes: 'alert-danger'
                });
                return;
            }

            if (validateEmail($scope.model.email_form.email)) {
                send_data.email = $scope.model.email_form.email;
            } else {
                send_data = null;
                notify({
                    message: 'Email is not valid.',
                    classes: 'alert-danger'
                });
                return;
            }

            $http({
                method: 'POST',
                url: CONST.protocol + '//' + CONST.host + '/' + CONST.appname + '/email',
                data: send_data
            }).then(function success(response) {
                var data = response.data;
                $scope.model.registered = !!data.registered;

                if (!$scope.model.email_form.auth) {
                    $scope.model.email_form.user = '';
                    $scope.model.email_form.password = '';
                }
            }, function error(response) {
                if (response.status = 500) {
                    notify({
                        message: response.data.summary,
                        classes: 'alert-danger'
                    });
                } else {
                    notify({
                        message:  response.data,
                        classes: 'alert-danger'
                    });
                }
            });

        }

        function validatePort(port) {
            return port > 0 && port < 65536;
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        function onAddClick() {

            if (!validateEmail($scope.model.recipient_email)) {
                notify({
                    message: 'Email is not valid.',
                    classes: 'alert-danger'
                });
                return;
            }

            $http({
                method: 'POST',
                url: CONST.protocol + '//' + CONST.host + '/' + CONST.appname + '/recipient',
                data: {rec: $scope.model.recipient_email}
            }).then(function success(response) {
                $scope.model.recipients.push($scope.model.recipient_email);
                $scope.model.recipient_email = '';
            }, function error(response) {
                if (response.status = 500) {
                    notify({
                        message: response.data.summary,
                        classes: 'alert-danger'
                    });
                } else {
                    notify({
                        message:  response.data,
                        classes: 'alert-danger'
                    });
                }
            });
        }

        function onRemoveClick(key) {
            $http({
                method: 'DELETE',
                url: CONST.protocol + '//' + CONST.host + '/' + CONST.appname + '/recipient',
                data: {rec: $scope.model.recipients[key]}
            }).then(function success(response) {
                $scope.model.recipients.splice(key, 1);
            }, function error(response) {
                if (response.status = 500) {
                    notify({
                        message: response.data.summary,
                        classes: 'alert-danger'
                    });
                } else {
                    notify({
                        message:  response.data,
                        classes: 'alert-danger'
                    });
                }
            });
        }

        function onTestClick() {
            $http({
                method: 'GET',
                url: CONST.protocol + '//' + CONST.host + '/' + CONST.appname + '/test_mail'
            }).then(function success(response) {
                notify({
                    message: 'Your letter has been sent. Check the email.',
                    classes: 'alert-success'
                });
            }, function error(response) {
                if (response.status = 500) {
                    notify({
                        message: response.data.summary,
                        classes: 'alert-danger'
                    });
                } else {
                    notify({
                        message: response.data,
                        classes: 'alert-danger'
                    });
                }
            });
        }

        function getEmailSettings() {
            $http({
                method: 'GET',
                url: CONST.protocol + '//' + CONST.host + '/' + CONST.appname + '/email'
            }).then(function success(response) {
                var data = response.data;

                for (var i = 0; i < data.ssl_list.length; i++) {
                    $scope.model.ssl_configs.push(data.ssl_list[i]);
                }
                $scope.model.email_form.toggle = !!data.enabled;
                $scope.model.registered = (data.enabled && data.email && data.port && data.server);
                $scope.model.email_form.ssl = data.ssl;
                $scope.model.email_form.port = data.port;
                $scope.model.email_form.server = data.server;
                $scope.model.email_form.usetls = !!data.usetls;
                $scope.model.email_form.email = data.email;
                if (data.username) {
                    $scope.model.email_form.auth = true;
                    $scope.model.email_form.user = data.username;
                    $scope.model.email_form.password = '';
                }

            }, function error(response) {
                if (response.status = 500) {
                    notify({
                        message: response.data.summary,
                        classes: 'alert-danger'
                    });
                } else {
                    notify({
                        message:  response.data,
                        classes: 'alert-danger'
                    });
                }
            });
        }
        getEmailSettings();
        
        function getRecipients() {
            $http({
                method: 'GET',
                url: CONST.protocol + '//' + CONST.host + '/' + CONST.appname + '/recipient'
            }).then(function success(response) {
                var data = response.data;

                for (var i = 0; i < data.recipients.length; i++) {
                    $scope.model.recipients.push(data.recipients[i]);
                }

            }, function error(response) {
                if (response.status = 500) {
                    notify({
                        message: response.data.summary,
                        classes: 'alert-danger'
                    });
                } else {
                    notify({
                        message:  response.data,
                        classes: 'alert-danger'
                    });
                }
            });
        }
        getRecipients();
    }

    angular.module('app').controller('email',['$scope', '$http', 'CONST', 'notify', EmailCtrl]);
})();