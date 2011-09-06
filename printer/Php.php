<?php
/**
   * This file contains the php printer.
   * @package The-Datatank/printer
   * @copyright (C) 2011 by iRail vzw/asbl
   * @license AGPLv3
   * @author Jan Vansteenlandt <jan@iRail.be>
   * @author Pieter Colpaert   <pieter@iRail.be>
   */
include_once("printer/Printer.php");

/**
 * This class inherits from the abstract Printer. It will return our object in a php datastrucutre.
 */
class Php extends Printer{
     
     public function __construct($rootname,$objectToPrint){
	  parent::__construct($rootname,$objectToPrint);
     }

     public function printHeader(){
	  header("Access-Control-Allow-Origin: *");
	  header("Content-Type: text/plain;charset=UTF-8"); 
     }

     public function printBody(){
	  if(is_object($this->objectToPrint)){
	       $hash = get_object_vars($this->objectToPrint);
	  }
	  $hash['version'] = $this->version;
	  $hash['timestamp'] = time();
	  echo serialize($hash);
     }
};
?>