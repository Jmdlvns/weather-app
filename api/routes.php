<?php   

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, X-Auth-Token, Origin, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

    require_once "./modules/get.php";


    // Initialize Get and Post objects
    $get = new Get();


    // Check if 'request' parameter is set in the request
    if(isset($_REQUEST['request'])){
         // Split the request into an array based on '/'
        $request = explode('/', $_REQUEST['request']);
    }
    else{
         // If 'request' parameter is not set, return a 404 response
        echo "Not Found";
        http_response_code(404);
    }

    // Handle requests based on HTTP method
    switch($_SERVER['REQUEST_METHOD']){
        // Handle GET requests
        case 'GET':
            switch ($request[0]) {
                case 'weather':
                    if (isset($request[1])) {
                        $city = $request[1];
                    } else {
                        $city = $defaultCity;
                    }
                    $days = isset($_GET['days']) ? intval($_GET['days']) : 5;
                    $response = $get->fetchWeather($city, $days);
    
                    error_log("Fetching weather for city: $city");
    
                    sendResponse($response);
                    break;
                
                case 'weather-lat-lon':
                    $latitude = $request[1];
                    $longitude = $request[2];
                    $response = $get->searchWeatherByCoords($latitude, $longitude);
                    
                    error_log("Fetching weather for coordinates: $latitude, $longitude");
                    
                    sendResponse($response);
                    break;
                        
                case 'city-suggestions':
                    $query = $request[1];
                    $response = $get->getCitySuggestions($query);
                    sendResponse($response);
                    break;
    
                default:
                    echo "Not Found";
                    http_response_code(404);
                    break;
            }
            break;
        }
    
    function sendResponse($data, $status = 200)
    {
        http_response_code($status);
        echo json_encode($data);
    }