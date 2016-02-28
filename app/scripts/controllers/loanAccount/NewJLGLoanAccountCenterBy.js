(function (module) {
    mifosX.controllers = _.extend(module, {
        NewJLGLoanAccountCenterBy: function (scope, rootScope, routeParams, resourceFactory, location, dateFilter) {
            scope.response = {success:[],failed:[]};
            scope.center = {};
            scope.previewRepayment = false;
            scope.center.id = routeParams.centerId;
            scope.staffInSelectedOfficeOnly = true;
            scope.requestIdentifier = "clientId";
            scope.inparams = { resourceType: 'template', templateType: 'jlgbulk', lendingStrategy: 300 };
            scope.selectedProduct = {};
            scope.loanApplicationCommonData = {};  // user set common data for all the loan applications
            scope.loanApplicationCommonData.submittedOnDate = new Date();
            scope.loanApplicationCommonData.expectedDisbursementDate = new Date();
            //scope.loanApplicationCommonData.syncDisbursementWithMeeting = true;
            scope.groupName='';
            scope.clients=[];
            scope.selectedClients=[];
            scope.selectedClients1=[];
            scope.charges=[];
            scope.formData={};
            scope.chargeName='';
            scope.groups=[];
            scope.approveData={};
            if (scope.center.id) {
                scope.inparams.centerId = scope.center.id;
            }

            // Fetch loan products for initital product drop-down
            resourceFactory.loanResource.get(scope.inparams, function (data) {
                scope.products = data.productOptions;
                if (data.center) {
                    scope.center.name = data.center.name;
                }
            });



            scope.loanProductChange = function (loanProductId) {

                scope.inparams.productId = loanProductId;
                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo=data;
                    scope.productDetails = data.product;
                    scope.groups=data.center.groupMembers;
                    scope.loanOfficers = data.loanOfficerOptions;
                    scope.funds = data.fundOptions;
                    scope.caledars = data.calendarOptions;
                    scope.loanPurposes = data.loanPurposeOptions;
                    scope.termFrequency = data.termFrequency;
                    scope.termPeriodFrequencyType = data.termPeriodFrequencyType;
                    for(var i in data.product.charges){
                        scope.chargeName=scope.chargeName+data.product.charges[i].name;
                    }
                    scope.previewRepayments(null,data.principal,scope.groups[0].activeClientMembers[0].id,data.product.charges,null);
                    for( var i in scope.groups ) {
                        scope.clients[i] = scope.groups[i].activeClientMembers.map(function (client) {
                            client.principal = data.product.principal;
                            client.groupId=scope.groups[i].id;
                            client.charges = data.product.charges.map(function (charge) {
                                charge.isDeleted = false;
                                return _.clone(charge);
                            });
                            scope.selectedClients.push(client);
                            scope.selectedClients1.push(client);
                            return client;

                        });

                        scope.groups[i].activeClientMembers=scope.selectedClients1;
                        scope.selectedClients1 =[];
                    }


                });
            };


            scope.selectgroup=function(index,groupId){
                if(groupId!=null){
                    scope.groups[index].isSelected=false;
                }else{
                    scope.groups[index].isSelected=true;
                }
                if(groupId==null) {
                    scope.index1 = 0;
                    angular.forEach(scope.groups[index].activeClientMembers, function (item) {
                        if (!angular.isUndefined(scope.groups[index].activeClientMembers[scope.index1].isSelected)) {
                            scope.groups[index].activeClientMembers[scope.index1].isSelected = true;
                            scope.index1++;
                        }
                        else {
                            scope.groups[index].activeClientMembers[scope.index1].isSelected = true;
                            scope.index1++;
                        }
                    });
                }

            }

            scope.toggleCharge = function (groupIndex,clientIndex, chargeIndex) {
                if(scope.groups[groupIndex].activeClientMembers[clientIndex].charges[chargeIndex].isDeleted){
                    scope.groups[groupIndex].activeClientMembers[clientIndex].charges[chargeIndex].isDeleted=false;
                }
                else{
                    scope.groups[groupIndex].activeClientMembers[clientIndex].charges[chargeIndex].isDeleted = true;
                }

            };
            scope.previewRepayments = function (outerIndex,principal,clientId,charges1,selectedgroupIndex) {
                delete scope.formData.charges;
                this.formData.amortizationType = scope.productDetails.amortizationType.id;
                this.formData.clientId = clientId;
                this.formData.fundId = scope.loanApplicationCommonData.fundId;
                if (charges1 != null) {
                    scope.charges = charges1;
                }
                else{
                    scope.charges =  scope.groups[selectedgroupIndex].activeClientMembers[outerIndex].charges;
                }
                scope.formData.charges = [];
                for (var i in scope.charges) {
                    scope.formData.charges.push({ chargeId: scope.charges[i].id, amount: scope.charges[i].amount, dueDate: dateFilter(scope.charges[i].dueDate, scope.df) });
                }

                if (scope.loanApplicationCommonData.syncDisbursementWithMeeting) {
                    this.formData.calendarId =  scope.caledars[0].id;
                    scope.syncRepaymentsWithMeeting = scope.loanApplicationCommonData.syncDisbursementWithMeeting;;
                }
                delete this.formData.syncRepaymentsWithMeeting;

                this.formData.interestChargedFromDate = dateFilter(scope.loanApplicationCommonData.submittedOnDate, scope.df);
                this.formData.repaymentsStartingFromDate = dateFilter(scope.loanApplicationCommonData.interestchargedfrom, scope.df);
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.loanType = "individual";
                this.formData.productId=scope.productDetails.id;
                this.formData.loanTermFrequency= scope.termFrequency;
                this.formData.loanTermFrequencyType= scope.termPeriodFrequencyType;
                if(principal!=null) {
                    this.formData.principal = principal;
                }
                else{
                    this.formData.principal= scope.groups[selectedgroupIndex].activeClientMembers[outerIndex].principal;
                }
                this.formData.expectedDisbursementDate = dateFilter(scope.loanApplicationCommonData.expectedDisbursementDate, scope.df);
                this.formData.submittedOnDate =  dateFilter(scope.loanApplicationCommonData.submittedOnDate, scope.df);
                this.formData.interestCalculationPeriodType = scope.productDetails.interestCalculationPeriodType.id;
                this.formData.numberOfRepayments = scope.productDetails.numberOfRepayments;
                this.formData.interestRatePerPeriod = scope.productDetails.interestRatePerPeriod;
                this.formData.interestCalculationPeriodType = scope.productDetails.interestCalculationPeriodType.id;
                this.formData.interestType = scope.productDetails.interestType.id;
                this.formData.loanTermFrequency = scope.termFrequency;
                this.formData.loanTermFrequencyType = scope.termPeriodFrequencyType.id;
                this.formData.repaymentEvery = scope.productDetails.repaymentEvery;
                this.formData.repaymentFrequencyType = scope.productDetails.repaymentFrequencyType.id;
                this.formData.transactionProcessingStrategyId = scope.productDetails.transactionProcessingStrategyId;

                resourceFactory.loanResource.save({command: 'calculateLoanSchedule'}, this.formData, function (data) {
                    scope.repaymentscheduleinfo = data;
                    if(outerIndex!=null) {
                        scope.previewRepayment = true;
                    }
                    scope.formData.syncRepaymentsWithMeeting = scope.syncRepaymentsWithMeeting;

                });
                // return scope.repaymentscheduleinfo;
            }


            scope.submit = function () {

                this.batchRequests = [];
                for (var i in scope.selectedClients ) {
                    if( scope.selectedClients[i].isSelected ){

                        var loanApplication = {};

                        loanApplication.locale = scope.optlang.code;
                        loanApplication.dateFormat =  scope.df;
                        loanApplication.groupId = scope.selectedClients[i].groupId;
                        loanApplication.clientId =  scope.selectedClients[i].id;
                        if(scope.caledars) {
                            loanApplication.calendarId = scope.caledars[0].id;
                        }
                        loanApplication.loanType = 'jlg';
                        loanApplication.productId = scope.productDetails.id;
                        loanApplication.fundId = scope.loanApplicationCommonData.fundId;
                        loanApplication.numberOfRepayments = scope.productDetails.numberOfRepayments;
                        loanApplication.repaymentEvery = scope.productDetails.repaymentEvery;
                        loanApplication.repaymentFrequencyType = scope.productDetails.repaymentFrequencyType.id;
                        loanApplication.interestRatePerPeriod = scope.productDetails.interestRatePerPeriod;
                        loanApplication.amortizationType = scope.productDetails.amortizationType.id;
                        loanApplication.interestType = scope.productDetails.interestType.id;
                        loanApplication.interestCalculationPeriodType = scope.productDetails.interestCalculationPeriodType.id;
                        loanApplication.inArrearsTolerance = scope.productDetails.inArrearsTolerance;
                        loanApplication.graceOnPrincipalPayment = scope.productDetails.graceOnPrincipalPayment;
                        loanApplication.graceOnInterestPayment = scope.productDetails.graceOnInterestPayment;
                        loanApplication.transactionProcessingStrategyId = scope.productDetails.transactionProcessingStrategyId;
                        loanApplication.loanTermFrequency = scope.termFrequency;
                        loanApplication.loanTermFrequencyType = scope.termPeriodFrequencyType.id;

                        loanApplication.loanOfficerId = scope.loanApplicationCommonData.loanOfficerId;
                        loanApplication.principal =  scope.selectedClients[i].principal;
                        loanApplication.expectedDisbursementDate = dateFilter(scope.loanApplicationCommonData.expectedDisbursementDate, scope.df);
                        loanApplication.submittedOnDate =  dateFilter(scope.loanApplicationCommonData.submittedOnDate, scope.df);
                        loanApplication.syncDisbursementWithMeeting = scope.loanApplicationCommonData.syncDisbursementWithMeeting;
                        loanApplication.interestChargedFromDate =  dateFilter(scope.loanApplicationCommonData.interestchargedfrom, scope.df);
                        loanApplication.repaymentsStartingFromDate =  dateFilter( scope.loanApplicationCommonData.firstrepaymentDate, scope.df);
                        loanApplication.externalId=scope.selectedClients[i].extId;

                        loanApplication.charges = [];

                        for (var j in  scope.selectedClients[i].charges) {

                            if(! scope.selectedClients[i].charges[j].isDeleted){
                                var charge = {};
                                charge.amount =  scope.selectedClients[i].charges[j].amount;
                                charge.chargeId =  scope.selectedClients[i].charges[j].id;
                                loanApplication.charges.push(charge);
                            }

                        }

                        this.batchRequests.push({requestId: i, relativeUrl: "loans",
                            method: "POST", body: JSON.stringify(loanApplication)});

                    }

                }

                resourceFactory.batchResource.post(this.batchRequests, function (data) {

                    for (var i = 0; i < data.length; i++) {
                        if(data[i].statusCode == 200 )
                            scope.response.success.push(data[i]);
                        else
                            scope.response.failed.push(data[i]);

                    }

                    if(scope.response.failed.length === 0 ){
                        location.path('/viewcenter/' + scope.center.id);
                    }

                });


            };

            /* Cancel button action */
            scope.cancel = function () {
                if (scope.group.id) {
                    location.path('/viewcenter/' + scope.center.id);
                }
            };



        } // End of NewJLGLoanAccAppController

    });
    mifosX.ng.application.controller('NewJLGLoanAccountCenterBy', ['$scope', '$rootScope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.NewJLGLoanAccountCenterBy]).run(function ($log) {
        $log.info("NewJLGLoanAccountCenterBy initialized");
    });
}(mifosX.controllers || {}));