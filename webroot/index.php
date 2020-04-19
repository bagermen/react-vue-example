<?php
require __DIR__ . '/../application/config/config.php';
require __DIR__ . '/../application/config/routes.php';
require __DIR__ . '/../application/helpers/loader.php';

$_loaded_objects = array();
require __DIR__ . '/../application/config/autoload.php';


// Minimal MVC framework ------------------------------------------------------

define( 'WEBROOT_BASE', str_replace( 'index.php', '', $_SERVER['SCRIPT_NAME'] ));


$uri = ( isset($_GET['uri']) ) ? $_GET['uri'] : '';
if ( count($route) )
{
    // URI resolution
    foreach( $route as $source_pattern => $dst_pattern )
    {
        preg_match( '#'.$source_pattern.'#', $uri, $matches );
        if ( count($matches) )
        {
            $matches = array_slice( $matches, 1 );
            $uri     = $dst_pattern;
            $count   = 1;

            foreach ( $matches as $value )
            {
                $uri = str_replace( '$'. $count, $value, $uri );
                $count ++;
            }
            break;
        }
    }
}

// Grouped params check
preg_match_all( '#\[(.*?)\]#', $uri, $matches );
if ( count($matches[0]) )
{
    foreach( $matches[0] as $index => $param )
        $uri = str_replace( $param, 'PARAM'. $index, $uri );
}

$uri_segments = array();
if ( !empty( $uri ) )
    $uri_segments = explode( '/', $uri );
if ( count( $uri_segments ) == 0 )
{
    if ( !defined( 'DEFAULT_CONTROLLER' ) || DEFAULT_CONTROLLER == '' )
        return_404();
    else
        $uri_segments[] = DEFAULT_CONTROLLER;
}

if ( count($matches[0]) )
{
    // Grouped params resolution
    foreach( $uri_segments as $pos => $segment )
    {
        if ( substr($segment, 0, 5) == 'PARAM' )
        {
            sscanf( $segment, 'PARAM%d', $index );
            $uri_segments[$pos] = $matches[1][$index];
        }
    }
}

$controller_classname = $uri_segments[0];
$controller_filename  = __DIR__ . '/../application/controllers/'. $controller_classname .'.php';
if ( !is_file( $controller_filename ) )
    return_404();

if ( isset($uri_segments[1]) && !empty($uri_segments[1]) )
{
    $method_name = $uri_segments[1];
    $parameters  = array_slice( $uri_segments, 2 );
}
else
{
    $method_name = 'index';
    $parameters  = array();
}


define( 'REQUESTED_CONTROLLER', $controller_classname );
define( 'REQUESTED_METHOD'    , $method_name );

require_once $controller_filename;
$controller = new $controller_classname();
$callback = array( $controller, $method_name );
if ( !is_callable( $callback ) )
    return_404();

$_loaded_objects['controller'] = $controller;

call_user_func_array( $callback, $parameters );

