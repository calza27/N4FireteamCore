clearPageAttrs = function() {
	$('#contents')[0].faction = null;
	$("#contents")[0].army = null;
	$('#contents')[0].armyJSON = null;
	$("#contents")[0].fireteamLabel = null;
	$("#contents")[0].fireteam = null;
	$("#contents")[0].fireteamData = null;
	
	$("#contents")[0].member1 = null;
	$("#contents")[0].member2 = null;
	$("#contents")[0].member3 = null;
	$("#contents")[0].member4 = null;
	$("#contents")[0].member5 = null;
};

startOver = function() {
	clearPageAttrs();
	loadPage("views/homepage.html", "#contents");
}

loadFaction = function(factionStr, elem) {
	$('.factionButton.highlighted').removeClass('highlighted');
	$(elem).addClass('highlighted');
	
	clearPageAttrs();
	$('#contents')[0].faction = factionStr;
	
	if(factionStr) {
		$('#armyContainer').removeClass('empty');
		getFactionList().then(function(data) {
			var dataFound = false;
			$.each(data.factions, function(i1, faction) {
				if(faction.name === factionStr) {
					dataFound = true;
					var optionList = "";
					$.each(faction.armies, function(i2, army) {
						var armyImg = "<div class=\"armyImg img\" style=\"background-image: url(" + army.imgSrc + ");\"></div>";
						var armyLabel = "<div class=\"armyLabel label\"><b>" + army.label + "</b></div>";
					
						var armyButton = "<div class=\"armyButton button\" onclick=\"loadArmy('" + army.name + "', this);\">";
						armyButton += armyImg;
						armyButton += armyLabel;
						armyButton += "</div>";
				
						optionList += armyButton;
					});
					$("#armyContainer").html(optionList);
				}
			});
			
			if(!dataFound) {
				alert("An error has occurred reading " + factionStr + " data.");
			}
		}).catch(function(){
			alert("An error has occurred reading " + factionStr + " data.");
		});
	} else {
		$('#armyContainer').html('');
		$('#armyContainer').addClass('empty');
	}
};

loadArmy = function(army, elem) {
	$('.armyButton.highlighted').removeClass('highlighted');
	$(elem).addClass('highlighted');
	$("#contents")[0].army = army;
	$("#contents")[0].fireteamLabel = null;
	$("#contents")[0].fireteam = null;
	$("#contents")[0].fireteamData = null;
	
	$("#contents")[0].member1 = null;
	$("#contents")[0].member2 = null;
	$("#contents")[0].member3 = null;
	$("#contents")[0].member4 = null;
	$("#contents")[0].member5 = null;
	if(army) {
		getArmyData(army).then(function(armyJSON) {
			$("#contents")[0].armyJSON = armyJSON;
			loadPage("views/builder.html", "#contents");
		}).catch(function() {
			alert("An error has occurred reading " + army + " data.");
		});
	}
};

getFireteamTypes = function() {
	var armyJSON = $("#contents")[0].armyJSON;
	return armyJSON.fireteams;
};

