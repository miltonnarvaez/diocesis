@echo off
echo Ejecutando SQL para crear usuario administrador...
echo.

REM Intentar conectar a MySQL de XAMPP
"C:\xampp\mysql\bin\mysql.exe" -u root -e "USE diocesis; INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES ('Administrador', 'admin@diocesis.gov.co', '$2a$10$XUcgfUsHDBXwwA9fT0hP0efRLwzcIPtzcYBaThgzpJSsKmY7S6/ly', 'admin', 1) ON DUPLICATE KEY UPDATE nombre = 'Administrador', password = '$2a$10$XUcgfUsHDBXwwA9fT0hP0efRLwzcIPtzcYBaThgzpJSsKmY7S6/ly', rol = 'admin', activo = 1;"

if %errorlevel% == 0 (
    echo.
    echo ✅ Usuario creado exitosamente!
    echo.
    echo Credenciales:
    echo   Email: admin@diocesis.gov.co
    echo   Contraseña: admin123
) else (
    echo.
    echo ❌ Error al crear el usuario.
    echo Verifica que MySQL esté corriendo en XAMPP.
)

pause
