<?php
/**
 * This filter will filter the collection returned by the request REST-URL, 
 * if that URL contains the filtering properties filterBy and filterValue.
 *
 * @package The-Datatank/filters
 * @copyright (C) 2011 by iRail vzw/asbl
 * @license AGPLv3
 * @author Pieter Colpaert
 * @author Jan Vansteenlandt
 */

include_once('filters/AFilter.class.php');

class SearchFilter extends AFilter{
    
    public function __construct($params){
	parent::__construct($params);
    }

    private $allowedFilterOps = array("contains","startsWith","present","equals");

    public function filter($result){
	
	// the filterBy can still contain a hierarchy i.e. given a list of doctors ; filterBy Docter/firstname
	$path = explode(";",$this->params["filterBy"]);
	//search for matches
	$matches = array();
	$filterValue = $this->params["filterValue"];
	// check every entry in the collection for a possible match
	foreach($result as $possiblematch){
	
	    // it could be that the filter is again a hierarchy on it's own, specifying a deeper property of an entry
	    // in that collection.
	    $currentfield = $possiblematch;
		    
	    foreach($path as $property){
		if(is_object($currentfield) && isset($currentfield->$property)){
		    $currentfield = $currentfield->$property;
		}elseif(is_array($currentfield) && isset($currentfield[$property])){
		    $currentfield = $currentfield[$property];
		}else{
		    break;//on error, just return what we have so far
		}
	    }
	    // if the field matches the filterValue, add it to the matches array
	    // the type of match is being given by the filterOp parameter, if no filterOp is given in the URL
	    // the default match will be used which is "equals"
	    
	    if(array_key_exists("filterOp",$this->params)){
		if(in_array($this->params["filterOp"],$this->allowedFilterOps)){
		    
		    if($this->params["filterOp"] == "contains" && preg_match("/.*$filterValue.*/",$currentfield)){
			array_push($matches,$possiblematch);
		    }elseif($this->params["filterOp"] == "startsWith" && preg_match("/^$filterValue.*/",$currentfield)){
			array_push($matches,$possiblematch);
		    }elseif($this->params["filterOp"] == "present" && preg_match("/.*/",$currentfield)){
			array_push($matches,$possiblematch);
		    }elseif($this->params["filterOp"] == "equals" && $currentfield == $filterValue){
			array_push($matches,$possiblematch);
		    }
		}else{
		    throw new FilterTDTException("The value ".$this->params["filterOp"]." is not a valid value for the filterOp-parameter");
		}
	    }elseif($currentfield == $this->params["filterValue"]){
		array_push($matches,$possiblematch);
	    }
	}
	if(sizeof($matches)){
	    return $matches;
	}else{
	    throw new FilterTDTException("No matching entries were found.");
	}
    }
}
?>
