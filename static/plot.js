var $ = jQuery.noConflict();

$(document).ready( function() {
    // Draw empty Canvas.
    var options = {
        lines: { show: true },
        points: { show: true },
        xaxis: { tickDecimals: 0, tickSize: 1 }
    };
    var data = [];
    var placeholder = $("#stats-placeholder");
    
    $.plot(placeholder, data, options);

    // Functions to hide and show error message.
    var statsError = $('#stats-error');
    var hideError = function() {
        statsError.addClass('hidden');
    };

    var showError = function() {
        statsError.removeClass('hidden');
        $.plot(placeholder, data, options);
    };

    // Fill the stats-module select with all available modules.
    var statsModule = $('#stats-module');
    var fillModules = function(modules) {
        $.each(modules, function(key, value) {
            statsModule.append('<option>'+key+'</option>');
        });
    };
    $.ajax({
        type: 'GET',
        //TODO replace by real url.
        
        url: Config.API_HOST+'TDTInfo/Resources.json',
        dataType: 'json',
        success: fillModules,
        error: function() {alert('error');}
    });

    // Fill the stats-resource with all its resources.
    var statsResource = $('#stats-resource');
    var fillResources = function(module) {
        statsResource.empty();
        statsResource.append('<option>-- Select a resource --</option>');

        $.each(module, function(key, value) {
            statsResource.append('<option>'+key+'</option>');
        });
        statsResource.removeAttr('disabled');
    };
    
    statsModule.change(function(e) {
        hideError();
        var module = statsModule.val();
        if (module === '-- Select a package --') {
            statsResource.empty();
            statsResource.append('<option>-- Select a resource --</option>');
            statsResource.attr('disabled', 'disabled');
            // Reset plot placeholder
            $.plot(placeholder, data, options);
        } else {
            // get all resource for module and put them in statsResource
            $.ajax({
                type: 'GET',
                //TODO replace by real url.
                url: Config.API_HOST+'TDTInfo/Resources/' + module +
                    '.json',
                dataType: 'json',
                success: fillResources,
                error: showError
            });
            // draw graph for module with all its resources
            $.ajax({
                type: 'GET',
                url: Config.API_HOST+'TDTInfo/Queries/' +
                    module + '.json',
                dataType: 'json',
                success: function(result) {
                    plotChart(result);
                },
                error: showError
            });
        }
    });

    // 
    statsResource.change(function(e) {
        hideError();
        var module = statsModule.val();
        var resource = statsResource.val()
        var resourceParameter = '';
        if (resource !== '-- Select a resource --') {
            resourceParameter = '&resource=' + resource;
        }
        // draw graph for module with all its resources
        $.ajax({
            type: 'GET',
            url: Config.API_HOST+'TDTInfo/Queries/' +
                module + '.json?' + resourceParameter,
            dataType: 'json',
            success: function(result) {
                plotChart(result);
            },
            error: showError
        });
    });
    
    // If #stats-submit is pressed generate graph.
    //statsSubmit.click(function() {
        //var moduleName = statsModule.val();
        //var resourceName = statsResource.val();
        
        ////var args =  moduleName + "/";
        //var resource ="";
        //if (resourceName != "-- Select a resource --") {
            //resource= "&resource="+resourceName;
        //}
        
        //$.ajax({
            //type: 'GET',
            //url: 'http://datatank.demo.ibbt.be/TDTInfo/Queries/' +
                //moduleName + '/?format=json' + resource,
            //dataType: 'json',
            //success: function(result) {
                //plotChart(result);
            //},
            //error: function(XMLHttpRequest, textStatus, errorThrown) {
                //alert('Something went wrong. ' + errorThrown);
            //}
        //});
        //return false;
    //});
});

/* plotChart with own Data !! */
function plotChart(dataArray) {	
	/* dataset given, get the resulting array of the result object*/
	var dataset = dataArray["requests"];

	/* our dataArray contains data that needs to be tweaked -> unix to javascripttime */
	var dataToDisplayRequests = [];

	var hackindex = 0;
	var empty=[];

	var timeArray = new Array();
	timeArray["requests"] = [];
	timeArray["errors"] = [];
	
    for (var i in dataset) {
        dataToDisplayRequests.push([hackindex,dataset[i].amount]);
        timeArray["requests"].push(dataset[i].time*1000);
        hackindex++;
    }
    /* create our error dataset */
    dataset = dataArray["errors"];
    var dataToDisplayErrors = [];
    var hackindex = 0;
    for(var i in dataset){
        dataToDisplayErrors.push([hackindex,dataset[i].amount]);
        timeArray["errors"].push(dataset[i].time*1000);
        hackindex++;
    }

	if (dataToDisplayRequests.length > 0 || dataToDisplayErrors.length > 0) {
	    /* construct the x-axis array, again conversion from unix to javascripttime */
	    var data = [
            {label:"requests", data: dataToDisplayRequests},
			{label:"errors", data: dataToDisplayErrors}
		];
        
        var options = {
		    legend: {
                show: true,
			    margin: 10,
			    backgroundOpacity: 0
		    },
		    points: {
			    show: true,
			    radius: 3,
			    clickable: true,
			    hoverable: true,
			    autoHighlight: true
            },
            lines: {
			    show: true,
			    hoverable: true
		    },
		    grid: {
			    borderWidth:0,
			    backgroundColor: "white",
			    hoverable: true,
		    },
		    xaxis: {
			    ticks: empty
		    },
		    yaxis: {
			    tickDecimals: 0,
			    min: 0
		    }
		};
        
        var plotarea = $("#stats-placeholder");
		$.plot( plotarea , data, options );

		function showTooltip(x, y, contents) {
            $('<div id="tooltip">' + contents + '</div>').css({
                position: 'absolute',
                display: 'none',
                top: y + 8,
                left: x + 8,
                border: '1px solid #fdd',
                padding: '2px',
                'background-color': '#fee',
                opacity: 0.80
            }).appendTo("body").fadeIn(200);
		}

		var previousPoint = null;
		$("#stats-placeholder").bind("plothover", function(event, pos, item) {
		    if (item) {
				if (previousPoint != item.dataIndex) {
				    previousPoint = item.dataIndex;
				    item.series.label
				    
				    $("#tooltip").remove();
                    // TODO 
				    var javascripttime = timeArray[item.series.label][item.datapoint[0]]
                    var yvalue = item.datapoint[1];
				    var date = new Date(javascripttime);
				    var month = date.getMonth()+1;
				    var day = date.getDate();
				    var year = date.getFullYear();

                    // TODO correct splitting
                    var noIdea = yvalue + " " + item.series.label + " on " + day +
                        "/" + month + "/" + year;
				    showTooltip(item.pageX, item.pageY, noIdea);
				}
			} else {
				$("#tooltip").remove();
				previousPoint = null;
			}
		});
	} else {
		$("#stats-placeholder").text("No logging data available for the selected criteria.");
	}
};
