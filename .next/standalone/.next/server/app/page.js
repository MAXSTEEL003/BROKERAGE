(() => {
var exports = {};
exports.id = 931;
exports.ids = [931];
exports.modules = {

/***/ 8038:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/react");

/***/ }),

/***/ 3743:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/react-dom/server-rendering-stub");

/***/ }),

/***/ 7897:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/react-server-dom-webpack/client");

/***/ }),

/***/ 6786:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/react/jsx-runtime");

/***/ }),

/***/ 5868:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/app-render");

/***/ }),

/***/ 1844:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/get-segment-param");

/***/ }),

/***/ 6624:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/future/helpers/interception-routes");

/***/ }),

/***/ 5281:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/future/route-modules/route-module");

/***/ }),

/***/ 7085:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/app-router-context");

/***/ }),

/***/ 199:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/hash");

/***/ }),

/***/ 9569:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/hooks-client-context");

/***/ }),

/***/ 893:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/add-path-prefix");

/***/ }),

/***/ 7887:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/handle-smooth-scroll");

/***/ }),

/***/ 8735:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/is-bot");

/***/ }),

/***/ 8231:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/parse-path");

/***/ }),

/***/ 4614:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/path-has-prefix");

/***/ }),

/***/ 3750:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/remove-trailing-slash");

/***/ }),

/***/ 9618:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/server-inserted-html");

/***/ }),

/***/ 7147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 1017:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 1267:
/***/ ((module) => {

"use strict";
module.exports = require("worker_threads");

/***/ }),

/***/ 6930:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GlobalError: () => (/* reexport default from dynamic */ next_dist_client_components_error_boundary__WEBPACK_IMPORTED_MODULE_2___default.a),
/* harmony export */   __next_app__: () => (/* binding */ __next_app__),
/* harmony export */   originalPathname: () => (/* binding */ originalPathname),
/* harmony export */   pages: () => (/* binding */ pages),
/* harmony export */   routeModule: () => (/* binding */ routeModule),
/* harmony export */   tree: () => (/* binding */ tree)
/* harmony export */ });
/* harmony import */ var next_dist_server_future_route_modules_app_page_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7262);
/* harmony import */ var next_dist_server_future_route_modules_app_page_module__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_page_module__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9513);
/* harmony import */ var next_dist_client_components_error_boundary__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1823);
/* harmony import */ var next_dist_client_components_error_boundary__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_components_error_boundary__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2502);
/* harmony import */ var next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3__) if(["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => next_dist_server_app_render_entry_base__WEBPACK_IMPORTED_MODULE_3__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);
// @ts-ignore this need to be imported from next/dist to be external


const AppPageRouteModule = next_dist_server_future_route_modules_app_page_module__WEBPACK_IMPORTED_MODULE_0__.AppPageRouteModule;
// We inject the tree and pages here so that we can use them in the route
// module.
const tree = {
        children: [
        '',
        {
        children: ['__PAGE__', {}, {
          page: [() => Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 2838)), "C:\\Users\\12400f_RTX3070ti\\Desktop\\BROKERAGE\\app\\page.tsx"],
          
        }]
      },
        {
        'layout': [() => Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 1921)), "C:\\Users\\12400f_RTX3070ti\\Desktop\\BROKERAGE\\app\\layout.tsx"],
'not-found': [() => Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 5493, 23)), "next/dist/client/components/not-found-error"],
        
      }
      ]
      }.children;
const pages = ["C:\\Users\\12400f_RTX3070ti\\Desktop\\BROKERAGE\\app\\page.tsx"];

// @ts-expect-error - replaced by webpack/turbopack loader

const __next_app_require__ = __webpack_require__
const __next_app_load_chunk__ = () => Promise.resolve()
const originalPathname = "/page";
const __next_app__ = {
    require: __next_app_require__,
    loadChunk: __next_app_load_chunk__
};

// Create and export the route module that will be consumed.
const routeModule = new AppPageRouteModule({
    definition: {
        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_PAGE,
        page: "/page",
        pathname: "/",
        // The following aren't used in production.
        bundlePath: "",
        filename: "",
        appPaths: []
    },
    userland: {
        loaderTree: tree
    }
});

//# sourceMappingURL=app-page.js.map

/***/ }),

/***/ 433:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 9727))

/***/ }),

/***/ 622:
/***/ (() => {



/***/ }),

/***/ 4102:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 1232, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 2987, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 831, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 6926, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 6505, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 4282, 23))

/***/ }),

/***/ 9727:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ Home)
});

// EXTERNAL MODULE: external "next/dist/compiled/react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(6786);
// EXTERNAL MODULE: external "next/dist/compiled/react"
var react_ = __webpack_require__(8038);
;// CONCATENATED MODULE: external "xlsx"
const external_xlsx_namespaceObject = require("xlsx");
// EXTERNAL MODULE: ./app/styles/excel-import.css
var excel_import = __webpack_require__(7166);
;// CONCATENATED MODULE: ./app/components/ExcelImport.tsx




