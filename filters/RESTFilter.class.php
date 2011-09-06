<?php
/**
 * This class represents the RESTful lookup of our API
 *
 * @package The-Datatank/filters
 * @copyright (C) 2011 by iRail vzw/asbl
 * @license AGPLv3
 * @author Pieter Colpaert
 * @author Jan Vansteenlandt
 */
include_once('filters/AFilter.class.php');

class RESTFilter extends AFilter{

    public function __construct($params){
	parent::__construct($params);
    }

    public function filter($result){
	// we have to store the subresources for logging purposes;
	$subresources = array();
	
	foreach($this->params as $resource){
	    if(is_object($result) && isset($result->$resource)){
		$result = $result->$resource;
	    }elseif(is_array($result) && isset($result[$resource])){
		$result = $result[$resource];
	    }else{
		throw new RESTTDTException("Incorrect REST-parameter: $resource.");
	    }
	    array_push($subresources,$resource);
	}
	
	$resultset = new stdClass();
	$resultset->result = $result;
	$resultset->subresources = $subresources;
	return $resultset;
    }
  }
?>
