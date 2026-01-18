-- Script para inicializar tablas del sistema MySQL
-- Ejecutar cuando MySQL esté en modo seguro o después de recrear la BD mysql

USE mysql;

-- Tabla plugin (la que estaba causando el error principal)
CREATE TABLE IF NOT EXISTS plugin (
  name VARCHAR(64) NOT NULL DEFAULT '',
  dl VARCHAR(128) NOT NULL DEFAULT '',
  PRIMARY KEY (name)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='MySQL plugins';

-- Tabla servers
CREATE TABLE IF NOT EXISTS servers (
  Server_name CHAR(64) NOT NULL DEFAULT '',
  Host CHAR(64) NOT NULL DEFAULT '',
  Db CHAR(64) NOT NULL DEFAULT '',
  Username CHAR(64) NOT NULL DEFAULT '',
  Password CHAR(64) NOT NULL DEFAULT '',
  Port INT(4) UNSIGNED NOT NULL DEFAULT '0',
  Socket CHAR(64) NOT NULL DEFAULT '',
  Wrapper CHAR(64) NOT NULL DEFAULT '',
  Owner CHAR(64) NOT NULL DEFAULT '',
  PRIMARY KEY (Server_name)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='MySQL Foreign Servers table';

-- Tabla transaction_registry (para InnoDB)
CREATE TABLE IF NOT EXISTS transaction_registry (
  transaction_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  commit_id BIGINT(20) UNSIGNED NOT NULL,
  xid_format_id INT(11) NOT NULL,
  xid_gtrid_length INT(11) NOT NULL,
  xid_bqual_length INT(11) NOT NULL,
  xid_data BLOB NOT NULL,
  PRIMARY KEY (transaction_id),
  KEY commit_id (commit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Tabla user (mínima para permisos)
CREATE TABLE IF NOT EXISTS user (
  Host CHAR(60) BINARY NOT NULL DEFAULT '',
  User CHAR(80) BINARY NOT NULL DEFAULT '',
  Select_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Insert_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Update_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Delete_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Create_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Drop_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Reload_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Shutdown_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Process_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  File_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Grant_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  References_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Index_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Alter_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Show_db_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Super_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Create_tmp_table_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Lock_tables_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Execute_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Repl_slave_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Repl_client_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Create_view_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Show_view_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Create_routine_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Alter_routine_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Create_user_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Event_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Trigger_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Create_tablespace_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  ssl_type ENUM('','ANY','X509','SPECIFIED') NOT NULL DEFAULT '',
  ssl_cipher BLOB NOT NULL,
  x509_issuer BLOB NOT NULL,
  x509_subject BLOB NOT NULL,
  max_questions INT(11) UNSIGNED NOT NULL DEFAULT 0,
  max_updates INT(11) UNSIGNED NOT NULL DEFAULT 0,
  max_connections INT(11) UNSIGNED NOT NULL DEFAULT 0,
  max_user_connections INT(11) UNSIGNED NOT NULL DEFAULT 0,
  plugin CHAR(64) NOT NULL DEFAULT '',
  authentication_string TEXT,
  password_expired ENUM('N','Y') NOT NULL DEFAULT 'N',
  password_last_changed TIMESTAMP NULL DEFAULT NULL,
  password_lifetime SMALLINT(5) UNSIGNED DEFAULT NULL,
  account_locked ENUM('N','Y') NOT NULL DEFAULT 'N',
  PRIMARY KEY (Host,User)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Users and global privileges';

-- Insertar usuario root por defecto
INSERT IGNORE INTO user (Host, User, Select_priv, Insert_priv, Update_priv, Delete_priv, Create_priv, Drop_priv, Reload_priv, Shutdown_priv, Process_priv, File_priv, Grant_priv, References_priv, Index_priv, Alter_priv, Show_db_priv, Super_priv, Create_tmp_table_priv, Lock_tables_priv, Execute_priv, Repl_slave_priv, Repl_client_priv, Create_view_priv, Show_view_priv, Create_routine_priv, Alter_routine_priv, Create_user_priv, Event_priv, Trigger_priv, Create_tablespace_priv) 
VALUES ('localhost', 'root', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'),
       ('127.0.0.1', 'root', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'),
       ('::1', 'root', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'),
       ('localhost', '', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N');

-- Tabla db (permisos por base de datos)
CREATE TABLE IF NOT EXISTS db (
  Host CHAR(60) BINARY NOT NULL DEFAULT '',
  Db CHAR(64) BINARY NOT NULL DEFAULT '',
  User CHAR(80) BINARY NOT NULL DEFAULT '',
  Select_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Insert_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Update_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Delete_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Create_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Drop_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Grant_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  References_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Index_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Alter_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Create_tmp_table_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Lock_tables_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Create_view_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Show_view_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Create_routine_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Alter_routine_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Execute_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Event_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Trigger_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  PRIMARY KEY (Host,Db,User)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Database privileges';

-- Tabla host
CREATE TABLE IF NOT EXISTS host (
  Host CHAR(60) BINARY NOT NULL DEFAULT '',
  Db CHAR(64) BINARY NOT NULL DEFAULT '',
  Select_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Insert_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Update_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Delete_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Create_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Drop_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Grant_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  References_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Index_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Alter_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Create_tmp_table_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  Lock_tables_priv ENUM('N','Y') NOT NULL DEFAULT 'N',
  PRIMARY KEY (Host,Db)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Host privileges;  Merged with database privileges';

-- Tabla tables_priv
CREATE TABLE IF NOT EXISTS tables_priv (
  Host CHAR(60) BINARY NOT NULL DEFAULT '',
  Db CHAR(64) BINARY NOT NULL DEFAULT '',
  User CHAR(80) BINARY NOT NULL DEFAULT '',
  Table_name CHAR(64) BINARY NOT NULL DEFAULT '',
  Grantor CHAR(141) NOT NULL DEFAULT '',
  Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  Table_priv SET('Select','Insert','Update','Delete','Create','Drop','Grant','References','Index','Alter','Create View','Show view','Trigger') NOT NULL DEFAULT '',
  Column_priv SET('Select','Insert','Update','References') NOT NULL DEFAULT '',
  PRIMARY KEY (Host,Db,User,Table_name)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Table privileges';

-- Tabla columns_priv
CREATE TABLE IF NOT EXISTS columns_priv (
  Host CHAR(60) BINARY NOT NULL DEFAULT '',
  Db CHAR(64) BINARY NOT NULL DEFAULT '',
  User CHAR(80) BINARY NOT NULL DEFAULT '',
  Table_name CHAR(64) BINARY NOT NULL DEFAULT '',
  Column_name CHAR(64) BINARY NOT NULL DEFAULT '',
  Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  Column_priv SET('Select','Insert','Update','References') NOT NULL DEFAULT '',
  PRIMARY KEY (Host,Db,User,Table_name,Column_name)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Column privileges';

-- Tabla procs_priv
CREATE TABLE IF NOT EXISTS procs_priv (
  Host CHAR(60) BINARY NOT NULL DEFAULT '',
  Db CHAR(64) BINARY NOT NULL DEFAULT '',
  User CHAR(80) BINARY NOT NULL DEFAULT '',
  Routine_name CHAR(64) BINARY NOT NULL DEFAULT '',
  Routine_type ENUM('FUNCTION','PROCEDURE') NOT NULL,
  Grantor CHAR(141) NOT NULL DEFAULT '',
  Proc_priv SET('Execute','Alter Routine','Grant') NOT NULL DEFAULT '',
  Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Host,Db,User,Routine_name,Routine_type)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Procedure privileges';

-- Tabla proxies_priv
CREATE TABLE IF NOT EXISTS proxies_priv (
  Host CHAR(60) BINARY NOT NULL DEFAULT '',
  User CHAR(80) BINARY NOT NULL DEFAULT '',
  Proxied_host CHAR(60) BINARY NOT NULL DEFAULT '',
  Proxied_user CHAR(80) BINARY NOT NULL DEFAULT '',
  With_grant BOOLEAN NOT NULL DEFAULT FALSE,
  Grantor CHAR(141) NOT NULL DEFAULT '',
  Timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Host,User,Proxied_host,Proxied_user)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='User proxy privileges';

-- Tabla roles_mapping
CREATE TABLE IF NOT EXISTS roles_mapping (
  Host CHAR(60) BINARY NOT NULL DEFAULT '',
  User CHAR(80) BINARY NOT NULL DEFAULT '',
  Role CHAR(80) BINARY NOT NULL DEFAULT '',
  Admin_option ENUM('N','Y') NOT NULL DEFAULT 'N',
  PRIMARY KEY (Host,User,Role)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Granted roles';

-- Tabla time_zone
CREATE TABLE IF NOT EXISTS time_zone (
  Time_zone_id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  Use_leap_seconds ENUM('Y','N') NOT NULL DEFAULT 'N',
  PRIMARY KEY (Time_zone_id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Time zones';

-- Tabla time_zone_name
CREATE TABLE IF NOT EXISTS time_zone_name (
  Name CHAR(64) NOT NULL,
  Time_zone_id INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (Name)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Time zone names';

-- Tabla time_zone_transition
CREATE TABLE IF NOT EXISTS time_zone_transition (
  Time_zone_id INT(10) UNSIGNED NOT NULL,
  Transition_time BIGINT(20) NOT NULL,
  Transition_type_id INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (Time_zone_id,Transition_time)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Time zone transitions';

-- Tabla time_zone_transition_type
CREATE TABLE IF NOT EXISTS time_zone_transition_type (
  Time_zone_id INT(10) UNSIGNED NOT NULL,
  Transition_type_id INT(10) UNSIGNED NOT NULL,
  Offset INT(11) NOT NULL DEFAULT 0,
  Is_DST TINYINT(3) UNSIGNED NOT NULL DEFAULT 0,
  Abbreviation CHAR(8) NOT NULL DEFAULT '',
  PRIMARY KEY (Time_zone_id,Transition_type_id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Time zone transition types';

-- Tabla time_zone_leap_second
CREATE TABLE IF NOT EXISTS time_zone_leap_second (
  Transition_time BIGINT(20) NOT NULL,
  Correction INT(11) NOT NULL,
  PRIMARY KEY (Transition_time)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Leap seconds information for time zones';

-- Tabla func
CREATE TABLE IF NOT EXISTS func (
  name CHAR(64) NOT NULL DEFAULT '',
  ret TINYINT(1) NOT NULL DEFAULT '0',
  dl CHAR(128) NOT NULL DEFAULT '',
  type ENUM('function','aggregate') NOT NULL,
  PRIMARY KEY (name)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='User defined functions';

-- Tabla proc
CREATE TABLE IF NOT EXISTS proc (
  db CHAR(64) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '',
  name CHAR(64) NOT NULL DEFAULT '',
  type ENUM('FUNCTION','PROCEDURE') NOT NULL,
  specific_name CHAR(64) NOT NULL DEFAULT '',
  language ENUM('SQL') NOT NULL DEFAULT 'SQL',
  sql_data_access ENUM('CONTAINS_SQL','NO_SQL','READS_SQL_DATA','MODIFIES_SQL_DATA') NOT NULL DEFAULT 'CONTAINS_SQL',
  is_deterministic ENUM('YES','NO') NOT NULL DEFAULT 'NO',
  security_type ENUM('INVOKER','DEFINER') NOT NULL DEFAULT 'DEFINER',
  param_list BLOB NOT NULL,
  returns LONGTEXT CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  body LONGTEXT NOT NULL,
  definer CHAR(141) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '',
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  sql_mode SET('REAL_AS_FLOAT','PIPES_AS_CONCAT','ANSI_QUOTES','IGNORE_SPACE','NOT_USED','ONLY_FULL_GROUP_BY','NO_UNSIGNED_SUBTRACTION','NO_DIR_IN_CREATE','POSTGRESQL','ORACLE','MSSQL','DB2','MAXDB','NO_KEY_OPTIONS','NO_TABLE_OPTIONS','NO_FIELD_OPTIONS','MYSQL323','MYSQL40','ANSI','NO_AUTO_VALUE_ON_ZERO','NO_BACKSLASH_ESCAPES','STRICT_TRANS_TABLES','STRICT_ALL_TABLES','NO_ZERO_IN_DATE','NO_ZERO_DATE','INVALID_DATES','ERROR_FOR_DIVISION_BY_ZERO','TRADITIONAL','NO_AUTO_CREATE_USER','HIGH_NOT_PRECEDENCE','NO_ENGINE_SUBSTITUTION','PAD_CHAR_TO_FULL_LENGTH') NOT NULL DEFAULT '',
  comment TEXT CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  character_set_client CHAR(32) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  collation_connection CHAR(32) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  db_collation CHAR(32) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  body_utf8 LONGTEXT CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (db,name,type)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Stored Procedures';

-- Tabla event
CREATE TABLE IF NOT EXISTS event (
  db CHAR(64) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '',
  name CHAR(64) NOT NULL DEFAULT '',
  body LONGTEXT NOT NULL,
  definer CHAR(141) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '',
  execute_at DATETIME DEFAULT NULL,
  interval_value INT(11) DEFAULT NULL,
  interval_field ENUM('YEAR','QUARTER','MONTH','DAY','HOUR','MINUTE','WEEK','SECOND','MICROSECOND') DEFAULT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  last_executed DATETIME DEFAULT NULL,
  starts DATETIME DEFAULT NULL,
  ends DATETIME DEFAULT NULL,
  status ENUM('ENABLED','DISABLED','SLAVESIDE_DISABLED') NOT NULL DEFAULT 'ENABLED',
  on_completion ENUM('DROP','PRESERVE') NOT NULL DEFAULT 'DROP',
  sql_mode SET('REAL_AS_FLOAT','PIPES_AS_CONCAT','ANSI_QUOTES','IGNORE_SPACE','NOT_USED','ONLY_FULL_GROUP_BY','NO_UNSIGNED_SUBTRACTION','NO_DIR_IN_CREATE','POSTGRESQL','ORACLE','MSSQL','DB2','MAXDB','NO_KEY_OPTIONS','NO_TABLE_OPTIONS','NO_FIELD_OPTIONS','MYSQL323','MYSQL40','ANSI','NO_AUTO_VALUE_ON_ZERO','NO_BACKSLASH_ESCAPES','STRICT_TRANS_TABLES','STRICT_ALL_TABLES','NO_ZERO_IN_DATE','NO_ZERO_DATE','INVALID_DATES','ERROR_FOR_DIVISION_BY_ZERO','TRADITIONAL','NO_AUTO_CREATE_USER','HIGH_NOT_PRECEDENCE','NO_ENGINE_SUBSTITUTION','PAD_CHAR_TO_FULL_LENGTH') NOT NULL DEFAULT '',
  comment TEXT CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  originator INT(10) UNSIGNED NOT NULL,
  time_zone CHAR(64) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'SYSTEM',
  character_set_client CHAR(32) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  collation_connection CHAR(32) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  db_collation CHAR(32) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  body_utf8 LONGTEXT CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (db,name)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='Events';

-- Tabla general_log
CREATE TABLE IF NOT EXISTS general_log (
  event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_host MEDIUMTEXT NOT NULL,
  thread_id BIGINT(21) UNSIGNED NOT NULL,
  server_id INT(10) UNSIGNED NOT NULL,
  command_type VARCHAR(64) NOT NULL,
  argument MEDIUMTEXT NOT NULL
) ENGINE=CSV DEFAULT CHARSET=utf8 COMMENT='General log';

-- Tabla slow_log
CREATE TABLE IF NOT EXISTS slow_log (
  start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_host MEDIUMTEXT NOT NULL,
  query_time TIME NOT NULL,
  lock_time TIME NOT NULL,
  rows_sent INT(11) NOT NULL,
  rows_examined INT(11) NOT NULL,
  db VARCHAR(512) NOT NULL,
  last_insert_id INT(11) NOT NULL,
  insert_id INT(11) NOT NULL,
  server_id INT(10) UNSIGNED NOT NULL,
  sql_text MEDIUMTEXT NOT NULL,
  thread_id BIGINT(21) UNSIGNED NOT NULL
) ENGINE=CSV DEFAULT CHARSET=utf8 COMMENT='Slow log';





