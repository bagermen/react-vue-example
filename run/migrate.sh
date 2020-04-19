#!/bin/sh

./php.sh -r "
include __DIR__ .'/application/config/database.php';

\$connection = 'cltvui';
\$host = \$db[\$connection]['hostname'];
\$port = '3306';
\$database = \$db[\$connection]['database'];
\$username = \$db[\$connection]['username'];
\$password = \$db[\$connection]['password'];
\$charset = 'UTF8';

try {
    \$dbh = new \PDO(
        \"mysql:host=\$host;port=\$port;charset=\$charset\",
        \$username,
        \$password
    );
} catch (\PDOException \$e) {
    echo 'Couldn\'t connect to MySQL server. Error: '.\$e->getMessage().PHP_EOL;
    exit;
}

echo 'Common migration'.PHP_EOL;
\$dbh->exec(file_get_contents(__DIR__.'/setup/cltv.sql'));
\$dbh = null;
echo \"OK\".PHP_EOL;
echo 'Task migration'.PHP_EOL;
include __DIR__ .'/application/scripts/m_f1462.php';
echo \"OK\".PHP_EOL;
";
