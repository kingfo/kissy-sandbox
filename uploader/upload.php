<?php

// by longzang oicuicu@gmail.com
header("content-type:text/html; charset=UTF-8");
define('REST_FORMAT', 'xml');	
$uploaddir = './uploadfiles/';
$filename = $_FILES['Filedata']['name'];

$uploadfile = $uploaddir . $filename;
$uploadfile = iconv('utf-8', 'gb2312', $uploadfile);
move_uploaded_file($_FILES['Filedata']['tmp_name'], $uploadfile);

echo "path=abcdefg3444444444444444444444444444444";


?>