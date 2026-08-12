sap.ui.define([
    "sap/ui/model/resource/ResourceModel",
    "sap/dm/dme/podfoundation/control/PropertyEditor"
], function (ResourceModel, PropertyEditor) {
    "use strict";
    
    var oFormContainer;

    return PropertyEditor.extend( "serviacero.custom.plugins.zpluginReimpresionStu.zpluginReimpresionStu.builder.PropertyEditor" ,{

		constructor: function(sId, mSettings){
			PropertyEditor.apply(this, arguments);
			
			this.setI18nKeyPrefix("customComponentListConfig.");
			this.setResourceBundleName("serviacero.custom.plugins.zpluginReimpresionStu.zpluginReimpresionStu.i18n.builder");
			this.setPluginResourceBundleName("serviacero.custom.plugins.zpluginReimpresionStu.zpluginReimpresionStu.i18n.i18n");
		},
		
		addPropertyEditorContent: function(oPropertyFormContainer){
			var oData = this.getPropertyData();
			
			this.addSwitch(oPropertyFormContainer, "backButtonVisible", oData);
			this.addSwitch(oPropertyFormContainer, "closeButtonVisible", oData);
						
			this.addInputField(oPropertyFormContainer, "title", oData);

			// Custom POD: plant can't be read from oPODParams, so let POD Designer configure
			// the plant this POD instance is deployed to (PODs are plant-scoped configuration).
			this.addInputField(oPropertyFormContainer, "defaultPlant", oData);

            oFormContainer = oPropertyFormContainer;
		},
		
		getDefaultPropertyData: function(){
			return {
				
				"backButtonVisible": true,
				"closeButtonVisible": true,
                "title": "zpluginReimpresionStu",
				"defaultPlant": ""
                
			};
		}

	});
});