const HEADER_MAP = {
    "QTY": "QUANTITY",
    "QTLS": "QUANTITY",
    "QUINTALS": "QUANTITY",
    "QUINTAL": "QUANTITY",
    "qtls": "QUANTITY",
    "AMT": "AMOUNT",
    "TOTAL": "AMOUNT",
    "TOTAL AMOUNT": "AMOUNT",
    "VALUE": "AMOUNT",
    "Amount": "AMOUNT",
    "PLACE": "PLACE",
    "BRAND": "BRAND",
    "RATE": "RATE",
    "DATE": "DATE"
};
const ExcelImport = ({ onDataImport })=>{
    const fileInputRef = (0,react_.useRef)(null);
    const [error, setError] = (0,react_.useState)("");
    const handleFileUpload = (event)=>{
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e)=>{
            try {
                const data = new Uint8Array(e.target?.result);
                const workbook = external_xlsx_namespaceObject.read(data, {
                    type: "array"
                });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = external_xlsx_namespaceObject.utils.sheet_to_json(worksheet, {
                    defval: ""
                });
                const normalizedData = jsonData.map((row)=>{
                    const normalizedRow = {};
                    Object.keys(row).forEach((key)=>{
                        const cleaned = key.trim().toUpperCase();
                        const mapped = HEADER_MAP[cleaned] || cleaned;
                        normalizedRow[mapped] = row[key];
                    });
                    return normalizedRow;
                });
                setError("");
                onDataImport(normalizedData);
            } catch (err) {
                setError("Failed to parse file.");
                console.error("Excel parsing error:", err);
            }
        };
        reader.readAsArrayBuffer(file);
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: "excel-import",
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx("input", {
                ref: fileInputRef,
                type: "file",
                accept: ".xlsx,.xls",
                onChange: handleFileUpload
            }),
            error && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: "error-alert",
                children: error
            })
        ]
    });
};
/* harmony default export */ const components_ExcelImport = (ExcelImport);

;// CONCATENATED MODULE: ./app/components/FilterControls.tsx
/* __next_internal_client_entry_do_not_use__ default auto */ 
const FilterControls = ({ millers, buyers, selectedMiller, selectedBuyer, commissionRate, commissionType, fixedRate, onMillerChange, onBuyerChange, onCommissionRateChange, onCommissionTypeChange, onFixedRateChange })=>/*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: "filter-controls",
        children: [
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                children: [
                    "Miller:",
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("select", {
                        value: selectedMiller,
                        onChange: (e)=>onMillerChange(e.target.value),
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("option", {
                                value: "all",
                                children: "All"
                            }),
                            millers.map((m)=>/*#__PURE__*/ jsx_runtime_.jsx("option", {
                                    value: m,
                                    children: m
                                }, m))
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                children: [
                    "Buyer:",
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("select", {
                        value: selectedBuyer,
                        onChange: (e)=>onBuyerChange(e.target.value),
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("option", {
                                value: "all",
                                children: "All"
                            }),
                            buyers.map((b)=>/*#__PURE__*/ jsx_runtime_.jsx("option", {
                                    value: b,
                                    children: b
                                }, b))
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                children: [
                    "Commission Type:",
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("select", {
                        value: commissionType,
                        onChange: (e)=>onCommissionTypeChange(e.target.value),
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("option", {
                                value: "percentage",
                                children: "Percentage (%)"
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("option", {
                                value: "fixed",
                                children: "Fixed per unit"
                            })
                        ]
                    })
                ]
            }),
            commissionType === "percentage" ? /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                children: [
                    "Rate (%):",
                    /*#__PURE__*/ jsx_runtime_.jsx("input", {
                        type: "number",
                        value: commissionRate * 100,
                        onChange: (e)=>onCommissionRateChange(Number(e.target.value) / 100)
                    })
                ]
            }) : /*#__PURE__*/ (0,jsx_runtime_.jsxs)("label", {
                children: [
                    "Fixed Rate:",
                    /*#__PURE__*/ jsx_runtime_.jsx("input", {
                        type: "number",
                        value: fixedRate,
                        onChange: (e)=>onFixedRateChange(Number(e.target.value))
                    })
                ]
            })
        ]
    });
/* harmony default export */ const components_FilterControls = (FilterControls);

// EXTERNAL MODULE: ./app/node_modules/jspdf/dist/jspdf.node.min.js
var jspdf_node_min = __webpack_require__(104);
// EXTERNAL MODULE: ./app/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.js
var jspdf_plugin_autotable = __webpack_require__(1320);
var jspdf_plugin_autotable_default = /*#__PURE__*/__webpack_require__.n(jspdf_plugin_autotable);
// EXTERNAL MODULE: ./app/node_modules/date-fns/format.js + 35 modules
var format = __webpack_require__(5761);
// EXTERNAL MODULE: ./app/styles/DataPreview.css
var DataPreview = __webpack_require__(2815);
;// CONCATENATED MODULE: ./app/components/DataPreview.tsx
/* __next_internal_client_entry_do_not_use__ default auto */ 





