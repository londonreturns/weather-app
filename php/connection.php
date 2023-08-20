<?php
	// Setting variables
	$hostname = "localhost";
	$username = "root";
	$password = "";
	$dbname = "weather-app";

	// Connection
	$conn = mysqli_connect($hostname, $username, $password, $dbname);
// If connection failed
if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	}