changeFireteam = function(fireteamLabel, fireteamType, elem) {
	$('.fireteamButton.highlighted').removeClass('highlighted');
	$(elem).addClass('highlighted');
	$("#contents")[0].fireteamLabel = fireteamLabel;
	$("#contents")[0].fireteam = fireteamType;
	$("#contents")[0].member1 = null;
	$("#contents")[0].member2 = null;
	$("#contents")[0].member3 = null;
	$("#contents")[0].member4 = null;
	$("#contents")[0].member5 = null;
	$("#noteBox").html('');
	
	if(fireteamLabel) {
		var fireteamData = null;
		var armyJSON = $("#contents")[0].armyJSON;
		if(armyJSON) {
			$.each(armyJSON.fireteams, function(i1, fireteam) {
				if(fireteam.name === fireteamLabel) {
					fireteamData = fireteam;
					return false;
				}
			});
			if(fireteamData) {
				$("#contents")[0].fireteamData = fireteamData;
				getFireteamsList().then(function(data) {
					$.each(data.fireteams, function(i1, ftData) {
						if(ftData.name == fireteamType) {
							var ftLbl = "<div class=\"fireteamLabel label\">" + fireteamLabel;
							if(fireteamData.note) {
								ftLbl += "<span class=\"ftTooltip\" data-text=\"" + fireteamData.note + "\">i</span>";
							}
							ftLbl += "</div>";
							var ftImg = "<div class=\"fireteamImg img\" style=\"background-image: url(data/img/" + ftData.imgSrc + ");\"></div>";
							var ftTypeLbl = "<div class=\"fireteamLabel label\">" + ftData.name + "</div>";
							var ftBtn = "<div class=\"fireteamButton button\" onclick=\"changeFireteam(null, null, this);\">";
							ftBtn += ftLbl;
							ftBtn += ftImg;
							ftBtn += ftTypeLbl;
							ftBtn += "</div>";
							$('#fireteamContainer').attr('data-build', 'true');
							$('#fireteamContainer').html(ftBtn);
							$("#fireteamContainer").append(buildBonusTable());
							return false;
						}
					});
				}).catch(function(){
					alert("An error has occurred building fireteam data.");
				});
				var requiredUnits = populateRequiredUnits();
				var populateContainer = requiredUnits + 1;
				populateAvailableUnits(populateContainer);
			}
		}
	} else {
		loadArmy($("#contents")[0].army, null);
	}
};

populateRequiredUnits = function() {
	var unitList = getUnitListJSON();
	var currUnit = 0;
	$.each(unitList, function(i, unit) {
		$.each(unit.fireteam, function(i, fireteam) {
			if(fireteam.name === $("#contents")[0].fireteamLabel) {
				if(fireteam.min && fireteam.min > 0) {
					for(cnt = 0; cnt < fireteam.min; cnt++) {
						++currUnit;
						changeFireteamMember(unit.name, currUnit, true);
					}
				}
			}
		});
	});
	return currUnit;
};

changeFireteamMember = function(selectedMember, memberNum, mandatory) {
	var newMemberNumber = -1;
	if(selectedMember) {
		var unit = getUnitJSON(selectedMember);
		if(memberNum == 1) {
			$("#contents")[0].member1 = unit;
		} else if(memberNum == 2) {
			$("#contents")[0].member2 = unit;
		} else if(memberNum == 3) {
			$("#contents")[0].member3 = unit;
		} else if(memberNum == 4) {
			$("#contents")[0].member4 = unit;
		} else if(memberNum == 5) {
			$("#contents")[0].member5 = unit;
		} else {
			return
		}
		var elem = $('.builderContainer[data-attr-memberNum="' + memberNum + '"]');
		
		var optionList = "<div class=\"sectionHeader\"><b><span class=\"hidden--xs\">Member</span> " + memberNum + "</b></div>";
		var unitImg = "<div class=\"unitImg img\" style=\"background-image: url(" + unit.imgSrc + ");\"></div>";
		var unitLabel = "<div class=\"unitLabel label\">" + unit.name + "</div>";
		var btnClassList = "unitButton button highlighted";
		if(mandatory) {
			btnClassList += " mandatory";
		}
		var unitButton = "<div class=\"" + btnClassList + "\"";
		if(!mandatory) {
			unitButton += "onclick=\"changeFireteamMember(null, " + memberNum + ", false);\"";
		}
		unitButton += ">";
		unitButton += unitImg;
		unitButton += unitLabel;
		unitButton += "</div>";
		optionList += unitButton;
		if(unit.checkbox) {
			var checkBox = "<input type=\"checkbox\" name=\"" + unit.checkbox.name + "\" data-run=\"" + unit.checkbox.run + "\"/><label for=\"" + unit.checkbox.name + "\">" + unit.checkbox.name + "</label>";
			optionList += checkBox;
		}
		$(elem).html(optionList);
		$(elem).show();
		
		newMemberNumber = memberNum + 1;
	} else {
		if(memberNum <= 5) {
			clearUnitSelector(5);
		}
		if(memberNum <= 4) {
			clearUnitSelector(4);
		}
		if(memberNum <= 3) {
			clearUnitSelector(3);
		}
		if(memberNum <= 2) {
			clearUnitSelector(2);
		}
		if(memberNum == 1) {
			clearUnitSelector(1);
		}
		newMemberNumber = memberNum;
		memberNum -= 1;
	}
	
	updateFireteamBonusesChart();
	populateAvailableUnits(newMemberNumber);

};