const findQuantityField = (row)=>{
    const fields = [
        "QUINTALS",
        "QUANTITY",
        "QTY",
        "QTLS",
        "QUINTAL",
        "qtls"
    ];
    for (const field of fields){
        if (row[field] !== undefined) return parseFloat(row[field]) || 0;
    }
    return 0;
};
const findAmountField = (row)=>{
    const fields = [
        "Net Amt.",
        "AMOUNT",
        "AMT",
        "TOTAL",
        "TOTAL AMOUNT",
        "VALUE",
        "Amount"
    ];
    for (const field of fields){
        if (row[field] !== undefined) return parseFloat(row[field]) || 0;
    }
    return 0;
};
const formatDate = (value)=>{
    if (typeof value === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        const parsed = new Date(excelEpoch.getTime() + value * 86400000);
        return (0,format/* default */.ZP)(parsed, "dd-MM-yyyy");
    }
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return (0,format/* default */.ZP)(parsed, "dd-MM-yyyy");
    return String(value);
};
const DataPreview_DataPreview = ({ data, commissionRate, commissionType, fixedRate, totalTransactions, totalQuantity, totalAmount, totalCommission, selectedMiller, selectedBuyer })=>{
    const calculatedRows = (0,react_.useMemo)(()=>{
        return data.map((row, idx)=>{
            const quantity = findQuantityField(row);
            const amount = findAmountField(row);
            const miller = row["MILLER NAME"] || "";
            const buyer = row["BUYER NAME"] || "";
            const isNidhiAgro = (miller || "").toLowerCase().includes("nidhi agro");
            let commission = 0;
            if (isNidhiAgro) {
                commission = amount * 0.01;
            } else if (commissionType === "percentage") {
                commission = amount * commissionRate;
            } else {
                commission = quantity * fixedRate;
            }
            const rate = isNidhiAgro ? "1%" : commissionType === "percentage" ? `${(commissionRate * 100).toFixed(2)}%` : `₹${fixedRate}`;
            return {
                idx: idx + 1,
                date: formatDate(row["DATE"] || row["Date"] || ""),
                miller,
                buyer,
                billNo: row["BILL NO"] || row["BILL"] || "",
                quantity,
                rate,
                amount,
                commission: commission.toFixed(2)
            };
        });
    }, [
        data,
        commissionRate,
        commissionType,
        fixedRate
    ]);
    const exportToPDF = ()=>{
        const doc = new jspdf_node_min["default"]({
            orientation: "portrait",
            unit: "pt",
            format: "a4"
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        const marginX = 40;
        let finalY = 40;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Tejas Canvassing - Miller Side Report", pageWidth / 2, finalY, {
            align: "center"
        });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("No. 123, 1st Floor, 4th main Road, Yeshwanthpur,APMC Yard,Bengaluru - 560022", pageWidth / 2, finalY + 20, {
            align: "center"
        });
        doc.text("Phone: +919535769154", pageWidth / 2, finalY + 35, {
            align: "center"
        });
        finalY += 60;
        jspdf_plugin_autotable_default()(doc, {
            startY: finalY,
            head: [
                [
                    "Summary",
                    "Value"
                ]
            ],
            body: [
                [
                    "Total Transactions",
                    totalTransactions.toString()
                ],
                [
                    "Total Quantity (Quintals)",
                    totalQuantity.toFixed(2)
                ],
                [
                    "Total Amount",
                    totalAmount.toFixed(2)
                ],
                [
                    "Total Commission",
                    totalCommission.toFixed(2)
                ]
            ],
            headStyles: {
                fillColor: [
                    63,
                    81,
                    181
                ],
                textColor: 255
            },
            theme: "grid",
            styles: {
                fontSize: 10
            },
            margin: {
                left: marginX,
                right: marginX
            }
        });
        finalY = doc.lastAutoTable.finalY + 20;
        jspdf_plugin_autotable_default()(doc, {
            startY: finalY,
            head: [
                [
                    "#",
                    "Date",
                    "Miller",
                    "Buyer",
                    "Bill No",
                    "Quantity",
                    "Rate",
                    "Amount",
                    "Commission"
                ]
            ],
            body: calculatedRows.map((row)=>[
                    row.idx,
                    row.date,
                    row.miller,
                    row.buyer,
                    row.billNo,
                    row.quantity,
                    row.rate,
                    row.amount,
                    row.commission
                ]),
            styles: {
                fontSize: 9
            },
            theme: "grid",
            margin: {
                left: marginX,
                right: marginX
            },
            headStyles: {
                fillColor: [
                    0,
                    123,
                    255
                ],
                textColor: 255
            }
        });
        finalY = doc.lastAutoTable.finalY + 20;
        jspdf_plugin_autotable_default()(doc, {
            startY: finalY,
            head: [
                [
                    "Bank Name",
                    "Branch",
                    "IFSC Code",
                    "Account No",
                    "UPI"
                ]
            ],
            body: [
                [
                    "Canara Bank",
                    "Yeshwanthpur",
                    "CNRB0001234",
                    "1234567890",
                    "tejas@upi"
                ]
            ],
            styles: {
                fontSize: 9
            },
            headStyles: {
                fillColor: [
                    76,
                    175,
                    80
                ],
                textColor: 255
            },
            theme: "grid",
            margin: {
                left: marginX,
                right: marginX
            }
        });
        const safeMiller = selectedMiller && selectedMiller !== "all" ? selectedMiller.replace(/[^a-z0-9]/gi, "_") : "AllMillers";
        const fileName = `${safeMiller}.pdf`;
        doc.save(fileName);
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: "data-preview",
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: "preview-header",
                children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                    className: "header-title",
                    children: [
                        /*#__PURE__*/ jsx_runtime_.jsx("h3", {
                            children: "Miller Side View"
                        }),
                        /*#__PURE__*/ jsx_runtime_.jsx("button", {
                            className: "export-button",
                            onClick: exportToPDF,
                            children: "Export to PDF"
                        })
                    ]
                })
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: "preview-table-wrapper",
                children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("table", {
                    className: "preview-table",
                    children: [
                        /*#__PURE__*/ jsx_runtime_.jsx("thead", {
                            children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("tr", {
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        children: "#"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        children: "Date"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        children: "Miller"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        children: "Buyer"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        children: "Bill No"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        children: "Quantity"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        children: "Rate"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        children: "Amount"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                        children: "Commission"
                                    })
                                ]
                            })
                        }),
                        /*#__PURE__*/ jsx_runtime_.jsx("tbody", {
                            children: calculatedRows.map((row)=>/*#__PURE__*/ (0,jsx_runtime_.jsxs)("tr", {
                                    children: [
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            children: row.idx
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            children: row.date
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            children: row.miller
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            children: row.buyer
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            children: row.billNo
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            children: row.quantity
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            children: row.rate
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            children: row.amount
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                            children: row.commission
                                        })
                                    ]
                                }, row.idx))
                        })
                    ]
                })
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: "preview-summary",
                children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                    className: "summary-grid",
                    children: [
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "summary-item",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                    children: "Total Transactions"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                    children: totalTransactions
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "summary-item",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                    children: "Total Quantity"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                    children: totalQuantity
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "summary-item",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                    children: "Total Amount"
                                }),
                                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("span", {
                                    children: [
                                        "₹",
                                        totalAmount.toLocaleString()
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "summary-item",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                    children: "Total Commission"
                                }),
                                /*#__PURE__*/ (0,jsx_runtime_.jsxs)("span", {
                                    children: [
                                        "₹",
                                        totalCommission.toLocaleString()
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "summary-item",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                    children: "Commission Type"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                    children: commissionType === "percentage" ? `${(commissionRate * 100).toFixed(2)}%` : `₹${fixedRate} per unit`
                                })
                            ]
                        })
                    ]
                })
            })
        ]
    });
};
/* harmony default export */ const components_DataPreview = (DataPreview_DataPreview);

