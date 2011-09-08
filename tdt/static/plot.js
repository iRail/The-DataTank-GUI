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
        url: 'http://datatank.demo.ibbt.be/TDTInfo/Modules/?format=json',
        dataType: 'json',
        success: fillModules,
        error: function() {alert('error');}
    });

    // Fill the stats-resource with all its resources.
    var statsResource = $('#stats-resource');
    var statsSubmit = $('#stats-submit');
    var fillResources = function(module) {
        statsResource.empty();
        statsResource.append('<option>-- Select a resource --</option>');

        $.each(module, function(key, value) {
            statsResource.append('<option>'+key+'</option>');
        });
        statsResource.removeAttr('disabled');
        statsSubmit.removeAttr('disabled'); 
    };
    
    statsModule.change(function(e) {
        var module = $('#stats-module option:selected').text();
        //if ($(module === '-- Select a module --')) {
            //statsResource.empty();
            //statsResource.append('<option>-- Select a resource --</option>');
            //statsResource.attr('disabled', 'disabled');
            //statsSubmit.attr('disabled', 'disabled');
        //} else {
            console.log('hello')
            $.ajax({
                type: 'GET',
                //TODO replace by real url.
                url: 'http://datatank.demo.ibbt.be/TDTInfo/Modules/' + module +
                    '/?format=json',
                dataType: 'json',
                success: fillResources,
                error: function() {alert('error');}
            });
        //}
    });
    
    // If #stats-submit is pressed generate graph.
    statsSubmit.click(function() {
        var moduleName = statsModule.val();
        var resourceName = statsResource.val();
        
        //var args =  moduleName + "/";
        var resource ="";
        if (resourceName != "-- Select a resource --") {
            resource= "&resource="+resourceName;
        }
        
        $.ajax({
            type: 'GET',
            url: 'http://datatank.demo.ibbt.be/TDTInfo/Queries/' +
                moduleName + '/?format=json' + resource,
            dataType: 'json',
            success: function(result) {
                plotChart(result);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert('Something went wrong. ' + errorThrown);
            }
        });
        return false;
    });
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
		dataToDisplayRequests.push([hackindex,dataset[i]]);
		timeArray["requests"].push(i*1000);
		hackindex++;
	}
	/* create our error dataset */
	dataset = dataArray["errors"];
	var dataToDisplayErrors = [];
	var hackindex = 0;
	for (var i in dataset) {
		dataToDisplayErrors.push([hackindex,dataset[i]]);
		timeArray["errors"].push(i*1000);
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

/* catching select Module event */
//$("#stats-module").change(function(e) {
    //var moduleName = $("#module").val();
	//$("#method").empty();
	//var arr = modmeths[moduleName];
	//for (var i=0; i<arr.length; ++i) {
		//$("#method").append("<option value="+arr[i]+">"+arr[i]+"</option>");
	//}
//});
