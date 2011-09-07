<?php
  /**
   * This class represents the stats page
   *
   * @package The-Datatank/pages
   * @copyright (C) 2011 by iRail vzw/asbl
   * @license AGPLv3
   * @author Jan Vansteenlandt
   */

class Stats {
    function GET() {

	$data = array();
	$time = array();

/*********************************** Start output *************************************/

	include_once ("templates/TheDataTank/header.php");
	?>
	    

		 <h1 id="title">Stats</h1>
		 <br>
		 <div id="placeholder" style="width:510px;height:300px;">
		 </div>
		 <p>
		 <label>Module</label>
		 <select id="module">
		 <option>Select a module</option>
		 <?php
		 $mods = json_decode(TDT::HttpRequest(Config::$HOSTNAME . Config::$SUBDIR. "TDTInfo/Modules/?format=json")->data);
	$modules = get_object_vars($mods);
	foreach($modules as $name => $mod){
	    echo "<option>".$name."</option>";
	}
	echo "</select>";
	echo '<script language="javascript"> '. " modmeths = new Array();\n";
	foreach ($modules as $name => $mod){
	    echo "modmeths['".$name."'] = new Array();";
	    $resources = get_object_vars($mod);
	    foreach($resources as $nameresource => $resource){    
		    echo "modmeths['".$name."'].push('".$nameresource."');";
	    }
	}
	echo "</script>";
	?>
	    <label>Resource</label>
		<select id="method">
		 <option>Select a module first</option>
	</select>
		</p>
		      <p>
		      <input id="submit" type="button" value="Fetch results">
		      </p>
		      <script language="javascript">

	    </script>
		  <?php
		  include_once ("templates/TheDataTank/footer.php");


    }

}
?>