// EXTERNAL MODULE: ./app/styles/DataPreviewB.css
var DataPreviewB = __webpack_require__(215);
;// CONCATENATED MODULE: ./app/components/DataPreviewB.tsx
/* __next_internal_client_entry_do_not_use__ default auto */ 





const DataPreviewB_findQuantityField = (row)=>{
    const fields = [
        "QUINTALS",
        "QUANTITY",
        "QTY",
        "QTLS",
        "QUINTAL",
        "qtls"
    ];
    for (const field of fields){
        if (row[field] !== undefined) return parseFloat(row[field]) || 0;
    }
    return 0;
};
const DataPreviewB_findAmountField = (row)=>{
    const fields = [
        "Net Amt.",
        "AMOUNT",
        "AMT",
        "TOTAL",
        "TOTAL AMOUNT",
        "VALUE",
        "Amount"
    ];
    for (const field of fields){
        if (row[field] !== undefined) return parseFloat(row[field]) || 0;
    }
    return 0;
};
const DataPreviewB_formatDate = (value)=>{
    if (typeof value === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        const parsed = new Date(excelEpoch.getTime() + value * 86400000);
        return (0,format/* default */.ZP)(parsed, "dd-MM-yyyy");
    }
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return (0,format/* default */.ZP)(parsed, "dd-MM-yyyy");
    return String(value);
};
const DataPreviewB_DataPreview = ({ data, commissionRate, commissionType, fixedRate, totalTransactions, totalQuantity, totalAmount, totalCommission, selectedMiller, selectedBuyer })=>{
    const [currentPage, setCurrentPage] = (0,react_.useState)(1);
    const rowsPerPage = 10;
    const calculatedRows = (0,react_.useMemo)(()=>{
        return data.map((row, idx)=>{
            const quantity = DataPreviewB_findQuantityField(row);
            const amount = DataPreviewB_findAmountField(row);
            const buyer = row["BUYER NAME"] || "";
            const miller = row["MILLER NAME"] || "";
            const isNidhiAgro = (miller || "").toLowerCase().includes("nidhi agro");
            let commission = 0;
            if (isNidhiAgro) {
                commission = amount * 0.01;
            } else if (commissionType === "percentage") {
                commission = amount * commissionRate;
            } else {
                commission = quantity * fixedRate;
            }
            const rate = isNidhiAgro ? "1%" : commissionType === "percentage" ? `${(commissionRate * 100).toFixed(2)}%` : `${fixedRate}`;
            return {
                idx: idx + 1,
                date: DataPreviewB_formatDate(row["DATE"] || row["Date"] || ""),
                buyer,
                miller,
                billNo: row["BILL NO"] || row["BILL"] || "",
                quantity,
                rate,
                amount,
                commission: commission.toFixed(2)
            };
        });
    }, [
        data,
        commissionRate,
        commissionType,
        fixedRate
    ]);
    const paginatedRows = (0,react_.useMemo)(()=>{
        const start = (currentPage - 1) * rowsPerPage;
        return calculatedRows.slice(start, start + rowsPerPage);
    }, [
        calculatedRows,
        currentPage
    ]);
    const totalPages = Math.ceil(calculatedRows.length / rowsPerPage);
    const exportToPDF = ()=>{
        const doc = new jspdf_node_min["default"]({
            orientation: "portrait",
            unit: "pt",
            format: "a4"
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        const marginX = 40;
        let finalY = 40;
        // Header
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Tejas Canvassing", pageWidth / 2, finalY, {
            align: "center"
        });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("No. 123, 1st Floor, 4th main Road, Yeshwanthpur,APMC Yard,Bengaluru - 560022", pageWidth / 2, finalY + 20, {
            align: "center"
        });
        doc.text("Phone: +91-9876543210", pageWidth / 2, finalY + 35, {
            align: "center"
        });
        finalY += 60;
        // Summary
        jspdf_plugin_autotable_default()(doc, {
            startY: finalY,
            head: [
                [
                    "Summary",
                    "Value"
                ]
            ],
            body: [
                [
                    "Total Transactions",
                    totalTransactions.toString()
                ],
                [
                    "Total Quantity (Quintals)",
                    totalQuantity.toFixed(2)
                ],
                [
                    "Total Amount",
                    totalAmount.toFixed(2)
                ],
                [
                    "Total Commission",
                    totalCommission.toFixed(2)
                ]
            ],
            headStyles: {
                fillColor: [
                    63,
                    81,
                    181
                ],
                textColor: 255
            },
            theme: "grid",
            styles: {
                fontSize: 10
            },
            margin: {
                left: marginX,
                right: marginX
            }
        });
        finalY = doc.lastAutoTable.finalY + 20;
        // Transactions Table
        jspdf_plugin_autotable_default()(doc, {
            startY: finalY,
            head: [
                [
                    "#",
                    "Date",
                    "Buyer",
                    "Miller",
                    "Bill No",
                    "Quantity",
                    "Rate",
                    "Amount",
                    "Commission"
                ]
            ],
            body: calculatedRows.map((row)=>[
                    row.idx,
                    row.date,
                    row.buyer,
                    row.miller,
                    row.billNo,
                    row.quantity,
                    row.rate,
                    row.amount,
                    row.commission
                ]),
            styles: {
                fontSize: 9
            },
            theme: "grid",
            margin: {
                left: marginX,
                right: marginX
            },
            headStyles: {
                fillColor: [
                    0,
                    123,
                    255
                ],
                textColor: 255
            }
        });
        finalY = doc.lastAutoTable.finalY + 20;
        // Bank Details
        jspdf_plugin_autotable_default()(doc, {
            startY: finalY,
            head: [
                [
                    "Bank Name",
                    "Branch",
                    "IFSC Code",
                    "Account No",
                    "UPI"
                ]
            ],
            body: [
                [
                    "HDFC BANK ",
                    "Yeshwanthpur",
                    "CNRB0001234",
                    "1234567890",
                    "9916416995@upi"
                ]
            ],
            styles: {
                fontSize: 9
            },
            headStyles: {
                fillColor: [
                    76,
                    175,
                    80
                ],
                textColor: 255
            },
            theme: "grid",
            margin: {
                left: marginX,
                right: marginX
            }
        });
        const safeBuyer = selectedBuyer && selectedBuyer !== "all" ? selectedBuyer.replace(/[^a-z0-9]/gi, "_") : "AllBuyers";
        const fileName = `${safeBuyer}.pdf`;
        doc.save(fileName);
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: "data-preview",
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: "preview-header",
                children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                    className: "header-title",
                    children: [
                        /*#__PURE__*/ jsx_runtime_.jsx("h3", {
                            children: "Buyer Side View"
                        }),
                        /*#__PURE__*/ jsx_runtime_.jsx("button", {
                            className: "export-button",
                            onClick: exportToPDF,
                            children: "Export to PDF"
                        })
                    ]
                })
            }),
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                className: "preview-table-wrapper",
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("table", {
                        className: "preview-table",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("thead", {
                                children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("tr", {
                                    children: [
                                        /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                            children: "#"
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                            children: "Date"
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                            children: "Buyer"
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                            children: "Miller"
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                            children: "Bill No"
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                            children: "Quantity"
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                            children: "Rate"
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                            children: "Amount"
                                        }),
                                        /*#__PURE__*/ jsx_runtime_.jsx("th", {
                                            children: "Commission"
                                        })
                                    ]
                                })
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("tbody", {
                                children: paginatedRows.map((row)=>/*#__PURE__*/ (0,jsx_runtime_.jsxs)("tr", {
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                                children: row.idx
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                                children: row.date
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                                children: row.buyer
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                                children: row.miller
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                                children: row.billNo
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                                children: row.quantity
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                                children: row.rate
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                                children: row.amount
                                            }),
                                            /*#__PURE__*/ jsx_runtime_.jsx("td", {
                                                children: row.commission
                                            })
                                        ]
                                    }, row.idx))
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "pagination",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                onClick: ()=>setCurrentPage((p)=>Math.max(p - 1, 1)),
                                disabled: currentPage === 1,
                                children: "Prev"
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("span", {
                                className: "pagination-info",
                                children: [
                                    "Page ",
                                    currentPage,
                                    " of ",
                                    totalPages
                                ]
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                onClick: ()=>setCurrentPage((p)=>Math.min(p + 1, totalPages)),
                                disabled: currentPage === totalPages,
                                children: "Next"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: "preview-summary",
                children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                    className: "summary-grid",
                    children: [
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "summary-item",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                    children: "Total Transactions"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                    children: totalTransactions
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "summary-item",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                    children: "Total Quantity"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                    children: totalQuantity
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "summary-item",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                    children: "Total Amount"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                    children: totalAmount.toLocaleString()
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "summary-item",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                    children: "Total Commission"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                    children: totalCommission.toLocaleString()
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                            className: "summary-item",
                            children: [
                                /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                    children: "Commission Type"
                                }),
                                /*#__PURE__*/ jsx_runtime_.jsx("span", {
                                    children: commissionType === "percentage" ? `${(commissionRate * 100).toFixed(2)}%` : `${fixedRate} per unit`
                                })
                            ]
                        })
                    ]
                })
            })
        ]
    });
};
/* harmony default export */ const components_DataPreviewB = (DataPreviewB_DataPreview);

