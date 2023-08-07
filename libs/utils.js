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

clearUnitSelector = function(memberNum) {
	$('#member' + memberNum + 'Container').hide();
	$('#member' + memberNum + 'Container').html('');
	$('#member' + memberNum + 'Container')[0].selectedUnit = null;
	
	if(memberNum == 1) {
		$("#contents")[0].member1 = null;
	} else if(memberNum == 2) {
		$("#contents")[0].member2 = null;
	} else if(memberNum == 3) {
		$("#contents")[0].member3 = null;
	} else if(memberNum == 4) {
		$("#contents")[0].member4 = null;
	} else if(memberNum == 5) {
		$("#contents")[0].member5 = null;
	}
};

getUnitListJSON = function() {
	var factionJSON = $("#contents")[0].armyJSON;
	if(factionJSON) {
		return factionJSON.units;
	}
	return null;
};

canAddMore = function(unitName) {
	var unit = getUnitJSON(unitName);
	if(unit) {		
		var counter = 0;
		if($("#contents")[0].member1 && $("#contents")[0].member1.name === unitName) {
			counter++;
		}
		if($("#contents")[0].member2 && $("#contents")[0].member2.name === unitName) {
			counter++;
		}
		if($("#contents")[0].member3 && $("#contents")[0].member3.name === unitName) {
			counter++;
		}
		if($("#contents")[0].member4 && $("#contents")[0].member4.name === unitName) {
			counter++;
		}
		if($("#contents")[0].member5 && $("#contents")[0].member5.name === unitName) {
			counter++;
		}
		if(unit.shareAVA != null && unit.shareAVA.length > 0) {
			if($("#contents")[0].member1 && unit.shareAVA.indexOf($("#contents")[0].member1.name) > -1) {
				counter++;
			}
			if($("#contents")[0].member2 && unit.shareAVA.indexOf($("#contents")[0].member2.name) > -1) {
				counter++;
			}
			if($("#contents")[0].member3 && unit.shareAVA.indexOf($("#contents")[0].member3.name) > -1) {
				counter++;
			}
			if($("#contents")[0].member4 && unit.shareAVA.indexOf($("#contents")[0].member4.name) > -1) {
				counter++;
			}
			if($("#contents")[0].member5 && unit.shareAVA.indexOf($("#contents")[0].member5.name) > -1) {
				counter++;
			}
		}
		
		if(unit.ava != null && unit.ava > 0 && unit.ava <= counter) {
			//we've hit the hard limit on army ava, so return false
			return false;
		}
		var hitFireteamMax = false;
		var checkWildcard = true;
		$.each(unit.fireteam, function(i, fireteam) {
			if(fireteam.name === $("#contents")[0].fireteamLabel) {
				checkWildcard = false;
				if(fireteam.max <= counter) {
					hitFireteamMax = true;
				}
				return false;
			}
		});
		if(hitFireteamMax) {
			return false;
		}
		if(
			checkWildcard
			&& validWildcard($("#contents")[0].fireteamData, unit)
			&& unit.wildcardMax != null
			&& unit.wildcardMax <= counter
		) {
			//this unit can wildcard
			//has a limit to how many times it can wildcard into a link
			//and has hit that limit
			return false;
		}
		//at this point we haven't hit unit AVA, fireteam max, or wildcard max, so we can add more of this unit
		return true;
	}
	return false;
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

checkCompositionBonus = function() {
	var keywords = [];
	if($("#contents")[0].member1 != null) {
		keywords = getUnitKeywords($("#contents")[0].member1.name);
		if($("#contents")[0].member2 != null) {
			var compArr = getUnitKeywords($("#contents")[0].member2.name);
			keywords = keywords.filter(function(el) {
				return compArr.includes(el);
			});
		}
		if($("#contents")[0].member3 != null) {
			var compArr = getUnitKeywords($("#contents")[0].member3.name);
			keywords = keywords.filter(function(el) {
				return compArr.includes(el);
			});
		}
		if($("#contents")[0].member4 != null) {
			var compArr = getUnitKeywords($("#contents")[0].member4.name);
			keywords = keywords.filter(function(el) {
				return compArr.includes(el);
			});
		}
		if($("#contents")[0].member5 != null) {
			var compArr = getUnitKeywords($("#contents")[0].member5.name);
			keywords = keywords.filter(function(el) {
				return compArr.includes(el);
			});
		}
	}
	return (keywords.length > 0);
};

getUnitKeywords = function(unitName) {
	var keywordList = [];
	var unit = getUnitJSON(unitName);
	if(unit != null) {
		keywordList.push(unit.name);
		if(unit.keywords != null && unit.keywords.length > 0) {
			$.each(unit.keywords, function(i, keyword) {
				keywordList.push(keyword);
			});
		}
		if($("#contents")[0].fireteamLabel != null) {
			$.each(unit.fireteam, function(i1, fireteam) {
				if(fireteam.name === $("#contents")[0].fireteamLabel) {
					if(fireteam.keywords != null && fireteam.keywords.length > 0) {
						$.each(fireteam.keywords, function(i, keyword) {
							keywordList.push(keyword);
						});
					}
					return false;
				}
			});
		}
	}
	return keywordList;
};

buildBonusTable = function() {
	var bonusesTable = $('<table>');
	bonusesTable.attr("id","ftBonusTable");
	var headerRow = $('<tr>');
	headerRow.append('<td></td><td><b>2 Members</b></td><td><b>3 Members</b></td><td><b>4 Members</b></td><td><b>5 Members</b></td>');
	bonusesTable.append(headerRow);
	var sizeRow = $('<tr id="sizeRow">');
	sizeRow.append('<td><b>Size Bonus</b></td><td>Activate Entire Ft with 1 order</td><td>All get +1B BS Attack</td><td>All get Sixth Sense</td><td>All get +1BS</td>');
	bonusesTable.append(sizeRow);
	var compRow = $('<tr id="compRow">');
	compRow.append('<td><b>Comp Bonus</b></td><td></td><td>All get +3 Discover</td><td>All get +1BS</td><td>All get +1BS</td>');
	bonusesTable.append(compRow);
	return bonusesTable;
};

showHideElem = function(elem, check) {
	if(check) {
		elem.show();
	} else {
		elem.hide();
	}
};

validWildcard = function(fireteam, unit) {
	if (fireteam.reinforcement) {
		return unit.reinforcementWildcard;
	} else {
		return unit.wildcard;
	}
};