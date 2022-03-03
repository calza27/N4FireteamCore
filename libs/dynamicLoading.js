startOver = function() {
	$('#contents')[0].faction = null;
	$("#contents")[0].army = null;
	$('#contents')[0].armyJSON = null;
	$("#contents")[0].fireteam = null;
	$("#contents")[0].seedUnit = null;
	loadPage("views/homepage.html", "#contents");
}

loadFaction = function(factionStr, elem) {
	$('.factionButton.highlighted').removeClass('highlighted');
	$(elem).addClass('highlighted');
	
	$('#contents')[0].faction = factionStr;
	$("#contents")[0].army = null;
	$("#contents")[0].armyJSON = null;
	$("#contents")[0].fireteam = null;
	$("#contents")[0].seedUnit = null;
	
	if(factionStr) {
		$('#armyContainer').removeClass('empty');
		var factionListFile = "data/factions.json";
		$.getJSON(factionListFile, function(data) {
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
		}).fail(function(){
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
	$("#contents")[0].fireteam = null;
	$("#contents")[0].seedUnit = null;
	
	if(army) {
		var armyJSONFile = "data/factions/" + army + ".json";
		$.getJSON(armyJSONFile, function(armyJSON){
			$("#contents")[0].armyJSON = armyJSON;
			loadPage("views/builder.html", "#contents");
		}).fail(function() {
			alert("An error has occurred reading " + army + " data.");
		});
	}
};

getFireteamTypes = function() {
	var armyJSON = $("#contents")[0].armyJSON;
	return armyJSON.fireteams;
};

changeFireteam = function(fireteamType, elem) {
	$('.fireteamButton.highlighted').removeClass('highlighted');
	$(elem).addClass('highlighted');
	$("#contents")[0].fireteam = fireteamType;
	$("#contents")[0].seedUnit = null;
	$("#noteBox").html('');
	
	var factionListFile = "data/fireteams.json";
	$.getJSON(factionListFile, function(data) {
		$.each(data.fireteams, function(i1, ftData) {
			if(ftData.name == fireteamType) {
				var fireteamImg = "<div class=\"fireteamImg img\" style=\"background-image: url(data/img/" + ftData.imgSrc + ");\"></div>";
				var fireteamLabel = "<div class=\"fireteamLabel label\">" + ftData.name + "</div>";
				var fireteamButton = "<div class=\"fireteamButton button\">";
				fireteamButton += fireteamImg;
				fireteamButton += fireteamLabel;
				fireteamButton += "</div>";
				$('#fireteamBuilt').html(fireteamButton);
				return false;
			}
		});
	}).fail(function(){
		alert("An error has occurred building fireteam data.");
	});
	
	populateAvailableUnits('#member1Container');
	clearUnitSelector('#member1Built');
};

changeFireteamMember = function(selectedMember, elem) {
	var memberNumber = parseInt($(elem).closest('.builderContainer').attr('data-attr-memberNum'));
	
	$('#member' + memberNumber + 'Container .unitButton.highlighted').removeClass('highlighted');
	$(elem).addClass('highlighted');
	
	var newMemberNumber = memberNumber + 1;
	if(memberNumber < 5) {
		clearUnitSelector('#member5Container');
		clearUnitSelector('#member5Built');
	}
	if(memberNumber < 4) {
		clearUnitSelector('#member4Container');
		clearUnitSelector('#member4Built');
	}
	if(memberNumber < 3) {
		clearUnitSelector('#member3Container');
		clearUnitSelector('#member3Built');
	}
	if(memberNumber < 2) {
		clearUnitSelector('#member2Container');
		clearUnitSelector('#member2Built');
	}
	var unit = getUnitJSON(selectedMember);
	$(elem).closest('.builderContainer')[0].selectedUnit = selectedMember;
	populateBuiltUnit(unit, memberNumber);
	
	if(memberNumber === 1) {
		$("#contents")[0].seedUnit = calculateInitialSeedUnits(selectedMember);
		if(unit != null && unit.notes != null && unit.notes.length > 0) {
			var noteElements = "";
			$.each(unit.notes, function(i, unitNote) {
				if(
					unitNote.fireteam == null
					|| unitNote.fireteam.length == 0
					|| unitNote.fireteam.indexOf($("#contents")[0].fireteam) > -1
				) {
					var note = unitNote.note;
					var newElem = "<div class=\"note\">";
					newElem += note;
					newElem += "</div>";
					noteElements += newElem + "\n";
				}
			});
			$("#noteBox").html(noteElements);
		} else {
			$("#noteBox").html('');
		}
		
	} else {
		/*$("#contents")[0].seedUnit = clarifySeedUnits(selectedMember);
		if($("#contents")[0].seedUnit == null || $("#contents")[0].seedUnit.length == 0) {*/
			if($("#member1Container")[0].selectedUnit) {
				$("#contents")[0].seedUnit = calculateInitialSeedUnits($("#member1Container")[0].selectedUnit);
			}
			if($("#member2Container")[0].selectedUnit && memberNumber > 1) {
				$("#contents")[0].seedUnit = clarifySeedUnits($("#member2Container")[0].selectedUnit);
			}
			if($("#member3Container")[0].selectedUnit && memberNumber > 2) {
				$("#contents")[0].seedUnit = clarifySeedUnits($("#member3Container")[0].selectedUnit);
			}
			if($("#member4Container")[0].selectedUnit && memberNumber > 3) {
				$("#contents")[0].seedUnit = clarifySeedUnits($("#member4Container")[0].selectedUnit);
			}
			if($("#member5Container")[0].selectedUnit && memberNumber > 4) {
				$("#contents")[0].seedUnit = clarifySeedUnits($("#member5Container")[0].selectedUnit);
			}
		//}
	}
	
	if(//the following tests to see if we've added the last possible member of the fireteam, if we haven't we can show a new dropdown and proceed
		!(
			memberNumber >= 5
			|| (
				memberNumber >= 4
				&& $("#contents")[0].fireteam === "enomotarchos"
			) || (
				memberNumber >= 3
				&& (
					$("#contents")[0].fireteam === "haris"
					|| $("#contents")[0].fireteam === "triad"
					|| $("#contents")[0].fireteam === "special triad"
				)
			) || (
				memberNumber >= 2
				&& $("#contents")[0].fireteam === "duo"
			)
		)
	) {
		if(selectedMember != null && selectedMember.length > 0) {
			populateAvailableUnits("#member" + newMemberNumber + "Container");
		}
	}
};

populateAvailableUnits = function(selector) {
	var memberNumber = parseInt(selector.replace(/\D/g,''));
	var unitList = getUnitListJSON();
	if($("#contents")[0].seedUnit != null && $("#contents")[0].seedUnit.length > 0) {
		var validUnits = [];
		//find the units that can form or join the given fireteam
		$.each(unitList, function(i1, unit) {
			if(unit.display !== false) {
				if(canJoinSeed(unit.name)) {
					if(canAddMore(unit.name)) {
						validUnits.push(unit);
					}
				}
			}
		});
		
		var optionList = "<div class=\"sectionHeader\"><b><span class=\"hidden--xs\">Member</span> " + memberNumber + "</b></div>";
		$.each(validUnits, function(i, val) {
			var unitImg = "<div class=\"unitImg img\" style=\"background-image: url(" + val.imgSrc + ");\"></div>";
			var unitLabel = "<div class=\"unitLabel label\">" + val.name + "</div>";
			
			var unitButton = "<div class=\"unitButton button\" onclick=\"changeFireteamMember(`" + val.name + "`, this);\">";
			unitButton += unitImg;
			unitButton += unitLabel;
			unitButton += "</div>";
	
			optionList += unitButton;
		});
		
		$(selector).html(optionList);
		$(selector).show();
	} else {
		clearUnitSelector('#member2Container');
		clearUnitSelector('#member3Container');
		clearUnitSelector('#member4Container');
		clearUnitSelector('#member5Container');
		clearUnitSelector('#member2Built');
		clearUnitSelector('#member3Built');
		clearUnitSelector('#member4Built');
		clearUnitSelector('#member5Built');
		
		var optionList = optionList = "<div class=\"sectionHeader\"><b><span class=\"hidden--xs\">Member</span> " + memberNumber + "</b></div>";
		var validUnitNames = [];
		//find the units that can form the given fireteam
		$.each(unitList, function(i1, unit) {
			if(unit.fireteam != null && unit.fireteam.indexOf($("#contents")[0].fireteam) != -1) {
				//unit can start the given fireteam, so add them to the list
				validUnitNames.push(unit.name);
			}
		});
		
		$.each(unitList, function(i1, unit) {
			$.each(unit.countsAs, function(i2, unitCountsAs) {
				if(validUnitNames.indexOf(unitCountsAs) != -1) {
					//this unit counts as something that can form the team we're creating
					if(
						($("#contents")[0].fireteam !== 'haris' || (unit.fireteam != null && unit.fireteam.indexOf('haris') != -1))
						&& ($("#contents")[0].fireteam !== 'duo' || (unit.fireteam != null && unit.fireteam.indexOf('duo') != -1))
					) {
						//if we're not forming a haris or a duo, then the counts as lets this unit form the team
							//otherwise, the unit in question must have the fireteam haris/duo skill in order to form the team
						validUnitNames.push(unit.name);
						return false;
					}
				}
			});
		});

		//pushing the names to then fetch the objects, rather than just pushing the objects, maintains the object order, regardless of whetehr the unit has the fireteam skill, or is a 'counts as'
		var validUnits = [];
		$.each(unitList, function(i1, unit) {
			if(unit.display !== false) {
				if(validUnitNames.indexOf(unit.name) != -1) {
					validUnits.push(unit);
				}
			}
		});
		
		$.each(validUnits, function(i, val) {
			var unitImg = "<div class=\"unitImg img\" style=\"background-image: url(" + val.imgSrc + ");\"></div>";
			var unitLabel = "<div class=\"unitLabel label\">" + val.name + "</div>";
			
			var unitButton = "<div class=\"unitButton button\" onclick=\"changeFireteamMember(`" + val.name + "`, this);\">";
			unitButton += unitImg;
			unitButton += unitLabel;
			unitButton += "</div>";
	
			optionList += unitButton;
		});
		$('#member1Container').html(optionList);
		$('#member1Container').show();
	}
};

calculateInitialSeedUnits = function(unitName) {
	var seedUnitList = [];
	var unit = getUnitJSON(unitName);
	if(unit) {
		if(unit.fireteam != null && unit.fireteam.length > 0) {
			//the selected unit can only act as a seed if it itself can form a fireteam
			$.each(unit.fireteam, function(i2, unitFireteam) {
				if(unitFireteam == $("#contents")[0].fireteam) {
					if(seedUnitList.indexOf(unitName) == -1) {
						seedUnitList.push(unitName);
						return false;
					}
				}
			});
		}
		if(unit.countsAs != null && unit.countsAs.length > 0) {
			$.each(unit.countsAs, function(i2, unitCountsAs) {
				if(seedUnitList.indexOf(unitCountsAs) == -1) {
					seedUnitList.push(unitCountsAs);
				}
			});
		}
		if(unit.canJoin != null && unit.canJoin.length > 0) {
			$.each(unit.canJoin, function(i2, canJoinObj) {
				if(canJoinObj.fireteam.indexOf($("#contents")[0].fireteam) > -1) {
					if(seedUnitList.indexOf(canJoinObj.name) == -1) {
						seedUnitList.push(canJoinObj.name);
					}
				}
			});
		}
	}
	return seedUnitList;
};

clarifySeedUnits = function(unitName) {
	if($("#contents")[0].fireteam === 'triad') {
		//triads are weird, don't bother clarifying the seed list
		return $("#contents")[0].seedUnit;
	} else {
		var finalList = [];
		var newSeedUnitList = [];
		var seedUnitList = $("#contents")[0].seedUnit;
		var unit = getUnitJSON(unitName);
		if(unit) {
			//found the data for the selected unit
			//make an array of the fireteams it can join
			//then return an array of values that exist in that array, and in the seedUnitList array
			if(unit.wildcard) {
				newSeedUnitList = seedUnitList;
				if(unit.cantJoin != null && unit.cantJoin.length > 0) {
					//cant join certain fireteams, so we're going to remove the fireteams listed in the cant join array from the seedUnit List
					$.each(unit.cantJoin, function(i2, unitCantJoin) {
						if(unitCantJoin.fireteam != null && unitCantJoin.fireteam.length > 0) {
							var index = newSeedUnitList.indexOf(unitCantJoin.name);
							if(index > -1) {
								$.each(unitCantJoin.fireteam, function(i3, unitCantJoinFireteam) {
									if(unitCantJoinFireteam === $("#contents")[0].fireteam) {
										//only remove if they can't join the current version of the fireteam
										newSeedUnitList.splice(index, 1);
										return false;
									}
								});
							}
						} else {
							var index = newSeedUnitList.indexOf(unitCantJoin.name);
							if(index > -1) {
								newSeedUnitList.splice(index, 1);
							}
						}
					});
					finalList = newSeedUnitList;
				} else {
					//this is an unrestricted wildcard, so return the current list
					return newSeedUnitList;
				}
			} else {
				if(unit.fireteam != null && unit.fireteam.length > 0) {
					if(
						unit.fireteam.indexOf($("#contents")[0].fireteam) > -1
						&& seedUnitList.indexOf(unit.name) > -1
					) {
						//this unit can form the current fireteam, and is the current list of seeds, so add it to the new list of seeds
						if(seedUnitList.indexOf(unit.name) != -1) {
							newSeedUnitList.push(unit.name);
						}
					}
				}
				if(unit.canJoin != null && unit.canJoin.length > 0) {
					$.each(unit.canJoin, function(i2, unitCanJoin) {
						if(seedUnitList.indexOf(unitCanJoin.name) > -1) {
							//this unit can join the current fireteam of one or more of the units that is in the current list of seeds, so add this units to the new list of seeds
							if(canJoinUnitList(unit.name, [unitCanJoin.name])) {
								if(validMemeberCount(unit.name, unitCanJoin.name)) {
									newSeedUnitList.push(unitCanJoin.name);
								}
							}
						}
					});
				}
				if(unit.countsAs != null && unit.countsAs.length > 0) {
					$.each(unit.countsAs, function(i2, unitCountsAs) {
						var countsAsSeeds = clarifySeedUnits(unitCountsAs);
						if(countsAsSeeds != null && countsAsSeeds.length > 0) {
							$.each(countsAsSeeds, function(i3, countsAsSeed) {
								if(seedUnitList.indexOf(countsAsSeed) > -1) {
									if(newSeedUnitList.indexOf(countsAsSeed) == -1) {
										newSeedUnitList.push(countsAsSeed);
									}
								}
							});
						}
					});
				}
				
				
				$.each(newSeedUnitList, function(i2, seedUnit) {
					var addToList = true;
					var seedUnitData = getUnitJSON(seedUnit);
					if(seedUnitData) {
						if(seedUnitData.cantJoin != null && seedUnitData.cantJoin.length > 0) {
							$.each(seedUnitData.cantJoin, function(i2, seedCantJoin) {
								if(seedCantJoin.name === unitName) {
									addToList = false;
									return false;
								}
							});
						} 
					}
					if(addToList) {
						finalList.push(seedUnit);
					}
				});
			}
		}
		return finalList;
	}
};

canJoinSeed = function(unitName) {
	var seedUnitList = $("#contents")[0].seedUnit;
	return canJoinUnitList(unitName, seedUnitList);
}

canJoinUnitList = function(unitName, unitList) {
	var canJoin = false;
	var unit = getUnitJSON(unitName);
	if(unit && unit.display !== false) {
		if(
			$("#contents")[0].fireteam === "triad"
			&& unit.fireteam != null
			&& unit.fireteam.length > 0
			&& unit.fireteam.indexOf("triad") > -1
		) {
			//we're building a fireteam traid, and this unit can join triads
			return true;
		}
		if(unitList.indexOf(unit.name) > -1) {
			//this unit is directly referenced in the list of seed units, so we can add it
			canJoin = true;
		}
		if(!canJoin) {
			if(unit.canJoin != null && unit.canJoin.length > 0) {
				$.each(unit.canJoin, function(i2, unitCanJoin) {
					if(
						unitList.indexOf(unitCanJoin.name) > -1
						&& (
							unitCanJoin.fireteam == null
							|| unitCanJoin.fireteam.length == 0
							|| unitCanJoin.fireteam.indexOf($("#contents")[0].fireteam) > -1
						)
					) {
						//this unit can join a unit directly referenced in the list of seed units, so we can add it
						canJoin = true;
						return false;
					}
				});
			}
		}
		if(!canJoin) {
			if(unit.countsAs != null && unit.countsAs.length > 0) {
				$.each(unit.countsAs, function(i2, unitCountsAs) {
					if(canJoinUnitList(unitCountsAs, unitList)) {
						//this unit counts as a unit that can join the fireteam
						canJoin = true;
						return false;
					}
				});
			}
		}
		if(!canJoin) {
			if(unit.wildcard) {
				if(unit.wildcardFireTeams != null && unit.wildcardFireTeams.length > 0) {
					if(unit.wildcardFireTeams.indexOf($("#contents")[0].fireteam) > -1) {
						canJoin = true;
					}
				} else {
					canJoin = true;
				}
			}
		}
		$.each(unit.cantJoin, function(i2, unitCantJoin) {
			if(unitList.indexOf(unitCantJoin.name) > -1) {
				if(
					unitCantJoin.fireteam == null
					|| unitCantJoin.fireteam.length == 0
					|| unitCantJoin.fireteam.indexOf($("#contents")[0].fireteam) > -1
				) {
					canJoin = false;
				}
			}
		});
	}
	return canJoin;
};

populateBuiltUnit = function(unit, memberNumber) {
	//populates the unit into the builtFireteam Area
	var unitImg = "<div class=\"unitImg img\" style=\"background-image: url(" + unit.imgSrc + ");\"></div>";
	var unitLabel = "<div class=\"unitLabel label\">" + unit.name + "</div>";
	var unitButton = "<div class=\"unitButton button\">";
	unitButton += unitImg;
	unitButton += unitLabel;
	unitButton += "</div>";
	$('#member' + memberNumber + 'Built').show();
	$('#member' + memberNumber + 'Built').html(unitButton);
};

