<?php

require_once '../core/init.php';

assert_logged_in();

if ($_SERVER['REQUEST_METHOD'] == 'POST')
{
	try
	{
		$store = OAuthStore::instance();
		$user_id = 1; // this should not be hardcoded, of course
		$key   = $store->updateConsumer($_POST, $user_id, true);

		$c = $store->getConsumer($key, $user_id);
		echo 'Your consumer key is: <strong>' . $c['consumer_key'] . '</strong><br />';
		echo 'Your consumer secret is: <strong>' . $c['consumer_secret'] . '</strong><br />';
	}
	catch (OAuthException2 $e)
	{
		echo '<strong>Error: ' . $e->getMessage() . '</strong><br />';
	}
}
		

$smarty = session_smarty();
$smarty->display('register.tpl');

?>