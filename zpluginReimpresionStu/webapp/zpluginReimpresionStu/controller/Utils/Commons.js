sap.ui.define([
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Button",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/Priority"
], function (MessageBox, Fragment, JSONModel, MessageToast, Button, Controller, History, Priority) {
    'use strict';

    return {
        consumeApi: function (sUri, sType, sData = null, fCallBack = null, fErrCallback = null, retryCall = false, tryCount = 0) {
            /**
             * Generic function for API Consumption
             * @param {String} sUri Route path of API
             * @param {String} sType API Consumption Type (Ex: GET, POST, PATCH, PUT)
             * @param {Object} sData (Optional) API Request Data
             * @param {function} fCallback (Optional) Function call back to do after API call
             * Use fCallback.bind(this) as parameter for correct "this" object context
             * @param {function} fErrCallback (Optional) Function call back to do after error API call
             * Use fErrCallback.bind(this) as parameter for correct "this" object context
             * @param {Boolean} retryCall (Optional) Retry call when there was an error
             * @param {Integer} tryCount (Optional) Max number of attempts to retry call
             */
            const oThis = this;
            $.ajax({
                type: sType,
                url: sUri,
                data: sData,      //data: JSON.stringify(sData),  se reemplazo para el pp
                contentType: "application/json",
                // dataType: sDataType,
                async: false,
            }).then(
                function (data, status) {
                    if (fCallBack)
                        fCallBack(data)
                }, function (data) {
                    if (retryCall) {
                        tryCount++;
                        if (tryCount <= 3) {
                            //try again
                            setTimeout(function () {
                                oThis.consumeApi(sUri, sType, sData, fCallBack, fErrCallback, retryCall, tryCount) //Recursividad
                            }.bind(oThis), 1500);
                            return;
                        }
                    }

                    let oMessage;
                    if (typeof data == "object") {
                        oMessage = data.responseJSON.message != undefined ? data.responseJSON.message : data.responseJSON.displayMessage;
                    } else if (typeof data == "text") {
                        oMessage = data.responseText;
                    }
                    MessageBox.error(oMessage);

                    if (fErrCallback)
                        fErrCallback(data)
                    return;
                });

        },
         consumeApi_pp: function (sUri, sType, sData = null, fCallBack = null, fErrCallback = null, retryCall = false, tryCount = 0) {
            /**
             * Generic function for API Consumption
             * @param {String} sUri Route path of API
             * @param {String} sType API Consumption Type (Ex: GET, POST, PATCH, PUT)
             * @param {Object} sData (Optional) API Request Data
             * @param {function} fCallback (Optional) Function call back to do after API call
             * Use fCallback.bind(this) as parameter for correct "this" object context
             * @param {function} fErrCallback (Optional) Function call back to do after error API call
             * Use fErrCallback.bind(this) as parameter for correct "this" object context
             * @param {Boolean} retryCall (Optional) Retry call when there was an error
             * @param {Integer} tryCount (Optional) Max number of attempts to retry call
             */
            const oThis = this;
            $.ajax({
                type: sType,
                url: sUri,
                data: JSON.stringify(sData),      //data: JSON.stringify(sData),  se reemplazo para el pp
                contentType: "application/json",
                // dataType: sDataType,
                async: false,
            }).then(
                function (data, status) {
                    if (fCallBack)
                        fCallBack(data)
                }, function (data) {
                    if (retryCall) {
                        tryCount++;
                        if (tryCount <= 3) {
                            //try again
                            setTimeout(function () {
                                oThis.consumeApi(sUri, sType, sData, fCallBack, fErrCallback, retryCall, tryCount) //Recursividad
                            }.bind(oThis), 1500);
                            return;
                        }
                    }

                    let oMessage;
                    if (typeof data == "object") {
                        oMessage = data.responseJSON.message != undefined ? data.responseJSON.message : data.responseJSON.displayMessage;
                    } else if (typeof data == "text") {
                        oMessage = data.responseText;
                    }
                    MessageBox.error(oMessage);

                    if (fErrCallback)
                        fErrCallback(data)
                    return;
                });

        },

        openFragmentDialog: function (oThis, sFragmentName, aButtons = null, oModel = null, fCallback = null, oCallbackParams = null) {
            /**
             * Opens a fragment inside a generic dialog
             * @param {Object} oThis This object context
             * @param {String} sFragmentName Fragment path
             * @param {Array} aButtons (Optional) Array with properties of desired buttons un dialog footer
             * @param {Object} oModel (Optional) Model to set on dialog fragment
             * @param {function} fCallback (Optional) Function call back to do after fragment created
             * @param {Object} oCallbackParams (Optional) Parameters to set into your 'fCallback'
             */
            this.openGenericDialog(oThis, oModel, function (oDialog) {
                Fragment.load({
                    id: oThis.getView().getId(),
                    name: sFragmentName,
                    controller: oThis
                }).then(function (oDialogContent) {
                    let oButton;

                    oDialog.addContent(oDialogContent);

                    if (aButtons)
                        for (let i = 0, oBtnSetting; i < aButtons.length; i++) {
                            oBtnSetting = {};
                            Object.assign(oBtnSetting, aButtons[i]);
                            oButton = new Button(aButtons[i].id ? oThis.getView().getId() + "--" + aButtons[i].id : "", oBtnSetting);
                            oDialog.addButton(oButton);
                        }

                    if (fCallback)
                        fCallback(oCallbackParams, oDialog);

                });
            });
        },

        openGenericDialog: function (oThis, oModel, fCallback) {
            /**
             * Creates an instance of a generic dialog and calls the callback
             * @param {Object} oThis This object context
             * @param {Object} oModel Model to set on dialog
             * @param {function} fCallback Function to call on generic dialog
             */
            oThis.loadFragment({
                name: "serviacero.custom.plugins.zpluginReimpresionStu.zpluginReimpresionStu.fragment.GenericDialog"
            }).then(function (oDialog) {
                fCallback(oDialog);
                if (oModel)
                    oDialog.setModel(oModel);
                oThis.getView().addDependent(oDialog);
                oDialog.open();
            });
        },

        dialogEscapeHandler: function (oEscapeHandler) {
            /**
             * Rejects the escape function on dialogs
             */
            //oEscapeHandler.reject();
        },

        onCloseDialog: function (oEvent) {
            /**
             * Closes and destroys the Dialog where the source (close button) is
             *  instanced and the content fragment
             * @param {Event} oEvent An event object
             */
            const oSource = oEvent.getSource();
            let oParent = oSource.getParent(),
                oFragment = oParent.getContent()[0];

            while (!oParent.getId().includes("dialog"))
                oParent = oParent.getParent();

            oParent.close();
            oParent.destroy();
            oFragment.destroy();
        },

        getItemsFormatData: function (oDataStructure) {
            /**
             * Returns the structure data with a specific format (ITEMS.Data)
             * @param {Object} oDataStructure Data to structure
             */
            const oItems = { ITEMS: [] };
            Object.assign(oItems.ITEMS, oDataStructure);
            return oItems;
        },

        getEventBindingData: function (oEvent) {
            /**
             * Returns the Event binding data
             * @param {Event} oEvent An event object
             */
            const oSource = oEvent.getSource(),
                oContext = oSource.getBindingContext(),
                sPath = oContext.getPath(),
                oModel = oSource.getModel(),
                oData = oModel.getProperty(sPath);

            return oData;
        },

        getCurrentDateTime: function () {
            /**
             * Returns the current dateTime
             */
            const oDate = new Date(),
                sYear = oDate.getFullYear(),
                sMonth = (oDate.getMonth() + 1) >= 10 ? (oDate.getMonth() + 1) : "0" + (oDate.getMonth() + 1),
                sDay = (oDate.getDate() + 1) > 10 ? oDate.getDate() : "0" + oDate.getDate(),
                sHour = (oDate.getHours() + 1) > 10 ? oDate.getHours() : "0" + oDate.getHours(),
                sMin = (oDate.getMinutes() + 1) > 10 ? oDate.getMinutes() : "0" + oDate.getMinutes(),
                sSec = (oDate.getSeconds() + 1) > 10 ? oDate.getSeconds() : "0" + oDate.getSeconds(),
                sDate = sYear + "-" + sMonth + "-" + sDay + "T" + sHour + ":" + sMin + ":" + sSec;

            return sDate;
        },

        getCurrentTime: function () {
            /**
             * Returns the current Time
             */
            const oDate = new Date(),
                sHour = oDate.getHours() + 1 > 10 ? oDate.getHours() : "0" + oDate.getHours(),
                sMin = oDate.getMinutes() + 1 > 10 ? oDate.getMinutes() : "0" + oDate.getMinutes(),
                sSec = oDate.getSeconds() + 1 > 10 ? oDate.getSeconds() : "0" + oDate.getSeconds(),
                sTime = sHour + ":" + sMin + ":" + sSec;

            return sTime;
        },

        afterCloseDialog: function (oEvent) {
            /**
             * After close Dialog execution
             * @param {Event} oEvent An event object
             */
            var oItem = oEvent.getSource();
            oItem.destroy();
        },

        onSignInput: function (oEvent, fCallback) {
            /**
             * @deprecated Use the BaseController instead
             */
            const aButtons = [{
                text: "Firmar",
                press: function () {
                    this.Commons.verifyAuth(oEvent, fCallback.bind(this));
                }.bind(this)
            }, {
                text: "Cancelar",
                press: this.onCloseDialog
            }],
                oDialogModel = new JSONModel({
                    dialog_title: "Autorización",
                    dialog_Content_Width: "",
                    dialog_Content_Height: ""
                });

            this.openFragmentDialog(this, "sap.ui.demo.webapp.fragment.SignIn", aButtons, oDialogModel);
        },

        containsSpecialChar: function (str) {
            /**
             * Detects if a String has special characters
             * @param {String} str String to analize
             */
            if (str.search(String.fromCharCode(10)) != -1) {
                return true
            }
            if (str.search(String.fromCharCode(34)) != -1) {
                return true
            }
            if (str.search(String.fromCharCode(39)) != -1) {
                return true
            }
            if (str.search(String.fromCharCode(9)) != -1) {
                return true
            }
            return false;
        },

        escapeStr: function (str) {
            /**
             * Makes all the escapes
             * @param {String} str String to replace
             */
            str = this.newlineEscape(str);
            str = this.doubleQuotesEscape(str);
            str = this.singleQuoteEscape(str);
            str = this.HTabEscape(str);
            str = this.RSlashEscape(str);
            return str;
        },

        newlineEscape: function (str) {
            /**
             * Replace single line break with &#10;
             * @param {String} str String to replace
             */
            return str.replaceAll(String.fromCharCode(10), "&#10;");
        },

        doubleQuotesEscape: function (str) {
            /**
             * Replace double quotation marks with &#34;
             * @param {String} str String to replace
             */
            return str.replaceAll(String.fromCharCode(34), "&#34;");
        },

        singleQuoteEscape: function (str) {
            /**
             * Replace single quote with &#39;
             * @param {String} str String to replace
             */
            return str.replaceAll(String.fromCharCode(39), "&#39;");
        },

        HTabEscape: function (str) {
            /**
             * Replace simple horizontal tab with &#9;
             * @param {String} str String to replace
             */
            return str.replaceAll(String.fromCharCode(9), "&#9;");
        },

        RSlashEscape: function (str) {
            /**
             * Replace backslash with &bsol;
             * @param {String} str String to replace
             */
            return str.replaceAll(String.fromCharCode(92), "&bsol;");
        },

        HTMLUnescape: function (str) {
            /**
             * Replace special characters
             * @param {String} str String to replace
             */
            return String(str).replaceAll(
                /&amp;|&lt;|&#10;|&#34;|&#39;|&iquest;|&#9;|&gt;|&bsol;/g,
                tag =>
                ({
                    '&amp;': '&',
                    '&lt;': '<',
                    '&#10;': '\n',
                    '&#34;': '"',
                    '&#39;': "'",
                    '&iquest;': '¿',
                    '&#9;': '\t',
                    '&gt;': '>',
                    '&bsol;': String.fromCharCode(92)
                }[tag] || tag));
        },

        getJsonKeys: function (json) {
            /**
             *  Returns all JSON keys
             * @param {Object} json A JSON Object from which the keys are obtained
             */
            var claves = [];
            for (var key in json) {
                claves.push(key);
            }
            return claves;
        },

        showConfirmDialog: function (fCallback, oCbParams, sMessage = "¿Seguro que desea continuar?") {
            /**
             * Shows a Dialog with a predefined message
             * @param {function} fCallback Function call back to do after OK action
             * Use fCallback.bind(this) as parameter for correct "this" object context
             * @param {Object} oCbParams Parameters to set into your 'fCallback'
             * @param {String} sMessage (Optional) Message to show in the Confirm Dialog
             */
            MessageBox.confirm(sMessage, {
                onClose: function (oAction) {
                    if (oAction === "OK")
                        fCallback(oCbParams);
                }
            });
        },

        arrayToStringList: function (oArray, stringFlag) {
            /**
             * Returns a String List
             * @param {Object} oArray Array to convert 
             * @param {Boolean} stringFlag Indicates if it's String
             */
            let oStringList = "";
            const char = stringFlag === true ? "'" : "";
            for (let i = 0; i < oArray.length; i++) {
                oStringList = oStringList + char + oArray[i] + char + ","
            }
            oStringList = oStringList.replace(/.$/, "");
            return oStringList;
        },

        getPODParams: function (sOwnerComponent) {
            /**
             * Get a structure of POD data.
             * KEPT FOR REFERENCE ONLY - NOT SAFE TO CALL FROM A CUSTOM POD.
             * selectedOrderData/selectedPhaseData are only populated by the built-in
             * order/phase selection flow of Order, Work Center and Operation Activity
             * PODs. A Custom POD has no such flow, so this throws in that context.
             * Use getGlobalUserInfo/tryGetContextPlant below instead.
             * @param {Object} sOwnerComponent The component of the controller's view
             * Use this.getOwnerComponent() as parameter
             */
            const oModels = sOwnerComponent.oPropagatedProperties.oModels,
                sPodSelectionModel = oModels.podSelectionModel,
                sGlobalModel = oModels.global;
            const sOrder = sPodSelectionModel.oData.selectedOrderData.order,
                sOrderRef = sPodSelectionModel.oData.selectedOrderData.orderRef,
                sMaterial = sPodSelectionModel.oData.selectedOrderData.material.material,
                sMaterialVersion = sPodSelectionModel.oData.selectedOrderData.material.version,
                sCompletedQty = sPodSelectionModel.oData.selectedOrderData.completedQty,
                oStepId = sPodSelectionModel.oData.selectedPhaseData.stepId,
                sPlant = String(String(sOrderRef).split(":")[1]).split(",")[0],
                sBom = String(sPodSelectionModel.oData.selectedOrderData.bomRef).split(",")[1],
                sWorkCenter = sPodSelectionModel.oData.selectedPhaseWorkCenter,
                sResource = sPodSelectionModel.oData.selectedPhaseData.resource.resource,
                sOperationActivity = sPodSelectionModel.oData.selectedPhaseData.operation.operation,
                oSelectedSfc = sPodSelectionModel.oData.selectedPhaseData.selectedSfc,
                sUserId = sGlobalModel.oData.loggedInUserDetails.userId,
                sFirstName = sGlobalModel.oData.loggedInUserDetails.givenName,
                sLastName = sGlobalModel.oData.loggedInUserDetails.familyName;
            return {
                ORDER_ID: sOrder,
                MATERIAL_ID: sMaterial,
                MATERIAL_VERSION: sMaterialVersion,
                COMPLETED_QTY: sCompletedQty,
                STEP_ID: oStepId,
                PLANT_ID: sPlant,
                BOM_ID: sBom,
                WORK_CENTER: sWorkCenter,
                RESOURCE: sResource,
                OPERATION_ACTIVITY: sOperationActivity,
                SFC: oSelectedSfc,
                USER_ID: sUserId,
                USER_FULLNAME: sFirstName + " " + sLastName
            }
        },

        getGlobalUserInfo: function (oOwnerComponent) {
            /**
             * Safe subset of getPODParams: only reads the global model (session/login
             * user info), which is not tied to order/phase selection and should stay
             * available in a Custom POD. Defensive - returns blanks instead of throwing.
             * @param {Object} oOwnerComponent Use this.getOwnerComponent() as parameter
             */
            try {
                const oGlobalData = oOwnerComponent.oPropagatedProperties.oModels.global.oData;
                const oUser = oGlobalData.loggedInUserDetails || {};
                return {
                    USER_ID: oUser.userId || "",
                    USER_FULLNAME: ((oUser.givenName || "") + " " + (oUser.familyName || "")).trim()
                };
            } catch (e) {
                return { USER_ID: "", USER_FULLNAME: "" };
            }
        },

        tryGetContextPlant: function (oOwnerComponent) {
            /**
             * Best-effort, defensive attempt to prefill the plant from context models.
             * UNVERIFIED for Custom PODs - help.sap.com only confirms that
             * selectedOrderData/selectedPhaseData (used to derive PLANT_ID in getPODParams)
             * come from the order/phase selection flow of Order/Work Center/Operation
             * Activity PODs, which a Custom POD does not have. Never treat this as
             * authoritative - it only prefills the manual plant Input, and logs the raw
             * models to the console so the value can be verified/adjusted at runtime.
             * @param {Object} oOwnerComponent Use this.getOwnerComponent() as parameter
             */
            try {
                const oModels = oOwnerComponent.oPropagatedProperties.oModels;
                const oGlobalData = oModels.global && oModels.global.oData;
                const oPodSelectionData = oModels.podSelectionModel && oModels.podSelectionModel.oData;

                if (typeof console !== "undefined") {
                    console.log("[zpluginReimpresionStu] global model data:", oGlobalData);
                    console.log("[zpluginReimpresionStu] podSelectionModel data:", oPodSelectionData);
                }

                return (oGlobalData && (oGlobalData.plant || oGlobalData.currentPlant || oGlobalData.plantId))
                    || (oPodSelectionData && (oPodSelectionData.plant || oPodSelectionData.selectedPlant))
                    || "";
            } catch (e) {
                return "";
            }
        },

        getRouter: function (oThis) {
            /**
             * Returns the reference to the router instance
             * @param {Object} oThis The component of the controller's view
             * Use this (context) as parameter
             */
            return sap.ui.core.UIComponent.getRouterFor(oThis);
        },

        getResourceBundle: function (oThis) {
            /**
             * Returns the resource bundle
             * @param {Object} oThis The component of the controller's view
             * Use this (context) as parameter
             */
            return oThis.getView().getModel("i18n").getResourceBundle();
        },

        getSapApiPath: function (oThis) {
            /**
             * Returns the resource bundle
             * @param {Object} oThis The component of the controller's view
             * Use this (context) as parameter
             */
            return oThis.getOwnerComponent().getManifestEntry("/sap.app/dataSources/sapApi-RestSource/uri");
        }
    }
});
