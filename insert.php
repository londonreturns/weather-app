<?php
	include 'connection.php';

	if ($_SERVER["REQUEST_METHOD"] == "POST") {
	    try {
	        $jsonData = file_get_contents("php://input");
	        if ($jsonData === false) {
	            throw new Exception("Error reading input data");
	        }

	        $data = json_decode($jsonData, true);
	        if ($data === null) {
	            throw new Exception("Error decoding JSON data");
	        }
			$sql = "INSERT INTO weather (
				city, 
				country,
				temperature,
				weather_condition,
				humidity,
				pressure,
				wind,
				sunrise,
				sunset,
				time_accessed,
				day_accessed,
				date_accessed,
				icon
			) VALUES (
				'{$data['name']}',
				'{$data['sys']['country']}',
				'{$data['main']['temp']}',
				'{$data['weather']['description']}',
				'{$data['main']['humidity']}',
				'{$data['main']['pressure']}',
				'{$data['wind']['speed']}',
				'{$data['sys']['sunrise']}',
				'{$data['sys']['sunset']}',
				'{$data['time']}',
				'{$data['day']}',
				STR_TO_DATE('{$data['date']}', '%m/%d/%Y'),
				'{$data['weather']['icon']}'
			)";

	        if ($conn->query($sql) === TRUE) {
	            header('Content-Type: application/json');
	            echo json_encode(['success' => true, 'message' => 'Data processed successfully']);
	        } else {
	            throw new Exception("Error inserting data: ");
	        }

	        $conn->close();
	    } catch (Exception $e) {
	        http_response_code(400);
	        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
	    }
	} else {
	    http_response_code(405);
	    echo json_encode(['success' => false, 'error' => 'Only POST requests are allowed']);
	}
