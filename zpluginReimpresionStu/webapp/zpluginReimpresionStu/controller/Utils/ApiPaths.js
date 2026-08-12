sap.ui.define([],
    function () {
        'use strict';
        return {
            /** API CONSUMPTION TYPE : GET  */

            //  Finds order data by plant and order
            ORDERS: "order/v1/orders",

            //  Find material
            MATERIALS: "/material/v1/materials",

            //find header material 
            HEADER_MATERIAL: "/material/v1/materials/headerDetails",

            //  Gets storage locations for a given plant
            STORAGE_LOCATION: "/inventory/v1/storageLocations",

            //  Retrieves batches and batch characteristics for a given plant and material
            BATCHES: "inventory/v2/batches",

            //  Gets stock information for a given plant
            INVENTORIES: "inventory/v1/inventories",

            //  Get all units of measure
            UOMS: "uom/v1/uoms/",

            //  Searches for work centers by plant and work center values
            WORKCENTERS: "workcenter/v2/workcenters",

            //find operation activity details 
            OPERATION_ACTIVITIES: "operationActivity/v1/operationActivities",
            // Get Goods Issue summary results for an order, operationActivity and plant.
            GOODSISSUES_SUMMARY: "processorder/v2/goodsIssue/summary",
            GOODSRECEIPTS_SUMMARY: "inventory/v2/inventory/goodsReceipts",




            /** API CONSUMPTION TYPE : PUT  */

            //  Update SFC default batch ID
            SFC_BATCH: "sfc/v1/batch",

            //  Retrieves the components already assembled. API Consuption Type: PUT, POST
            ASSEMBLED_COMPONENTS: "assembly/v1/assembledComponents",

            //  Find BOM
            BOMS: "bom/v1/boms",



            /** API CONSUMPTION TYPE : PATCH */

            //  Updates order custom values
            ORDER_CUSTOM_VALUES: "order/v1/orders/customValues",



            /** API CONSUMPTION TYPE : POST  */

            //  Posts goods receipts for products in the plant that has enabled inventory Management
            ERP_GOODS_RECEIPTS: "inventory/v1/inventory/erpGoodsReceipts",

            //  Creates a batch number for a given plant and material
            INVENTORY_BATCH: "inventory/v1/batch",

            //  Create or update batch characteristics
            BATCH_CHARS: "inventory/v1/batchCharacteristics",


            /** PRODUCTION PROCESS API CONSUMPTION TYPE : POST  */
            SET_LOTE: "/pe/api/v1/process/processDefinitions/start?key=REG_8e9c20ce-5668-487d-bbc7-f1b4e642b21c",

            putBatchSlotWorkCenter: "/pe/api/v1/process/processDefinitions/start?key=REG_4ee9064a-eaa4-4080-aafc-a606c7fa4900",

            /** PRODUCTION PROCESS API CONSUMPTION TYPE : POST  getReservas*/
            getReservas: "/pe/api/v1/process/processDefinitions/start?key=REG_2d4c6e10-7d49-4052-9b61-fa9050a41ffa&async=false",

            validateMaterialEnOrden: "/pe/api/v1/process/processDefinitions/start?key=REG_2f5eafc1-59aa-478b-b9d7-a8bcf1941ee8&async=false",

            putBatchSlotOperationActivity: "/pe/api/v1/process/processDefinitions/start?key=REG_186243f5-3d68-45df-b30f-515331cb0fab&async=false",
            /** PRODUCTION PROCESS API CONSUMPTION TYPE : POST  getLotesBom*/
            getLotesMaterialStock: "/pe/api/v1/process/processDefinitions/start?key=REG_2aeb576a-f473-463a-923c-ea69224dcb6a&async=false",
            IMPRESION: "/pe/api/v1/process/processDefinitions/start?key=REG_ad2721ed-5f9f-452f-87c4-27b2f21354b1&async=false"

        }
    });
