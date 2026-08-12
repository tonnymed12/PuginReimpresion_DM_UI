sap.ui.define([
    'jquery.sap.global',
	"sap/dm/dme/podfoundation/controller/PluginViewController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"./Utils/Commons",
	"./Utils/ApiPaths"
], function (jQuery, PluginViewController, JSONModel, MessageToast, Commons, ApiPaths) {
	"use strict";

	return PluginViewController.extend("serviacero.custom.plugins.zpluginReimpresionStu.zpluginReimpresionStu.controller.MainView", {
		Commons: Commons,
		ApiPaths: ApiPaths,

		onInit: function () {
			PluginViewController.prototype.onInit.apply(this, arguments);
			this.cache = {};

			// Custom POD: plant/work center/order are captured manually below instead of oPODParams
			var oTableModel = new JSONModel({
				ITEMS: [],
				filterPlant: "",
				filterWorkCenter: "",
				filterOrder: ""
			});
			this.getView().setModel(oTableModel, "tableModel");
		},




        onAfterRendering: function(){
           
            this.getView().byId("backButton").setVisible(this.getConfiguration().backButtonVisible);
            this.getView().byId("closeButton").setVisible(this.getConfiguration().closeButtonVisible);
            
            this.getView().byId("headerTitle").setText(this.getConfiguration().title);

        },

		onBeforeRenderingPlugin: function () {
			// Custom POD: no order/phase selection flow exists, so PLANT_ID/WORK_CENTER/ORDER_ID
			// from oPODParams are not available here. Prefill plant from POD Designer config
			// (defaultPlant property) or a best-effort context read; everything else stays manual.
			var oTableModel = this.getView().getModel("tableModel");
			var sConfiguredPlant = (this.getConfiguration() && this.getConfiguration().defaultPlant) || "";
			var sPlant = sConfiguredPlant || this.Commons.tryGetContextPlant(this.getOwnerComponent());

			if (sPlant) {
				oTableModel.setProperty("/filterPlant", sPlant);
			}
		},

		/**
		 * Triggered by the "Buscar" action (button press or order input submit).
		 * Validates the manually captured plant/order (work center is not needed to search), then resolves
		 * child orders and searches.
		 */
		onSearchOrder: function () {
			var oTableModel = this.getView().getModel("tableModel");
			var sPlant = (oTableModel.getProperty("/filterPlant") || "").trim();
			var sOrder = (oTableModel.getProperty("/filterOrder") || "").trim();

			if (!sPlant) {
				sap.m.MessageToast.show("Ingrese la planta");
				return;
			}
			if (!sOrder) {
				sap.m.MessageToast.show("Ingrese un número de orden");
				return;
			}

			this._resolveOrdersAndSearch(sPlant, sOrder);
		},

		/**
		 * Reads order custom values to determine which orders to query for goods receipts.
		 * For combined orders, deliveries are made in child orders (ORDENES_HIJAS).
		 * Same business rule as the reference plugin's onGetOrderCustomValues.
		 * @param {string} sPlant  Manually entered plant
		 * @param {string} sOrder  Manually entered order
		 */
		_resolveOrdersAndSearch: function (sPlant, sOrder) {
			var oThis = this;
			var url = this.getPublicApiRestDataSourceUri() + this.ApiPaths.ORDERS;

			this.ajaxGetRequest(url, { plant: sPlant, order: sOrder },
				function (oResponseData) {
					var oOrder = Array.isArray(oResponseData) ? oResponseData[0] : oResponseData;

					if (!oOrder) {
						sap.m.MessageToast.show("Orden no encontrada");
						return;
					}

					var aCustomValues = oOrder.customValues || [];
					var oOrdenesHijasCv = aCustomValues.find(function (cv) { return cv.attribute === "ORDENES_HIJAS"; });

					var aOrdenesAConsultar = [sOrder];

					// If ORDENES_HIJAS is set, add child orders (excluding duplicates)
					if (oOrdenesHijasCv && oOrdenesHijasCv.value) {
						var aHijas = oOrdenesHijasCv.value.split(',')
							.map(function (s) {
								var sTrimmed = s.trim();
								return sTrimmed ? String(parseInt(sTrimmed, 10)) : "";
							})
							.filter(Boolean);
						aOrdenesAConsultar = aOrdenesAConsultar.concat(aHijas);
					}

					// Deduplicate to avoid querying the same order twice
					aOrdenesAConsultar = aOrdenesAConsultar.filter(function (sOrd, iIdx, arr) {
						return arr.indexOf(sOrd) === iIdx;
					});

					oThis.goodsRceiptsSummaryOrder(sPlant, aOrdenesAConsultar);
				},
				function (oError, sHttpErrorMessage) {
					sap.m.MessageToast.show(oError || sHttpErrorMessage);
				}
			);
		},

		/**
		 * Fetches goods receipts for each order in aOrders and populates the tableModel.
		 * @param {string} sPlant  Plant ID
		 * @param {string[]} aOrders  Array of order IDs to query
		 */
		goodsRceiptsSummaryOrder: function (sPlant, aOrders) {
			var oThis = this;
			var oView = this.getView();
			var url = this.getPublicApiRestDataSourceUri() + this.ApiPaths.GOODSRECEIPTS_SUMMARY;
			var aAllReceipts = [];
			var iPending = aOrders.length;

			if (iPending === 0) {
				oView.getModel("tableModel").setProperty("/ITEMS", []);
				return;
			}

			aOrders.forEach(function (sOrder) {
				oThis.ajaxGetRequest(url, { plant: sPlant, order: sOrder },
					function (oData) {
						var aContent = (oData && oData.content) ? oData.content : [];
						aContent.forEach(function (oReceipt) {
							var oItem = (oReceipt.items && oReceipt.items[0]) || {};
							// Skip receipts without a batch number
							if (!oItem.batchNumber) { return; }
							var oQty = oItem.quantityInProductionUnit || {};
							aAllReceipts.push({
								transactionId: oReceipt.transactionId,
								order: oReceipt.order,
								postingDateTime: oReceipt.postingDateTime,
								postedBy: oReceipt.postedBy,
								status: oReceipt.status,
								batchNumber: oItem.batchNumber || "",
								material: oItem.material || "",
								sfc: oItem.sfc || "",
								quantityValue: oQty.value || 0,
								uom: oQty.internalUnitOfMeasure || "",
								storageLocation: oItem.storageLocation || ""
							});
						});
						iPending--;
						if (iPending === 0) {
							aAllReceipts.sort(function (a, b) {
								return new Date(b.postingDateTime) - new Date(a.postingDateTime);
							});
							oView.getModel("tableModel").setProperty("/ITEMS", aAllReceipts);
						}
					},
					function (oError, sHttpErrorMessage) {
						iPending--;
						if (iPending === 0) {
							oView.getModel("tableModel").setProperty("/ITEMS", aAllReceipts);
						}
						sap.m.MessageToast.show(oError || sHttpErrorMessage);
					}
				);
			});
		},

		/**
		 * Handles the print action for a table row.
		 * Fetches the work center's TIPO_PUESTO custom value, then calls the impresion PP endpoint.
		 * Plant/work center now come from the manually captured filters instead of oPODParams.
		 * @param {sap.ui.base.Event} oEvent  Button press event
		 */
		onPrint: function (oEvent) {
			var oThis = this;
			var oView = this.getView();
			var oTableModel = oView.getModel("tableModel");
			var sPlant = (oTableModel.getProperty("/filterPlant") || "").trim();
			var oUserInfo = this.Commons.getGlobalUserInfo(this.getOwnerComponent());
			var oBindingContext = oEvent.getSource().getBindingContext("tableModel");
			var oRowData = oBindingContext.getObject();
			var sRowPath = oBindingContext.getPath();
			var oSapApi = this.getPublicApiRestDataSourceUri();
			// Work center is read and validated here at print time, not cached from the search step
			var sWorkCenter = (oTableModel.getProperty("/filterWorkCenter") || "").trim();

			if (!sWorkCenter) {
				sap.m.MessageToast.show("Ingrese el puesto de trabajo");
				return;
			}

			// Retrieve work center custom values to get TIPO_PUESTO
			this.ajaxGetRequest(oSapApi + this.ApiPaths.WORKCENTERS,
				{ plant: sPlant, workCenter: sWorkCenter },
				function (oWCData) {
					var oWC = Array.isArray(oWCData) ? oWCData[0] : oWCData;
					var sTipoPuesto = "";
					if (oWC && oWC.customValues) {
						var oTipoCv = oWC.customValues.find(function (cv) {
							return cv.attribute === "TIPO_PUESTO";
						});
						sTipoPuesto = oTipoCv ? (oTipoCv.value || "") : "";
					}

					var sUom = (oRowData.uom || "").toUpperCase();
					var nQty = parseFloat(oRowData.quantityValue) || 0;

					var oBody = {
						inPlant: sPlant,
						inShopOrder: oRowData.order,
						inMaterial: oRowData.material,
						inBatchNumber: oRowData.batchNumber,
						inSfc: oRowData.sfc,
						inDate: oRowData.postingDateTime
							? oRowData.postingDateTime.replace("T", " ").replace(/\-/g, "/").replace(/\.\d{3}Z$/, "")
							: "",
						inWorkCenter: sWorkCenter,
						inWorkCenterType: sTipoPuesto,
						inUser: oUserInfo.USER_ID,
						// This custom POD doesn't distinguish slitter work centers; backend still expects the flag
						inFlagSlitter: false,
						inQuantityKG: sUom === "KG" ? nQty : 0,
						inQuantityPZ: (sUom === "PZ" || sUom === "PC" || sUom === "ST") ? nQty : 0,
						inQuantityML: sUom === "ML" ? nQty : 0
					};

					oThis.ajaxPostRequest(oSapApi + oThis.ApiPaths.IMPRESION, oBody,
						function () {
							sap.m.MessageToast.show("Impresión enviada correctamente");
							oView.byId("panelPlugin").setBusy(false);
						},
						function (oErr, sMsg) {
							sap.m.MessageToast.show(oErr || sMsg);
							oView.byId("panelPlugin").setBusy(false);
						}
					);
				},
				function (oError, sHttpErrorMessage) {
					sap.m.MessageToast.show(oError || sHttpErrorMessage);
					oView.byId("panelPlugin").setBusy(false);
				}
			);
		},

        isSubscribingToNotifications: function() {
            
            var bNotificationsEnabled = true;
           
            return bNotificationsEnabled;
        },


        getCustomNotificationEvents: function(sTopic) {
            //return ["template"];
        },


        getNotificationMessageHandler: function(sTopic) {

            //if (sTopic === "template") {
            //    return this._handleNotificationMessage;
            //}
            return null;
        },

        _handleNotificationMessage: function(oMsg) {
           
            var sMessage = "Message not found in payload 'message' property";
            if (oMsg && oMsg.parameters && oMsg.parameters.length > 0) {
                for (var i = 0; i < oMsg.parameters.length; i++) {

                    switch (oMsg.parameters[i].name){
                        case "template":
                            
                            break;
                        case "template2":
                            
                        
                        }        
          

                    
                }
            }

        },
        

		onExit: function () {
			PluginViewController.prototype.onExit.apply(this, arguments);


		}
	});
});