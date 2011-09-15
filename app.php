<?php

require 'Slim/Slim.php';
require 'TwigView.php';
require 'rb.php';
require 'models.php';
require 'serializer.php';
require 'Config.class.php';
require 'TDT.class.php';
require 'caching/Cache.class.php';

$app = new Slim(array(
    'debug' => true,
    'log.enable' => true,
    'log.path' => '/tmp/',
    'log.level' => 4,
    'templates.path' => '/Users/abe/Sites/The-DataTank-GUI/templates/',
    'view' => 'TwigView',
    'subpath' => '/~abe/The-DataTank-GUI/app.php',
    'static' => '/~abe/The-DataTank-GUI/static',
    'database.dsn' => 'sqlite:/tmp/tdt.db',
    'database.user' => '',
    'database.password' => '',
    'tdt.content-type' => 'json'
));
$app->setName('TheDataTank');

R::setup($app->config('database.dsn'),
         $app->config('database.user'),
         $app->config('database.password')
);

$app->get('/', function() use ($app) {
    $app->render('index.html',
        array('static' => $app->config('static'), 'subpath' => $app->config('subpath')));
});

$app->get('/docs', function() use ($app) {
    $url = Config::$HOSTNAME . Config::$SUBDIR."TDTInfo/Resources.json";
    TDT::HttpRequest($url);
    $docs = json_decode(TDT::HttpRequest($url)->data);
    $modules = array();
    if (is_object($docs)) {
        $ms = get_object_vars($docs);
        foreach($ms as $name => $rs) {
            $resources = array();
            $rsv = get_object_vars($rs);
            foreach($rsv as $rname => $resource) {
                $resources[$rname] = $resource->doc;
            }
            $modules[$name] = $resources;
        }
    }
    $app->render('docs.html',
        array('static' => $app->config('static'), 'subpath' => $app->config('subpath'),
              'modules' => $modules));
});

$app->get('/docs/:module/:resource', function($module, $resource) use ($app) {
    $url = Config::$HOSTNAME . Config::$SUBDIR .
        "TDTInfo/Resources/$module/$resource/?format=json";
    $r = json_decode(TDT::HttpRequest($url)->data);

    //get a sequence of the parameters
	$parameters = array();
	foreach($r->parameters as $var => $doc) {
        $parameters[$var] = $doc;
    }
    $args = '';
    if ($r->requiredparameters > 0) {
        foreach($r->requiredparameters as $var) {
            $args .= "%$var%/";
        }
    }

    // build the proper URL's to invoke when doing a call for a certain resource
    $url = Config::$HOSTNAME . CONFIG::$SUBDIR."$module/$resource/$args";

    $app->render('doc.html',
        array('static' => $app->config('static'), 'subpath' => $app->config('subpath'),
              'module' => $module, 'resource' => $resource, 'url' => $url,
              'parameters' => $parameters, 'doc' => $r->doc));
});

$app->get('/stats', function() use ($app) {
    $app->render('stats.html',
        array('static' => $app->config('static'), 'subpath' => $app->config('subpath')));
});

$app->get('/admin', function() use ($app) {
    $app->render('admin.html',
        array('static' => $app->config('static'), 'subpath' => $app->config('subpath')));
});

require 'api.php';

$app->run();

?>