// EXTERNAL MODULE: ./app/styles/calculator.css
var calculator = __webpack_require__(5708);
;// CONCATENATED MODULE: ./app/page.tsx
/* __next_internal_client_entry_do_not_use__ default auto */ 









function Home() {
    const [excelData, setExcelData] = (0,react_.useState)([]);
    const [millers, setMillers] = (0,react_.useState)([]);
    const [buyers, setBuyers] = (0,react_.useState)([]);
    const [filteredBuyers, setFilteredBuyers] = (0,react_.useState)([]);
    const [selectedMiller, setSelectedMiller] = (0,react_.useState)("all");
    const [selectedBuyer, setSelectedBuyer] = (0,react_.useState)("all");
    const [commissionRate, setCommissionRate] = (0,react_.useState)(0.02);
    const [commissionType, setCommissionType] = (0,react_.useState)("percentage");
    const [fixedRate, setFixedRate] = (0,react_.useState)(10);
    const [isClient, setIsClient] = (0,react_.useState)(false);
    const [loading, setLoading] = (0,react_.useState)(false);
    const [error, setError] = (0,react_.useState)("");
    const [calculationSide, setCalculationSide] = (0,react_.useState)("miller");
    (0,react_.useEffect)(()=>{
        setIsClient(true);
    }, []);
    const handleDataImport = async (data)=>{
        try {
            setLoading(true);
            if (!Array.isArray(data)) {
                setError("Invalid data format");
                return;
            }
            const normalized = data.map((row)=>({
                    ...row,
                    "BUYER NAME": row["BUYER NAMER"] || row["BUYER NAME"]
                }));
            setExcelData(normalized);
            const uniqueMillers = Array.from(new Set(data.map((row)=>row["MILLER NAME"] || ""))).filter(Boolean);
            const uniqueBuyers = Array.from(new Set(data.map((row)=>row["BUYER NAME"] || ""))).filter(Boolean);
            setMillers(uniqueMillers);
            setBuyers(uniqueBuyers);
            setFilteredBuyers(uniqueBuyers);
            setError("");
        } catch (err) {
            console.error("Import Error:", err);
            setError("Import failed");
        } finally{
            setLoading(false);
        }
    };
    const handleMillerChange = (miller)=>{
        setSelectedMiller(miller);
        setSelectedBuyer("all");
    };
    const getFilteredData = ()=>{
        return excelData.filter((row)=>{
            const millerMatch = selectedMiller === "all" || row["MILLER NAME"] === selectedMiller;
            const buyerMatch = selectedBuyer === "all" || row["BUYER NAME"] === selectedBuyer;
            return millerMatch && buyerMatch;
        });
    };
    const findQuantityField = (row)=>{
        const fields = [
            "QUINTALS",
            "QUANTITY",
            "QTY",
            "QTLS",
            "QUINTAL",
            "qtls"
        ];
        for (const field of fields){
            if (row[field] !== undefined) return parseFloat(row[field]) || 0;
        }
        return 0;
    };
    const findAmountField = (row)=>{
        const fields = [
            "Net Amt.",
            "AMOUNT",
            "AMT",
            "TOTAL",
            "TOTAL AMOUNT",
            "VALUE",
            "Amount"
        ];
        for (const field of fields){
            if (row[field] !== undefined) return parseFloat(row[field]) || 0;
        }
        return 0;
    };
    const calculateTotalQuantity = (data)=>{
        return data.reduce((total, row)=>total + findQuantityField(row), 0);
    };
    const calculateTotalAmount = (data)=>{
        return data.reduce((total, row)=>total + findAmountField(row), 0);
    };
    const calculateTotalCommission = (data)=>{
        return data.reduce((total, row)=>{
            const qty = findQuantityField(row);
            const amt = findAmountField(row);
            const miller = (row["MILLER NAME"] || "").toLowerCase();
            let commission = 0;
            if (miller.includes("nidhi agro")) {
                commission = amt * 0.01;
            } else if (commissionType === "percentage") {
                commission = amt * commissionRate;
            } else {
                commission = qty * fixedRate;
            }
            return total + commission;
        }, 0);
    };
    (0,react_.useEffect)(()=>{
        let filteredMillers = [];
        let filteredBuyers = [];
        if (calculationSide === "miller") {
            filteredMillers = selectedBuyer === "all" ? Array.from(new Set(excelData.map((row)=>row["MILLER NAME"]).filter(Boolean))) : Array.from(new Set(excelData.filter((row)=>row["BUYER NAME"] === selectedBuyer).map((row)=>row["MILLER NAME"]).filter(Boolean)));
            filteredBuyers = selectedMiller === "all" ? Array.from(new Set(excelData.map((row)=>row["BUYER NAME"]).filter(Boolean))) : Array.from(new Set(excelData.filter((row)=>row["MILLER NAME"] === selectedMiller).map((row)=>row["BUYER NAME"]).filter(Boolean)));
        } else {
            filteredBuyers = selectedMiller === "all" ? Array.from(new Set(excelData.map((row)=>row["BUYER NAME"]).filter(Boolean))) : Array.from(new Set(excelData.filter((row)=>row["MILLER NAME"] === selectedMiller).map((row)=>row["BUYER NAME"]).filter(Boolean)));
            filteredMillers = selectedBuyer === "all" ? Array.from(new Set(excelData.map((row)=>row["MILLER NAME"]).filter(Boolean))) : Array.from(new Set(excelData.filter((row)=>row["BUYER NAME"] === selectedBuyer).map((row)=>row["MILLER NAME"]).filter(Boolean)));
        }
        setMillers(filteredMillers);
        setFilteredBuyers(filteredBuyers);
        if (selectedMiller !== "all" && !filteredMillers.includes(selectedMiller)) {
            setSelectedMiller("all");
        }
        if (selectedBuyer !== "all" && !filteredBuyers.includes(selectedBuyer)) {
            setSelectedBuyer("all");
        }
    }, [
        selectedMiller,
        selectedBuyer,
        excelData,
        calculationSide
    ]);
    const filteredData = (0,react_.useMemo)(()=>getFilteredData(), [
        excelData,
        selectedMiller,
        selectedBuyer
    ]);
    const totalQuantity = (0,react_.useMemo)(()=>calculateTotalQuantity(filteredData), [
        filteredData
    ]);
    const totalAmount = (0,react_.useMemo)(()=>calculateTotalAmount(filteredData), [
        filteredData
    ]);
    const totalCommission = (0,react_.useMemo)(()=>calculateTotalCommission(filteredData), [
        filteredData,
        commissionRate,
        commissionType,
        fixedRate
    ]);
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("main", {
        className: "container",
        children: [
            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("header", {
                className: "header",
                children: [
                    /*#__PURE__*/ jsx_runtime_.jsx("h1", {
                        children: "TEJAS ANALYTICS PLATFORM"
                    }),
                    /*#__PURE__*/ jsx_runtime_.jsx("p", {
                        children: "Enterprise solution for miller-buyer transaction analysis"
                    })
                ]
            }),
            isClient ? /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
                children: [
                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "card",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("h2", {
                                children: "Import Your Data"
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx(components_ExcelImport, {
                                onDataImport: handleDataImport
                            }),
                            loading && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: "loading",
                                children: "Importing data, please wait..."
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "toggle-buttons",
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                        onClick: ()=>setCalculationSide("miller"),
                                        className: calculationSide === "miller" ? "active" : "",
                                        children: "Miller Side"
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx("button", {
                                        onClick: ()=>setCalculationSide("buyer"),
                                        className: calculationSide === "buyer" ? "active" : "",
                                        children: "Buyer Side"
                                    })
                                ]
                            })
                        ]
                    }),
                    error && /*#__PURE__*/ jsx_runtime_.jsx("div", {
                        className: "error-alert",
                        children: error
                    }),
                    excelData.length > 0 && /*#__PURE__*/ (0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx(components_FilterControls, {
                                millers: millers,
                                buyers: filteredBuyers,
                                selectedMiller: selectedMiller,
                                selectedBuyer: selectedBuyer,
                                commissionRate: commissionRate,
                                commissionType: commissionType,
                                fixedRate: fixedRate,
                                onMillerChange: handleMillerChange,
                                onBuyerChange: setSelectedBuyer,
                                onCommissionRateChange: setCommissionRate,
                                onCommissionTypeChange: setCommissionType,
                                onFixedRateChange: setFixedRate
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "summary",
                                children: [
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("p", {
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                children: "Total Quantity:"
                                            }),
                                            " ",
                                            totalQuantity
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("p", {
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                children: "Total Amount:"
                                            }),
                                            " ₹",
                                            totalAmount.toLocaleString()
                                        ]
                                    }),
                                    /*#__PURE__*/ (0,jsx_runtime_.jsxs)("p", {
                                        children: [
                                            /*#__PURE__*/ jsx_runtime_.jsx("strong", {
                                                children: "Total Commission:"
                                            }),
                                            " ₹",
                                            totalCommission.toLocaleString()
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: "preview-wrapper",
                                children: calculationSide === "miller" ? /*#__PURE__*/ jsx_runtime_.jsx(components_DataPreview, {
                                    data: filteredData,
                                    commissionRate: commissionRate,
                                    commissionType: commissionType,
                                    fixedRate: fixedRate,
                                    totalTransactions: filteredData.length,
                                    totalQuantity: totalQuantity,
                                    totalAmount: totalAmount,
                                    totalCommission: totalCommission,
                                    selectedMiller: selectedMiller,
                                    selectedBuyer: selectedBuyer
                                }) : /*#__PURE__*/ jsx_runtime_.jsx(components_DataPreviewB, {
                                    data: filteredData,
                                    commissionRate: commissionRate,
                                    commissionType: commissionType,
                                    fixedRate: fixedRate,
                                    totalTransactions: filteredData.length,
                                    totalQuantity: totalQuantity,
                                    totalAmount: totalAmount,
                                    totalCommission: totalCommission,
                                    selectedMiller: selectedMiller,
                                    selectedBuyer: selectedBuyer
                                })
                            })
                        ]
                    })
                ]
            }) : /*#__PURE__*/ jsx_runtime_.jsx("div", {
                children: "Loading..."
            })
        ]
    });
}


