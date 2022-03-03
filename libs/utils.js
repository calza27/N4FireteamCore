loadPage = function(page, target) {
	$("body").append('<div id="fakeTitle" style="display:none;"></div>');
	$("#fakeTitle").load(page + " #title", function(data, status, jqXGR) {
		if(data) {
			changeTitle($("#fakeTitle > #title").html());
		}
		$("#fakeTitle").remove();
	});
	
	if(!target) target = "body";
	$(target).load(page + " #container>*", function(data, status, jqXGR) {
		evalJSFromHtml(data);
	});
};

changeTitle = function(newTitle) {
	$("title").html(newTitle);
};

evalJSFromHtml = function (html) {
    var newElement = document.createElement('div');
    newElement.innerHTML = html;
    var scripts = newElement.getElementsByTagName("script");
    for (var i=0; i<scripts.length; ++i) {
        var script = scripts[i];
        eval(script.innerHTML);
    }
};

clearUnitSelector = function(selector) {
	$(selector).hide();
	$(selector).html('');
	$(selector)[0].selectedUnit = null;
};

getUnitListJSON = function() {
	var factionJSON = $("#contents")[0].armyJSON;
	if(factionJSON) {
		return factionJSON.units;
	}
	return null;
};

canAddMore = function(unitName) {
	var canAddMore = false;
	var unit = getUnitJSON(unitName);
	if(unit) {
		var counter = 0;
		$.each($('#builtFireTeam .memberBuilt .unitLabel'), function(i, selectElem) {
			if($(selectElem).html() === unitName) {
				counter++;
			}
		});
		
		if(unit.shareAVA != null && unit.shareAVA.length > 0) {
			$.each($('#builtFireTeam .memberBuilt .unitLabel'), function(i, selectElem) {
				if(unit.shareAVA.indexOf($(selectElem).html()) > -1) {
					counter++;
				}
			});
		}
		
		if(unit.ava != null && unit.ava > 0 && unit.ava <= counter) {
			//we've hit the hard limit on army ava, so return false
			return false;
		} else if(
			unit.wildcard
			&& $("#contents")[0].seedUnit.indexOf(unit.name) == -1
			&& unit.wildcardLimit != null
			&& unit.wildcardLimit <= counter
		) {
			//this unit can wildcard, is not in a native fireteam
			//has a limit to how many times it can wildcard into a link
			// and has hit that limit
			return false;
		} else {
			canAddMore = true;
			if($("#contents")[0].seedUnit.indexOf(unit.name) == -1) {
				$.each(unit.canJoin, function(i2, unitCanJoin) {
					if(unitCanJoin.ava != null && unitCanJoin.ava > 0) {
						if(
							$("#contents")[0].seedUnit != null
							&& $("#contents")[0].seedUnit.length > 0
							&& $("#contents")[0].seedUnit.indexOf(unitCanJoin.name) > -1
						) {
							if(
								unitCanJoin.fireteam == null
								|| unitCanJoin.fireteam.length == 0
								|| unitCanJoin.fireteam.indexOf($("#contents")[0].fireteam) > -1
							) {
								if(unitCanJoin.ava <= counter) {
									canAddMore = false;
									return false;
								}
							}
						}
					}
				});
			}
		}
	}
	return canAddMore;
};

validMemeberCount = function(unitName, teamLeadName) {
	var canAddMore = false;
	var unit = getUnitJSON(unitName);
	if(unit) {
		var counter = 0;
		$.each($('#builtFireTeam .memberBuilt .unitLabel'), function(i, selectElem) {
			if($(selectElem).html() === unitName) {
				counter++;
			}
		});
		
		if(unit.shareAVA != null && unit.shareAVA.length > 0) {
			$.each($('#builtFireTeam .memberBuilt .unitLabel'), function(i, selectElem) {
				if(unit.shareAVA.indexOf($(selectElem).html()) > -1) {
					counter++;
				}
			});
		}
		
		if(unit.ava != null && unit.ava > 0 && unit.ava < counter) {
			//we've hit the hard limit on army ava, so return false
			return false;
		} else if(
			unit.wildcard
			&& $("#contents")[0].seedUnit.indexOf(unit.name) == -1
			&& unit.wildcardLimit != null
			&& unit.wildcardLimit <= counter
		) {
			//this unit can wildcard, is not in a native fireteam
			//has a limit to how many times it can wildcard into a link
			// and has hit that limit
			return false;
		} else {
			canAddMore = true;
			if(unit.canJoin) {
				//unit has defined can joins
				$.each(unit.canJoin, function(i2, unitCanJoin) {
					if(unitCanJoin.name === teamLeadName) {
						if(
							unitCanJoin.fireteam == null
							|| unitCanJoin.fireteam.length == 0
							|| unitCanJoin.fireteam.indexOf($("#contents")[0].fireteam) > -1
						) {
							if(unitCanJoin.ava < counter) {
								canAddMore = false;
								return false;
							}
						}
					}
				});
			}
		}
	}
	return canAddMore;
};

getUnitJSON = function(unitName) {
	var unitList = getUnitListJSON();
	var targetUnit = null;
	$.each(unitList, function(i1, unit) {
		if(unit.name === unitName) {
			targetUnit = unit;
			return false;
		}
	});
	return targetUnit;
};

toggleDarkMode = function(elem) {
	if($('body').hasClass('dark')) {
		$('#dmc').prop('checked', false);
		$('body').removeClass('dark');
	} else {
		$('#dmc').prop('checked', true);
		$('body').addClass('dark');
	}
};