/* **********************

javascript below not compatible in IE

includes  => .some, indexOf(query) > -1
_ of _ => forEach
find => filter

*********************** */

angular.module('app', ['ionic', 'jett.ionic.filter.bar', 'ui.router'])
    .controller('HomeCtrl', ["$scope", "$timeout", "$state", "sharedService", "$ionicScrollDelegate", "$ionicFilterBar", "$ionicSideMenuDelegate", "$ionicLoading", "$ionicPopup", function ($scope, $timeout, $state, sharedService, $ionicScrollDelegate, $ionicFilterBar, $ionicSideMenuDelegate, $ionicLoading, $ionicPopup) {
        $scope.shareData = sharedService;

        if (!$scope.shareData.flags) {
            $scope.shareData.flags = {};
        }

        $scope.shareData.secondaryOn = true; //bilingual setting
        $scope.$on('$ionicView.loaded', function (e) {

        });
        $scope.$on('$ionicView.beforeLeave', function (e) {
            try {
                document.getElementById('filterBar').style.display = 'none';
            } catch (e) {
                console.log(e);
            }
        });
        $scope.$on('$ionicView.beforeEnter', function (e) {
            try {
                $scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
                document.getElementById('filterBar').style.display = 'inherit';
            } catch (e) {
                console.log(e);
            }
        });

        var dbName = 'kw_DB';
        var storeName = 'kw_storage';

        getDb('flags');
        getDb('contents');
        getDb('contents1');
        getDb('updated');

        $scope.freezeScroll = function () {
            $ionicScrollDelegate.$getByHandle('mainScroll').getScrollView().options.scrollingY = false;
        }
        $scope.enableScroll = function () {
            $ionicScrollDelegate.$getByHandle('mainScroll').getScrollView().options.scrollingY = true;
        }
        //////////////////////////////
        ////// launguage settings 
        //////////////////////////////

        $scope.shareData.local = {
            en: {
                all: "All",
                flagged: "Flagged",
                back: "Back",
                search: "Search",
                cancel: "Cancel",
                def: "Definition",
                nav: "Navigational Note"
            },
            ja: {
                all: "?????????",
                flagged: "???????????????",
                back: "??????",
                search: "??????",
                cancel: "???????????????",
                def: "??????",
                nav: "??????????????????"
            }
        };
        $scope.groupTitle = {
            en: $scope.shareData.local['en']['all'],
            ja: $scope.shareData.local['ja']['all']
        };
        //$scope.shareData.secondaryOn = true;
        $scope.shareData.lang = 'ja';
        $scope.shareData.langJa = true;


        //////////////////////////////
        ////// search filter
        //////////////////////////////

        $scope.showFilterBar = function () {
            if ($ionicSideMenuDelegate.isOpen()) {
                $ionicSideMenuDelegate.toggleLeft();
            }
            filterBarInstance = $ionicFilterBar.show({
                cancel: function () {
                    $scope.shareData.search = '';
                }
            });
        };

        //init(test);

        function init(output) {
            //////////////////////////////
            ////// data loading
            //////////////////////////////
            $scope.shareData.menuSelected = null;
            $scope.shareData.unique = "__rowNum__"; // meddra
            $scope.shareData.term = null;
            $scope.shareData.subterm = null;
            $scope.shareData.group = null;
            $scope.shareData.initContents = JSON.stringify(output);
            var group = null;
            var deleteKey = null;
            try {
                var objKeys0 = Object.keys(output[0]);
                $scope.shareData.headerKeys = objKeys0.filter(function (val, i) {
                    if (val === $scope.shareData.unique) {
                        deleteKey = i;
                        return false;
                    } else {
                        return true;
                    }
                })
                $scope.shareData.headerValues = objKeys0.map(function (key) {
                    return output[0][key];
                }).filter(function (val, i) {
                    return i !== deleteKey;
                });

                var invisibleKey = null;
                $scope.shareData.headerValues.forEach(function (val, i) {
                    if (val === "??????") {
                        invisibleKey = $scope.shareData.headerKeys[i];
                    }
                })

                output = output.filter(function (val, i) {
                    return !val[invisibleKey]
                })
                $scope.shareData.rawList = angular.copy(output.slice(1));
                $scope.shareData.itemList = $scope.shareData.rawList;
                $scope.shareData.drugs = [];
                $scope.shareData.headerValues.forEach(function (val, i) {
                    try {
                        if (val.indexOf("[T]") > -1 && !$scope.shareData.term) {
                            $scope.shareData.term = $scope.shareData.headerKeys[i];
                            $scope.shareData.headerValues[i] = val.replace("[T]", "");
                        } else if (val.indexOf("[S]") > -1 && !$scope.shareData.subterm) {
                            $scope.shareData.subterm = $scope.shareData.headerKeys[i];
                            $scope.shareData.headerValues[i] = val.replace("[S]", "");
                        } else if (val.indexOf("[G]") > -1 && !$scope.shareData.group) {
                            $scope.shareData.group = $scope.shareData.headerKeys[i];
                            group = $scope.shareData.headerKeys[i];
                            $scope.shareData.headerValues[i] = val.replace("[G]", "");
                        }
                        if (val.indexOf("[drug") > -1) { // add
                            $scope.shareData.drugs.push($scope.shareData.headerKeys[i]); // add
                        } // add
                        delete val[$scope.shareData.unique];
                    } catch (e) {
                        console.log(e);
                    }
                })
                if (!$scope.shareData.term) {
                    $scope.shareData.term = "A";
                }
                /*/////////////////////////////////////////////
                        $scope.shareData.group = "B"; //"soc";
                        var group = "B";
                //////////////////////////////////////////////*/

                // making group list

                if ($scope.shareData.group) {
                    $scope.shareData.groupList = $scope.shareData.rawList.map(function (element) {
                        return element[$scope.shareData.group];
                    }).filter(function (x, i, self) {
                        return self.map(function (val) {
                            return val;
                        }).indexOf(x) === i;
                    }).sort(function (a, b) {
                        return a.localeCompare(b);
                    });

                    var divAdded = [];
                    $scope.shareData.rawList.sort(function (a, b) {
                        return a[$scope.shareData.group].localeCompare(b[$scope.shareData.group]) || a[$scope.shareData.term].localeCompare(b[$scope.shareData.term]);
                    });
                    $scope.shareData.groupList.forEach(function (item) {
                        var pos = $scope.shareData.itemList.map(function (element) {
                            return element[$scope.shareData.group];
                        }).indexOf(item);
                        divAdded.unshift(pos);
                    });
                    for (var i in divAdded) {
                        var insert = {}
                        insert[$scope.shareData.term] = $scope.shareData.rawList[divAdded[i]][$scope.shareData.group];
                        insert[$scope.shareData.group] = false;
                        insert[$scope.shareData.unique] = 'divider' + 1;
                        $scope.shareData.rawList.splice(divAdded[i], 0, insert);
                    }
                } else {
                    $scope.shareData.rawList.sort(function (a, b) {
                        return a[$scope.shareData.term].localeCompare(b[$scope.shareData.term]);
                    });
                    $scope.shareData.groupList = [];
                }
            } catch (e) {
                console.log(e);
            }
            // title subtitle group setting


        }

        function init1(output1) {
            //////////////////////////////
            ////// data loading
            //////////////////////////////
            $scope.shareData.initContents1 = JSON.stringify(output1);
            $scope.shareData.term1 = null;
            $scope.shareData.subterm1 = null;
            $scope.shareData.group1 = null;
            var group1 = null;

            var lookupValue = 0;

            $scope.shareData.headerKeys1 = Object.keys(output1[0]);
            $scope.shareData.headerValues1 = $scope.shareData.headerKeys1.map(function (e) {
                return output1[0][e]
            });
            $scope.shareData.lookupKey = $scope.shareData.headerKeys1[lookupValue];
            $scope.shareData.rawList1 = angular.copy(output1.slice(1));
            $scope.shareData.itemList1 = $scope.shareData.rawList1;

            $scope.shareData.rawArr1 = $scope.shareData.rawList1.map(function (val, i) {
                return {
                    drug: val[$scope.shareData.lookupKey],
                    infos: val
                }
            })
            $scope.shareData.headerValues1.forEach(function (val, i) {
                try {
                    if (val.indexOf("[T]") > -1) {
                        $scope.shareData.headerValues1[i] = val.replace("[T]", "");
                    } else if (val.indexOf("[S]") > -1) {
                        $scope.shareData.headerValues1[i] = val.replace("[S]", "");
                    } else if (val.indexOf("[G]") > -1) {
                        $scope.shareData.headerValues1[i] = val.replace("[G]", "");
                    }
                } catch (e) {
                    console.log('error')
                }
            });

            $scope.shareData.rawList1.sort(function (a, b) {
                return a[$scope.shareData.lookupKey].localeCompare(b[$scope.shareData.lookupKey]);
            });
        }

        $scope.shareData.getItemHeight = function (item) {
            if ($scope.shareData.subterm) { //$scope.shareData.subterm
                if ($scope.shareData.group) {
                    if (item[$scope.shareData.group]) {
                        return 64;
                    } else {
                        return 28
                    }
                } else {
                    return 64;
                }
            } else {
                if ($scope.shareData.group) {
                    if (item[$scope.shareData.group]) {
                        return 48;
                    } else {
                        return 28
                    }
                } else {
                    return 48;
                }
            }
        };

        $scope.shareData.hiraToKana = function (str) {
            if (str) {
                return str.replace(/[\u3041-\u3096]/g, function (match) {
                    var chr = match.charCodeAt(0) + 0x60;
                    return String.fromCharCode(chr);
                });
            } else {
                return "";
            }

        }

        // filterd list

        $scope.shareData.filteredList = function () {
            var searchTerm = $scope.shareData.hiraToKana($scope.shareData.search);
            try {
                var childList = [];
                childList = $scope.shareData.rawList1.filter(function (item, i, self) {
                    return $scope.shareData.headerKeys1.some(function (key) {
                        try {
                            return item[key].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
                        } catch (e) {
                            //console.log(item, key, e);
                        }
                    });
                }).map(function (val) {
                    return val["A"];
                })
            } catch (e) {
                //console.log(e);
            }

            if (searchTerm) {
                return $scope.shareData.itemList.filter(function (item, i, self) {
                    if (!(String(item[$scope.shareData.unique]).indexOf("divider") > -1)) {
                        return $scope.shareData.headerKeys.some(function (key) {
                            try {
                                return (item[key].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) || (childList ? childList.some(function (val) {
                                    return item[key].toLowerCase().indexOf(val) > -1
                                }) : false);
                            } catch (e) {
                                //console.log(item, key, e);
                            }
                        });
                    } else {
                        return true;
                    }
                }).filter(function (item, index, self) {
                    try {
                        if ($scope.shareData.group) {
                            return (!item[$scope.shareData.group] && item[$scope.shareData.term] === self[index + 1][$scope.shareData.group]) || item[$scope.shareData.group];
                        } else {
                            return true;
                        }
                    } catch (e) {
                        console.log('no data in a category');
                    }
                });
            } else {
                return $scope.shareData.itemList;
            }
        };

        $scope.shareData.encode = function (obj, key) {

            try {
                var str = key ? (obj[key] ? String(obj[key]) : "") : (obj ? String(obj) : ""); //String(obj[key]);
                var i = String(str).length,
                    a = [];
                while (i--) {
                    var iC = str[i].charCodeAt();
                    if (str[i] === "\"") {
                        a[i] = "&quot;";
                    } else if (str[i] === "&") {
                        a[i] = "&amp;";
                    } else if (iC === 62) {
                        a[i] = "&gt;";
                    } else if (iC === 60) {
                        a[i] = "&lt;";
                    } else {
                        a[i] = str[i];
                    }
                }
                return a.join('') ? a.join('').replace(/???/g, "<span class='prefix'>???</span>") : " ?? ?? ??";
            } catch (e) {
                console.log(e);

            }
        };

        $scope.shareData.headerPref = function (text) {
            var color = "";
            var style = null;
            if (text.indexOf("[C]") > -1) {
                style = true;
                text = text.replace("[C]", "");
            }
            if (text.indexOf("[r]") > -1) {
                color = "red";
                text = text.replace("[r]", "");
            } else if (text.indexOf("[b]") > -1) {
                color = "blue";
                text = text.replace("[b]", "");
            } else if (text.indexOf("[y]") > -1) {
                color = "yellow";
                text = text.replace("[y]", "");
            } else if (text.indexOf("[g]") > -1) {
                color = "green";
                text = text.replace("[g]", "");
            } else {
                color = "sky"; //"#ecf1f7";
            }
            return [text, color, style];
        }

        $scope.scrollTop = function () {
            $ionicScrollDelegate.scrollTop(false);
        };

        $scope.toggleLeft = function () {
            $ionicScrollDelegate.scrollTop(false);
            $scope.shareData.search = '';
            $ionicSideMenuDelegate.toggleLeft();
            $scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
        };

        $scope.flagging = function (id, e) {
            e.preventDefault();
            e.stopPropagation();
            if (!$scope.shareData.flags[id]) {
                $scope.shareData.flags[id] = true;
            } else {
                delete $scope.shareData.flags[id];
            }
            $scope.shareData.setDb('flags', $scope.shareData.flags);
            $scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
        }


        $scope.getItem = function (id, e) {
            var cautionList = [];
            $scope.shareData.drugList = [];
            if (id) {
                $scope.shareData.detail = angular.copy($scope.shareData.itemList.filter(function (item) {
                    return String(item[$scope.shareData.unique]) === String(id);
                })[0]);
                var cautionList = [];

                $scope.shareData.drugs.forEach(function (val, i) {
                    if ($scope.shareData.detail[val]) {
                        $scope.shareData.drugList.push($scope.shareData.detail[val]);
                    }
                    delete $scope.shareData.detail[val];
                });
                try {
                    var cautionItems = [];
                    $scope.shareData.headerValues1.forEach(function (val, i) {
                        if (val.indexOf("r") > -1) {
                            cautionItems.push($scope.shareData.headerKeys1[i]);
                        }
                    })

                    cautionItems1 = [];
                    $scope.shareData.headerValues.forEach(function (val, i) {
                        if (val.indexOf("r") > -1 && !val.indexOf("[drug") > -1) {
                            cautionItems1.push($scope.shareData.headerKeys[i]);
                        }
                    })
                    if (cautionItems1.length > 0) {
                        cautionItems1.forEach(function (ele) {
                            if ($scope.shareData.detail[ele]) {
                                cautionList.unshift($scope.shareData.detail[ele]);
                            }
                        })
                    }

                    $scope.shareData.rawArr1.forEach(function (val) {
                        if ($scope.shareData.drugList.indexOf(val["drug"]) > -1) {

                            var rep = "--- " + val["infos"]["A"] + " (" + val["infos"]["B"] + ") ---"

                            cautionItems.forEach(function (ele) {
                                if (val["infos"][ele]) {
                                    cautionList.push(rep)
                                    cautionList.push(val["infos"][ele]);
                                }
                            })
                        }
                    });
                } catch (e) {
                    console.log(e)
                }
                if (cautionList.length === 0) {
                    cautionList = ["--- ????????????????????? ---", "???????????????????????????????????????????????????", "??????????????????????????????????????????????????????????????????????????????"]
                }
                $scope.shareData.cautionList = cautionList.join("\n");
                $state.go('tabs.detail');
            } else {
                e.preventDefault();
            }
        }

        $scope.shareData.getGroupItems = function (str) {
            if (str) {
                $scope.shareData.menuSelected = str;
                $scope.groupTitle = {
                    en: str,
                    ja: str
                };
                $scope.shareData.itemList = $scope.shareData.rawList.filter(function (item) {
                    if (!item[$scope.shareData.group] && item[$scope.shareData.term] === str) {
                        return true;
                    } else {
                        return item[$scope.shareData.group] === str;
                    }
                });

            } else {
                console.log('null', str);
                $scope.shareData.menuSelected = null;
                $scope.groupTitle = {
                    en: $scope.shareData.local['en']['all'],
                    ja: $scope.shareData.local['ja']['all']
                };
                $scope.shareData.itemList = $scope.shareData.rawList;
            }
            $ionicSideMenuDelegate.toggleLeft();
            $timeout(function () {
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(false);
            });
        }
        $scope.shareData.getDrugInfos1 = function (drug) {
            console.log(drug)
            return $scope.shareData.rawArr1.filter(function (val) {
                return (val["drug"] === drug)
            })[0]["infos"];
        }

        $scope.shareData.getFlag = function () {
            $scope.shareData.menuSelected = "____flag____";
            var flagList = Object.keys($scope.shareData.flags);
            $scope.shareData.itemList = $scope.shareData.rawList.filter(function (item) {
                if (!item[$scope.shareData.group] && $scope.shareData.group) {
                    return true;
                }
                return flagList.some(function (val) {
                    return Number(val) === Number(item[$scope.shareData.unique]);
                });
            }).filter(function (item, index, self) {
                try {
                    if ($scope.shareData.group) {
                        return (!item[$scope.shareData.group] && item[$scope.shareData.term] === self[index + 1][$scope.shareData.group]) || item[$scope.shareData.group];
                    } else {
                        return true
                    }
                } catch (e) {
                    console.log('no data in a category');
                }
            });

            $scope.groupTitle = {
                en: '<i class="icon ion-ios-flag red-flag head"></i>' + $scope.shareData.local['en']['flagged'],
                ja: '<i class="icon ion-ios-flag red-flag head"></i>' + $scope.shareData.local['ja']['flagged']
            };

            $ionicSideMenuDelegate.toggleLeft();
            $timeout(function () {
                $ionicScrollDelegate.scrollTop(false);
            })
        }
        $scope.shareData.removeFlags = function () {

            var confirmPopup = $ionicPopup.confirm({
                title: 'Remove Flags',
                template: 'Are you sure you want to remove all flags?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    var none = {};
                    $scope.shareData.flags = none;
                    $scope.shareData.setDb('flags', none);
                } else {
                    console.log('You are not sure');
                }
            });
        }




        $scope.shareData.setDb = function (setname, value) {
            var openReq = indexedDB.open(dbName);
            openReq.onsuccess = function (event) {
                var db = event.target.result;
                var trans = db.transaction(storeName, 'readwrite');
                var store = trans.objectStore(storeName);

                var putReq = store.put({
                    id: setname,
                    contents: value
                });

                putReq.onsuccess = function () {
                    console.log('put data success');
                }

                trans.oncomplete = function () {
                    console.log('transaction completed');
                }
                db.close();
            }
            openReq.onerror = function (event) {
                console.log('db open error');
            }
        }



        //console.log(new File("../assets/test.xlsx"))

        function getDb(setname) {
            //init(test);
            var openReq = indexedDB.open(dbName);
            openReq.onupgradeneeded = function (event) {
                var db = event.target.result;
                db.createObjectStore(storeName, {
                    keyPath: 'id'
                });
            }
            openReq.onsuccess = function (event) {

                var db = event.target.result;
                var trans = db.transaction(storeName, 'readonly');
                var store = trans.objectStore(storeName);
                var getReq = store.get(setname);

                getReq.onsuccess = function (event) {
                    switch (setname) {
                        case "flags":
                            try {
                                $scope.shareData.flags = event.target.result.contents; // {id : 'A1', name : 'test'}
                                $scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
                            } catch (e) {
                                console.log('error', e);
                            }
                            break;
                        case "contents":
                            try {
                                init(event.target.result.contents);
                                //$scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
                            } catch (e) {
                                console.log('error', e);
                                init(initContents);
                                try {
                                    $scope.shareData.updateTime = "??????????????????????????????";
                                    $scope.shareData.setDb('updated', $scope.shareData.updateTime);
                                } catch (e) {

                                }
                            }
                            // code block
                            break;
                        case "contents1":
                            try {
                                init1(event.target.result.contents);
                                //$scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
                            } catch (e) {
                                console.log('error', e);
                                init1(initContents1);
                            }
                            // code block
                            break;
                            case "updated":
                                try {
                                    $scope.shareData.updateTime = event.target.result.contents;
                                    //$scope.shareData.flagNum = Object.keys($scope.shareData.flags).length;
                                } catch (e) {
                                    console.log('error', e);
                                }
                                // code block
                                break;
                        default:
                            // code block
                    }

                }

                getReq.onerror = function (event) {
                    $scope.shareData.hide();
                    console.log('db not exist');
                }
            }
            openReq.onerror = function (event) {
                $scope.shareData.setDb(setname, $scope.shareData.flags);
            }
        }

        //removeDb('ctcaelite');

        $scope.shareData.dbremove = function (dbName) {
            removeDb(dbName);
        }


        function removeDb(dbName) {
            var deleteReq = indexedDB.deleteDatabase(dbName);
            deleteReq.onsuccess = function (event) {
                console.log('db delete success');

            }
            deleteReq.onerror = function () {
                console.log('db delete error');
            }
        }
        /*
                browsercheck();

                function browsercheck() {
                    var message = false;
                    if (bowser.safari) {
                        message = bowser.check({
                            safari: "11.1"
                        });
                    } else if (bowser.ios) {
                        message = bowser.check({
                            ios: "11.3"
                        });
                    } else if (bowser.chrome) {
                        message = bowser.check({
                            chrome: "45"
                        });
                    } else if (bowser.android) {
                        message = true;
                    } else if (bowser.msedge) {
                        message = bowser.check({
                            msedge: "17"
                        });
                    } else if (bowser.firefox) {
                        message = bowser.check({
                            firefox: "44"
                        });
                    } else if (bowser.opera) {
                        message = bowser.check({
                            opera: "32"
                        });
                    } else {
                        message = false;
                    }
                    if (!message) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Browser not supported',
                            template: 'Your browser may not be compatible fully. Please consider to use the latest version of Chrome, Safari, Firefox or Edge.'
                        });
                        alertPopup.then(function (res) {
                            console.log('');
                        });
                    }

                }
                */

    }])

    .controller('DetailCtrl', ["$scope", "sharedService", function ($scope, sharedService) {
        $scope.shareData = sharedService;

    }])
    .controller('SearchCtrl', ["$scope", "sharedService", function ($scope, sharedService) {
        $scope.shareData = sharedService;

    }])
    .controller('PsCtrl', ["$scope", "sharedService", function ($scope, sharedService) {
        $scope.shareData = sharedService;
        $scope.$on('$ionicView.enter', function (e) {
            try {
                document.getElementById('filterBar').style.display = 'none';
            } catch (e) {
                console.log(e);
            }
        });

        var dbName = 'kw_DB';
        var storeName = 'kw_storage';
        $scope.shareData.fileNameChanged = function (event) {

            try {
                $scope.shareData.removeFlags();
            } catch (e) {
                console.log(e)
            }
            try {
                var files = event.target.files;
                var f = files[0];
                var reader = new FileReader();

                reader.onload = function (e) {
                    var data = e.target.result;
                    var wb;
                    var arr = fixdata(data);
                    wb = XLSX.read(btoa(arr), {
                        type: 'base64',
                        cellDates: true,
                    });
                    var outputpre = angular.copy(to_json(wb)["0"]);
                    var output = outputpre.map(function (val, i) {
                        val["__rowNum__"] = i;
                        return val;
                    })

                    $scope.shareData.setDb("contents", output)
                    //////////////////////////////
                    ////// data loading
                    //////////////////////////////

                    $scope.shareData.unique = "__rowNum__"; // meddra
                    $scope.shareData.term = null;
                    $scope.shareData.subterm = null;
                    $scope.shareData.group = null;
                    var group = null;
                    var deleteKey = null;
                    var objKeys0 = Object.keys(output[0]);
                    $scope.shareData.headerKeys = objKeys0.filter(function (val, i) {
                        if (val === $scope.shareData.unique) {
                            deleteKey = i;
                            return false;
                        } else {
                            return true;
                        }
                    })
                    $scope.shareData.headerValues = objKeys0.map(function (key) {
                        return output[0][key];
                    }).filter(function (val, i) {
                        return i !== deleteKey;
                    });

                    var invisibleKey = null;
                    $scope.shareData.headerValues.forEach(function (val, i) {
                        if (val === "??????") {
                            invisibleKey = $scope.shareData.headerKeys[i];
                        }
                    })
                    output = output.filter(function (val, i) {
                        return !val[invisibleKey];
                    })

                    $scope.shareData.rawList = angular.copy(output.slice(1));
                    $scope.shareData.itemList = $scope.shareData.rawList;
                    $scope.shareData.drugs = []; // add

                    $scope.shareData.headerValues.forEach(function (val, i) {
                        try {
                            if (val.indexOf("[T]") > -1 && !$scope.shareData.term) {
                                $scope.shareData.term = $scope.shareData.headerKeys[i];
                                $scope.shareData.headerValues[i] = val.replace("[T]", "");
                            } else if (val.indexOf("[S]") > -1 && !$scope.shareData.subterm) {
                                $scope.shareData.subterm = $scope.shareData.headerKeys[i];
                                $scope.shareData.headerValues[i] = val.replace("[S]", "");
                            } else if (val.indexOf("[G]") > -1 && !$scope.shareData.group) {
                                $scope.shareData.group = $scope.shareData.headerKeys[i];
                                group = $scope.shareData.headerKeys[i];
                                $scope.shareData.headerValues[i] = val.replace("[G]", "");
                            }
                            if (val.indexOf("[drug") > -1) { // add
                                $scope.shareData.drugs.push($scope.shareData.headerKeys[i]); // add
                            } // add

                        } catch (e) {
                            console.log('error')
                        }
                    })
                    if (!$scope.shareData.term) {
                        $scope.shareData.term = "A";
                    }

                    /*/////////////////////////////////////////////
                    $scope.shareData.group = "B"; //"soc";
                    var group = "B";   
                    //////////////////////////////////////////////*/

                    // making group list

                    if ($scope.shareData.group) {
                        $scope.shareData.groupList = $scope.shareData.rawList.map(function (element) {
                            return element[group];
                        }).filter(function (x, i, self) {
                            return self.map(function (val) {
                                return val;
                            }).indexOf(x) === i;
                        }).sort(function (a, b) {
                            return a.localeCompare(b);
                        });

                        var divAdded = [];
                        $scope.shareData.rawList.sort(function (a, b) {
                            return a[group].localeCompare(b[group]) || a[$scope.shareData.term].localeCompare(b[$scope.shareData.term]);
                        });
                        $scope.shareData.groupList.forEach(function (item) {
                            var pos = $scope.shareData.itemList.map(function (element) {
                                return element[group];
                            }).indexOf(item);
                            divAdded.unshift(pos);
                        });
                        for (var i in divAdded) {
                            var insert = {}
                            insert[$scope.shareData.term] = $scope.shareData.rawList[divAdded[i]][group];
                            insert[group] = false;
                            insert[$scope.shareData.unique] = 'divider' + 1;
                            $scope.shareData.rawList.splice(divAdded[i], 0, insert);
                        }
                    } else {
                        $scope.shareData.rawList.sort(function (a, b) {
                            return a[$scope.shareData.term].localeCompare(b[$scope.shareData.term]);
                        });
                        $scope.shareData.groupList = [];
                    }

                    //////////////////////////////
                    // link
                    //////////////////////////////
                    var output1 = angular.copy(to_json(wb)["1"]);
                    $scope.shareData.setDb("contents1", output1)
                    //////////////////////////////
                    ////// data loading
                    //////////////////////////////

                    $scope.shareData.term1 = null;
                    $scope.shareData.subterm1 = null;
                    $scope.shareData.group1 = null;
                    var group1 = null;

                    var lookupValue = 0;

                    $scope.shareData.headerKeys1 = Object.keys(output1[0]);
                    $scope.shareData.headerValues1 = $scope.shareData.headerKeys1.map(function (e) {
                        return output1[0][e]
                    });
                    $scope.shareData.lookupKey = $scope.shareData.headerKeys1[lookupValue];
                    $scope.shareData.rawList1 = angular.copy(output1.slice(1));
                    $scope.shareData.itemList1 = $scope.shareData.rawList1;

                    $scope.shareData.rawArr1 = $scope.shareData.rawList1.map(function (val, i) {
                        return {
                            drug: val[$scope.shareData.lookupKey],
                            infos: val
                        }
                    })

                    $scope.shareData.headerValues1.forEach(function (val, i) {
                        try {
                            if (val.indexOf("[T]") > -1) {
                                $scope.shareData.headerValues1[i] = val.replace("[T]", "");
                            } else if (val.indexOf("[S]") > -1) {
                                $scope.shareData.headerValues1[i] = val.replace("[S]", "");
                            } else if (val.indexOf("[G]") > -1) {
                                $scope.shareData.headerValues1[i] = val.replace("[G]", "");
                            }
                        } catch (e) {
                            console.log('error')
                        }
                    });

                    $scope.shareData.rawList1.sort(function (a, b) {
                        return a[$scope.shareData.lookupKey].localeCompare(b[$scope.shareData.lookupKey]);
                    });
                    if (data) {
                        try {
                            $scope.shareData.updateTime = String(new Date());
                            $scope.shareData.setDb('updated', $scope.shareData.updateTime);
                        } catch (e) {

                        }
                    }

                };
                reader.readAsArrayBuffer(f);
            } catch (e) {

            }

        };

        // ???????????????????????????
        function fixdata(data) {
            var o = "",
                l = 0,
                w = 10240;
            for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w,
                l * w + w)));
            o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
            return o;
        }

        // ?????????????????????????????????json?????????
        function to_json(workbook) {
            var result = {};
            workbook.SheetNames.forEach(function (sheetName, i) {
                var roa = XLSX.utils.sheet_to_json(
                    workbook.Sheets[sheetName], {
                        raw: true,
                        header: "A"
                    });
                if (roa.length > 0) {
                    result[String(i)] = roa;
                }
            });
            return result;
        }

    }])
    .controller('InfoCtrl', ["$scope", "sharedService", "$ionicPopup", function ($scope, sharedService, $ionicPopup) {
        $scope.shareData = sharedService;
        $scope.$on('$ionicView.enter', function (e) {
            try {
                document.getElementById('filterBar').style.display = 'none';
            } catch (e) {
                console.log(e);
            }
        });

        $scope.shareData.unregister = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Unregister / Remove Cashe',
                template: 'Are you sure you want to unregister Service Worker and remove Cashe?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    swUnregister();
                } else {
                    console.log('You are not sure');
                }
            });
        }

        $scope.shareData.emptyConvert = function (text) {
            return text ? text : " ?? ?? ??"
        }

    }])

    .config(["$stateProvider", "$urlRouterProvider", "$ionicFilterBarConfigProvider", function ($stateProvider, $urlRouterProvider, $ionicFilterBarConfigProvider) {

        $stateProvider
            .state('tabs', {
                url: "/tabs",
                abstract: true,
                templateUrl: "tabs.html"
            })
            .state('tabs.home', {
                url: "/home",
                views: {
                    'tabs-home': {
                        templateUrl: "templates/home.min.html"
                    }
                }
            })
            .state('tabs.detail', {
                url: "/detail",
                views: {
                    'tabs-home': {
                        templateUrl: "templates/detail.min.html"
                    }
                }
            })
            .state('tabs.info', {
                url: "/info",
                views: {
                    'tabs-info': {
                        templateUrl: "templates/info.min.html"
                    }
                }
            })
            .state('tabs.privacy', {
                url: "/privacy",
                views: {
                    'tabs-info': {
                        templateUrl: "templates/privacy.min.html"
                    }
                }
            })
            .state('tabs.term', {
                url: "/term",
                views: {
                    'tabs-info': {
                        templateUrl: "templates/term.min.html"
                    }
                }
            })
            .state('tabs.third', {
                url: "/third",
                views: {
                    'tabs-info': {
                        templateUrl: "templates/third.min.html"
                    }
                }
            })
            .state('tabs.about', {
                url: "/about",
                views: {
                    'tabs-about': {
                        templateUrl: "templates/about.min.html"
                    }
                }
            })
            .state('tabs.install', {
                url: "/install",
                views: {
                    'tabs-info': {
                        templateUrl: "templates/install.min.html"
                    }
                }
            });
        $urlRouterProvider.otherwise("/tabs/home");
        $ionicFilterBarConfigProvider.backdrop(true);

    }]).factory("sharedService", function () {
        return {
            text: 'sharedService'
        };
    }).filter('highlight', ["$sce", function ($sce) {
        return function (text, phrase) {
            function Encode(string) {
                var i = string.length,
                    a = [];

                while (i--) {
                    var iC = string[i].charCodeAt();
                    if (string[i] === "\"") {
                        a[i] = "&quot;";
                    } else if (string[i] === "&") {
                        a[i] = "&amp;";
                    } else if (iC === 62) {
                        a[i] = "&gt;";
                    } else if (iC === 60) {
                        a[i] = "&lt;";
                    } else {
                        a[i] = string[i];
                    }
                }
                return a.join('');
            }

            function Escaping(string) {
                var i = string.length,
                    a = [];
                while (i--) {
                    if (["[", "\\", "^", "$", ".", "|", "?", "*", "+", "(", ")"].some(function (val) {
                            return val === string[i];
                        })) {
                        a[i] = "\\" + string[i];
                    } else {
                        a[i] = string[i];
                    }
                }
                return a.join('');
            }
            if (text) {
                if (phrase) {
                    text = text.replace(new RegExp('(' + Escaping(Encode(phrase)) + ')', 'gi'),
                        '<span class="highlighted">$1</span>');
                }
            }
            return $sce.trustAsHtml(text ? text.replace(/\n/g, '<br />') : "");
        }
    }]).config(["$ionicConfigProvider", function ($ionicConfigProvider) {

        // note that you can also chain configs
        $ionicConfigProvider.navBar.positionPrimaryButtons('left');
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.tabs.style('standard');
        $ionicConfigProvider.navBar.alignTitle('left');
        $ionicConfigProvider.backButton.text('');
        $ionicConfigProvider.backButton.previousTitleText('');
    }]).directive('onChange', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.onChange);
                element.on('change', onChangeHandler);
                element.on('$destroy', function () {
                    element.off();
                });

            }
        };
    });