/***/ }),

/***/ 1921:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ RootLayout),
/* harmony export */   metadata: () => (/* binding */ metadata)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6786);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _app_styles_calculator_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3297);
/* harmony import */ var _app_styles_calculator_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_app_styles_calculator_css__WEBPACK_IMPORTED_MODULE_1__);
// app/layout.tsx


const metadata = {
    title: "My App",
    description: "Generated by Next.js"
};
function RootLayout({ children }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("html", {
        lang: "en",
        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("body", {
            children: children
        })
    });
}


/***/ }),

/***/ 2838:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $$typeof: () => (/* binding */ $$typeof),
/* harmony export */   __esModule: () => (/* binding */ __esModule),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1363);

const proxy = (0,next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__.createProxy)(String.raw`C:\Users\12400f_RTX3070ti\Desktop\BROKERAGE\app\page.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule, $$typeof } = proxy;
const __default__ = proxy.default;


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__default__);

/***/ }),

/***/ 2815:
/***/ (() => {



/***/ }),

/***/ 215:
/***/ (() => {



/***/ }),

/***/ 3297:
/***/ (() => {



/***/ }),

/***/ 5708:
/***/ (() => {



/***/ }),

/***/ 7166:
/***/ (() => {



/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [478,588], () => (__webpack_exec__(6930)));
module.exports = __webpack_exports__;

})();