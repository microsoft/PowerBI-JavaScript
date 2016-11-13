/*
	This file contains the code samples which will appear live in the web-page.
	Each sample method name starts with _Report_ or _Page or _Embed depends on which section it appears.
	Please keep this.
*/

// ---- Embed Code ----------------------------------------------------

function _Embed_BasicEmbed() {
	var txtAccessToken = $('#txtAccessToken').val();
	var txtEmbedUrl = $('#txtReportEmbed').val();
	var txtEmbedReportId = $('#txtEmbedReportId').val();

	var embedConfiguration = {
		type: 'report',
		accessToken: txtAccessToken,
		embedUrl: txtEmbedUrl,
		id: txtEmbedReportId,
		settings: {
			filterPaneEnabled: true,
			navContentPaneEnabled: true
		}
	};
	
	var reportContainer = document.getElementById('reportContainer');
	powerbi.embed(reportContainer, embedConfiguration);
}

function _Embed_EmbedWithDefaultFilter() {
	var txtAccessToken = $('#txtAccessToken').val();
	var txtEmbedUrl = $('#txtReportEmbed').val();
	var txtEmbedReportId = $('#txtEmbedReportId').val();
	
	const filter = {
	  $schema: "http://powerbi.com/product/schema#basic",
	  target: {
		table: "Store",
		column: "Chain"
	  },
	  operator: "In",
	  values: ["Lindseys"]
	};
	
	var embedConfiguration = {
		type: 'report',
		accessToken: txtAccessToken,
		embedUrl: txtEmbedUrl,
		id: txtEmbedReportId,
		settings: {
			filterPaneEnabled: false,
			navContentPaneEnabled: false
		},
		filters: [filter]
	};
	
	var reportContainer = document.getElementById('reportContainer');
	powerbi.embed(reportContainer, embedConfiguration);
}

// ---- Report Operations ----------------------------------------------------

 function _Report_GetId() {
	report = powerbi.embeds[0];
	$('#result').html(report.getId());
}

function _Report_UpdateSettings() {
	const newSettings = {
	  navContentPaneEnabled: true,
	  filterPaneEnabled: false
	};

	report = powerbi.embeds[0];
	report.updateSettings(newSettings)
		.then(function (result) {
			$("#result").html(result);
		})
		.catch(function (error) {
			$("#result").html(error);
		});
}

function _Report_GetPages() {
	report = powerbi.embeds[0];
	
	report.getPages()
		.then(function (pages) {
			var result = "";
			var index = 1;
			pages.forEach(function(page) {
				result = result + index + ") " + page.name + "(displayName: " + page.displayName + ")" + "<br/>";
				index++;
			});

			$("#result").html("Done. <br/>" + result);
		})
		.catch(function (errors) {
			$("#result").html("Error. <br/>" + JSON.stringify(errors));
		});
}

function _Report_SetPage() {
	report = powerbi.embeds[0];
	report.setPage("ReportSection2")
		.then(function (result) {
			$("#result").html("Done. <br/>" + JSON.stringify(result));
		})
		.catch(function (errors) {
			$("#result").html("Error. <br/>" + JSON.stringify(errors));
		});
}

function _Report_GetFilters() {
	report = powerbi.embeds[0];
	
	report.getFilters()
		.then(function (filters) {
			$("#result").html("Done. <br/>" + JSON.stringify(filters, null, " "));
		})
		.catch(function (errors) {
			$("#result").html("Error. <br/>" + JSON.stringify(errors));
		});
}

function _Report_SetFilters() {
	const filter = {
	  $schema: "http://powerbi.com/product/schema#basic",
	  target: {
		table: "Store",
		column: "Chain"
	  },
	  operator: "In",
	  values: ["Lindseys"]
	};

	report = powerbi.embeds[0];
	report.setFilters([filter])
		.then(function (result) {
			$("#result").html("Done. <br/>" + JSON.stringify(result));
		})
		.catch(function (errors) {
			$("#result").html("Error. <br/>" + JSON.stringify(errors));
		});
}

function _Report_RemoveFilters() {
	report = powerbi.embeds[0];
	report.removeFilters()
		.then(function (result) {
			$("#result").html("Done. <br/>" + JSON.stringify(result));
		})
		.catch(function (errors) {
			$("#result").html("Error. <br/>" + JSON.stringify(errors));
		});
}

function _Report_PrintCurrentReport() {
	report = powerbi.embeds[0];
	report.print()
		.then(function (result) {
			$("#result").html("Done. <br/>" + JSON.stringify(result));
		})
		.catch(function (errors) {
			$("#result").html("Error. <br/>" + JSON.stringify(errors));
		});
}

function _Report_Reload() {
	report = powerbi.embeds[0];
	report.reload()
		.then(function (result) {
			$("#result").html("Done. <br/>" + JSON.stringify(result));
		})
		.catch(function (errors) {
			$("#result").html("Error. <br/>" + JSON.stringify(errors));
		});
}

function _Report_FullScreen() {
	report = powerbi.embeds[0];
	report.fullscreen();
	
	$("#result").html("Done!");
}

function _Report_ExitFullScreen() {
	report = powerbi.embeds[0];
	report.exitFullscreen();
	
	$("#result").html("Done!");
}

// ---- Page Operations ----------------------------------------------------

function _Page_SetActive() {
	report = powerbi.embeds[0];
	
	// Set the second page active
	report.getPages()
		.then(function (pages) {
			pages[1].setActive().then(function (result) {
				$("#result").html("Done. <br/>" + result)
			});
		})
		.catch(function (errors) {
			$("#result").html("getPages Error. " + errors);
		});
}

function _Page_GetFilters() {
	report = powerbi.embeds[0];
	
	// Get Filters of first page
	report.getPages()
		.then(function (pages) {
			pages[1].getFilters()
				.then(function (filters) {
					$("#result").html("Done. <br/>" + JSON.stringify(filters, null, " "))
				})
				.catch(function (errors) {
					$("#result").html("Error. <br/>" + JSON.stringify(errors));
				});
		})
		.catch(function (errors) {
			$("#result").html("getPages Error. " + errors);
		});
}

function _Page_SetFilters() {
	const filter = {
		$schema: "http://powerbi.com/product/schema#basic",
		target: {
			table: "Store",
			column: "Chain"
		},
		operator: "In",
		values: ["Lindseys"]
	};

	report = powerbi.embeds[0];
	report.getPages()
		.then(function (pages) {
			pages[1].setFilters([filter])
				.then(function (result) {
					$("#result").html("Done. <br/>" + JSON.stringify(result));
				})
				.catch(function (errors) {
					$("#result").html("Error. <br/>" + JSON.stringify(errors));
				});
		})
		.catch(function (errors) {
			$("#result").html("Error. <br/>" + JSON.stringify(errors));
		});
}

function _Page_RemoveFilters() {
	report = powerbi.embeds[0];
	
	// Get Filters of first page
	report.getPages()
		.then(function (pages) {
			pages[1].removeFilters()
				.then(function (result) {
					$("#result").html("Done. <br/>" + JSON.stringify(result));
				})
				.catch(function (errors) {
					$("#result").html("Error. <br/>" + JSON.stringify(errors));
				});
		})
		.catch(function (errors) {
			$("#result").html("getPages Error. " + errors);
		});
}