populateAvailableUnits = function(memberNumber) {
	if(//the following tests to see if we've added the last possible member of the fireteam, if we haven't we can populate the options as requested
		!(
			memberNumber > 5
			|| (
				memberNumber > 4
				&& $("#contents")[0].army === "steelPhalanx" //"core" fireteams in Steel Phalanx are limited to 4 members
			) || (
				memberNumber > 3
				&& $("#contents")[0].fireteam === "haris"
			) || (
				memberNumber > 2
				&& $("#contents")[0].fireteam === "duo"
			)
		)
	) {	
		var selector = "#member" + memberNumber + "Container";
		
		var unitList = getUnitListJSON();
		var validUnits = [];
		$.each(unitList, function(i1, unit) {
			var skipWildcard = false;
			$.each(unit.fireteam, function(i1, fireteam) {
				if(fireteam.name === $("#contents")[0].fireteamLabel) {
					if(canAddMore(unit.name)) {
						validUnits.push(unit);
						skipWildcard = true;
					}
				}
			});
			if(!skipWildcard) {
				if(validWildcard($("#contents")[0].fireteamData, unit) && canAddMore(unit.name)) {
					validUnits.push(unit);
				}
			}
		});
		
		if(memberNumber == 1) {
			var requiredUnits = [];
			$.each(unitList, function(i1, unit) {
				$.each(unit.fireteam, function(i1, fireteam) {
					if(fireteam.name === $("#contents")[0].fireteamLabel) {
						if(fireteam.required) {
							requiredUnits.push(unit);
						}
					}
				});
			});
			if(requiredUnits.length > 0) {
				validUnits = requiredUnits;
			}
		}
		
			
		var optionList = "<div class=\"sectionHeader\"><b><span class=\"hidden--xs\">Member</span> " + memberNumber + "</b></div>";
		$.each(validUnits, function(i, val) {
			var unitImg = "<div class=\"unitImg img\" style=\"background-image: url(" + val.imgSrc + ");\"></div>";
			var unitLabel = "<div class=\"unitLabel label\">" + val.name + "</div>";
			
			var unitButton = "<div class=\"unitButton button\" onclick=\"changeFireteamMember(`" + val.name + "`, " + memberNumber + ");\">";
			unitButton += unitImg;
			unitButton += unitLabel;
			unitButton += "</div>";

			optionList += unitButton;
		});
		
		$(selector).html(optionList);
		$(selector).show();
	}
};

updateFireteamBonusesChart = function() {
	var unitCount = 0;
	if($("#contents")[0].member1 != null) {
		unitCount++;
	}
	if($("#contents")[0].member2 != null) {
		unitCount++;
	}
	if($("#contents")[0].member3 != null) {
		unitCount++;
	}
	if($("#contents")[0].member4 != null) {
		unitCount++;
	}
	if($("#contents")[0].member5 != null) {
		unitCount++;
	}
	showHideElem($('#ftBonusTable tr#compRow'), checkCompositionBonus());
	showHideElem($('#ftBonusTable tr:not(:nth-child(1)) td:nth-child(2)'), (unitCount >= 2));
	showHideElem($('#ftBonusTable tr:not(:nth-child(1)) td:nth-child(3)'), (unitCount >= 3));
	showHideElem($('#ftBonusTable tr:not(:nth-child(1)) td:nth-child(4)'), (unitCount >= 4));
	showHideElem($('#ftBonusTable tr:not(:nth-child(1)) td:nth-child(5)'), (unitCount == 5));
	//tricore treats the unit size as 5, but does not grant composition bonuses beyond the actual unit size
	if($('input[type="checkbox"][name="tri-core"]').is(':checked') && unitCount >= 3) {
		showHideElem($('#ftBonusTable tr:nth-child(2) td:nth-child(2)'), true);
		showHideElem($('#ftBonusTable tr:nth-child(2) td:nth-child(3)'), true);
		showHideElem($('#ftBonusTable tr:nth-child(2) td:nth-child(4)'), true);
		showHideElem($('#ftBonusTable tr:nth-child(2) td:nth-child(5)'), true);
	}
};