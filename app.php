<?php

require 'Slim/Slim.php';
require 'TwigView.php';
require 'rb.php';
require 'models.php';
require 'serializer.php';
//require 'Config.class.php';
require 'TDT.class.php';
require 'caching/Cache.class.php';
//require 'SlimConfig.class.php';
require 'config.php';

$app = new Slim($appConfigDevelopment);
$app->setName('TheDataTank');

$app->configureMode('production', function() use ($app, $appConfigProduction) {
    $app->config($appConfigProduction);
});

$app->configureMode('development', function() use ($app, $appConfigDevelopment) {
    $app->config($appConfigDevelopment);
});

R::setup($app->config('database.dsn'),
         $app->config('database.user'),
         $app->config('database.password')
);

$app->get('/ui-config.js', function() use ($app) {
    print('var TDT_URL = "' . $app->config('tdt-url') . '";;');
    $app->response()->header('Content-Type', 'application/javascript');
});

$app->get('/', function() use ($app) {
    $app->render('index.html',
        array('static' => $app->config('static'), 'subdir' => $app->config('subdir')));
});

$app->get('/docs', function() use ($app) {
    $url = $app->config('hostname') . $app->config('subdir') . '/' . "TDTInfo/Resources.json";
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
        array('static' => $app->config('static'), 'subdir' => $app->config('subdir'),
              'modules' => $modules));
});

$app->get('/docs/:module/:resource', function($module, $resource) use ($app) {
    $url = Config::$HOSTNAME . Config::$SUBDIR .
        "TDTInfo/Resources/$module/$resource.json";
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
        array('static' => $app->config('static'), 'subdir' => $app->config('subdir'),
              'module' => $module, 'resource' => $resource, 'url' => $url,
              'parameters' => $parameters, 'doc' => $r->doc));
});

$app->get('/stats', function() use ($app) {
    $app->render('stats.html',
        array('static' => $app->config('static'), 'subdir' => $app->config('subdir')));
});

$app->get('/admin', function() use ($app) {
    $app->render('admin.html',
        array('static' => $app->config('static'), 'subdir' => $app->config('subdir')));
});

require 'api.php';



$app->run();
