<!DOCTYPE html>
<html lang="es">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Recuperación de contraseña
    </title>

</head>

<body
    style="
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
    "
>

    <div
        style="
            width: 100%;
            padding: 40px 0;
        "
    >

        <div
            style="
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                padding: 40px;
                box-sizing: border-box;
            "
        >

            <h1
                style="
                    margin: 0 0 20px;
                    font-size: 26px;
                    color: #111827;
                "
            >
                TAP Terminal
            </h1>


            <h2
                style="
                    margin: 0 0 20px;
                    font-size: 20px;
                    color: #374151;
                "
            >
                Recuperación de contraseña
            </h2>


            <p
                style="
                    font-size: 15px;
                    line-height: 1.6;
                "
            >
                Recibimos una solicitud para restablecer la
                contraseña de tu cuenta de TAP Terminal.
            </p>


            <p
                style="
                    font-size: 15px;
                    line-height: 1.6;
                "
            >
                Para establecer una nueva contraseña,
                utiliza el siguiente botón:
            </p>


            <div
                style="
                    margin: 30px 0;
                    text-align: center;
                "
            >

                <a
                    href="{{ $resetUrl }}"
                    style="
                        display: inline-block;
                        padding: 14px 24px;
                        background-color: #2563eb;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 6px;
                        font-size: 15px;
                        font-weight: bold;
                    "
                >
                    Restablecer contraseña
                </a>

            </div>


            <p
                style="
                    font-size: 14px;
                    line-height: 1.6;
                    color: #4b5563;
                "
            >
                Este enlace es válido durante
                <strong>60 minutos</strong>.
            </p>


            <p
                style="
                    font-size: 14px;
                    line-height: 1.6;
                    color: #4b5563;
                "
            >
                Si tú no solicitaste este cambio,
                puedes ignorar este correo.
            </p>


            <hr
                style="
                    margin: 30px 0;
                    border: 0;
                    border-top: 1px solid #e5e7eb;
                "
            >


            <p
                style="
                    margin: 0;
                    font-size: 12px;
                    line-height: 1.5;
                    color: #6b7280;
                "
            >
                TAP Terminal<br>
                Este mensaje fue generado automáticamente.
                No es necesario responder a este correo.
            </p>

        </div>

    </div>

</body>

</html>